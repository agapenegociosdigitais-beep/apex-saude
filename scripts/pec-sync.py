#!/usr/bin/env python3
"""
APEX Saude - PEC Sync Script
Roda na VPS (23.106.45.137) via cron todo dia as 6h.

Fluxo:
1. Conecta no PostgreSQL do PEC da prefeitura (read-only)
2. Executa 15 queries (C1-C7, B1-B6, M1-M2)
3. Calcula valores dos indicadores
4. Envia resultados para o Supabase via REST API
5. Registra log de execucao
"""

import os
import sys
import json
import time
from datetime import date, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Instalando psycopg2...")
    os.system("pip3 install psycopg2-binary -q")
    import psycopg2
    import psycopg2.extras

# ============================================
# CONFIGURACAO (variaveis de ambiente)
# ============================================

PEC_HOST = os.getenv("PEC_HOST", "localhost")
PEC_PORT = int(os.getenv("PEC_PORT", "5432"))
PEC_DB = os.getenv("PEC_DB", "esus")
PEC_USER = os.getenv("PEC_USER", "apex_readonly")
PEC_PASS = os.getenv("PEC_PASS", "")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # service_role key

EQUIPE_INE = os.getenv("EQUIPE_INE", "").split(",")
MUNICIPIO_ID = os.getenv("MUNICIPIO_ID", "")

# ============================================
# QUERIES SQL (15 indicadores NT 6/2025)
# ============================================

QUERIES = {
    "C1": """SELECT COUNT(DISTINCT a.cns_cidadao) as atendidos,
        (SELECT COUNT(*) FROM tb_cidadao) as cadastrados
        FROM tb_ficha_atendimento_individual a
        WHERE a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s""",

    "C2": """SELECT COUNT(DISTINCT c.cns_cidadao) as criancas,
        (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento >= %(dois_anos)s) as total
        FROM tb_cidadao c INNER JOIN tb_ficha_atendimento_individual a
        ON a.cns_cidadao = c.cns_cidadao AND a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s
        WHERE c.dt_nascimento >= %(dois_anos)s""",

    "C3": """WITH gestantes AS (
        SELECT DISTINCT cns_cidadao FROM tb_ficha_atendimento_individual
        WHERE dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND st_gestante = true
        GROUP BY cns_cidadao HAVING COUNT(*) >= 3)
        SELECT (SELECT COUNT(*) FROM gestantes) as gestantes""",

    "C4": """SELECT COUNT(DISTINCT p.cns_cidadao) as exames,
        (SELECT COUNT(*) FROM tb_cidadao c INNER JOIN tb_condicao_avaliada ca
        ON ca.cns_cidadao = c.cns_cidadao WHERE ca.st_diabetes = true) as total
        FROM tb_ficha_procedimentos p WHERE p.dt_realizacao BETWEEN %(inicio)s AND %(fim)s
        AND p.co_procedimento IN ('0202010420','0202010412')""",

    "C5": """SELECT COUNT(DISTINCT a.cns_cidadao) as pa_aferida,
        (SELECT COUNT(*) FROM tb_cidadao c INNER JOIN tb_condicao_avaliada ca
        ON ca.cns_cidadao = c.cns_cidadao WHERE ca.st_hipertensao = true) as total
        FROM tb_ficha_atendimento_individual a
        WHERE a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND a.st_pressao_arterial = true""",

    "C6": """SELECT COUNT(DISTINCT c.cns_cidadao) as idosos,
        (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento <= %(sessenta_anos)s) as total
        FROM tb_cidadao c INNER JOIN tb_ficha_atendimento_individual a
        ON a.cns_cidadao = c.cns_cidadao AND a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s
        WHERE c.dt_nascimento <= %(sessenta_anos)s""",

    "C7": """SELECT COUNT(DISTINCT p.cns_cidadao) as rastreadas,
        (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento BETWEEN %(idade_25)s AND %(idade_64)s
        AND nu_sexo = 'F') as total
        FROM tb_ficha_procedimentos p INNER JOIN tb_cidadao c ON c.cns_cidadao = p.cns_cidadao
        WHERE p.dt_realizacao BETWEEN %(inicio)s AND %(fim)s
        AND p.co_procedimento IN ('0203010019','0203010027')
        AND c.dt_nascimento BETWEEN %(idade_25)s AND %(idade_64)s AND c.nu_sexo = 'F'""",

    "B1": """SELECT COUNT(DISTINCT a.cns_cidadao) as primeira_consulta,
        (SELECT COUNT(*) FROM tb_cidadao) as total
        FROM tb_ficha_atendimento_odontologico a
        WHERE a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND a.st_primeira_consulta = true""",

    "B2": """SELECT COUNT(DISTINCT a.cns_cidadao) as concluidos,
        (SELECT COUNT(DISTINCT a2.cns_cidadao) FROM tb_ficha_atendimento_odontologico a2
        WHERE a2.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND a2.st_primeira_consulta = true) as iniciados
        FROM tb_ficha_atendimento_odontologico a
        WHERE a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND a.st_tratamento_concluido = true""",

    "B3": """SELECT COUNT(*) FILTER (WHERE co_procedimento IN ('0307010048','0307010056','0307010064')) as exodontias,
        COUNT(*) as total FROM tb_ficha_procedimentos
        WHERE dt_realizacao BETWEEN %(inicio)s AND %(fim)s AND co_procedimento LIKE '03%%'""",

    "B4": """SELECT COUNT(DISTINCT a.cns_cidadao) as gestantes,
        (SELECT COUNT(DISTINCT fa.cns_cidadao) FROM tb_ficha_atendimento_individual fa
        WHERE fa.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND fa.st_gestante = true) as total
        FROM tb_ficha_atendimento_odontologico a
        INNER JOIN tb_ficha_atendimento_individual ai ON ai.cns_cidadao = a.cns_cidadao
        AND ai.dt_atendimento BETWEEN %(inicio)s AND %(fim)s AND ai.st_gestante = true
        WHERE a.dt_atendimento BETWEEN %(inicio)s AND %(fim)s""",

    "B5": """SELECT COUNT(*) as escovacoes
        FROM tb_ficha_atividade_coletiva
        WHERE dt_atividade BETWEEN %(inicio)s AND %(fim)s
        AND co_atividade IN ('0302010108','0302010116')""",

    "B6": """SELECT COUNT(*) as fluoretacoes
        FROM tb_ficha_atividade_coletiva
        WHERE dt_atividade BETWEEN %(inicio)s AND %(fim)s
        AND co_atividade IN ('0302010124','0302010132')""",

    "M1": """SELECT COUNT(*) as atendimentos
        FROM tb_ficha_atendimento_individual
        WHERE dt_atendimento BETWEEN %(inicio)s AND %(fim)s
        AND co_cbo_profissional IN ('251510','223710','223605','224120','223505','251605','223810','223905','223910','223915')""",

    "M2": """SELECT COUNT(*) as coletivas
        FROM tb_ficha_atividade_coletiva
        WHERE dt_atividade BETWEEN %(inicio)s AND %(fim)s""",
}

# ============================================
# CONEXAO PEC
# ============================================

def conectar_pec():
    conn = psycopg2.connect(
        host=PEC_HOST, port=PEC_PORT, dbname=PEC_DB,
        user=PEC_USER, password=PEC_PASS,
        connect_timeout=10,
        options='-c statement_timeout=30000'
    )
    conn.set_session(readonly=True, autocommit=True)
    return conn

# ============================================
# EXECUTAR QUERIES
# ============================================

def executar_queries(conn, inicio, fim):
    hoje = date.today()
    params = {
        'inicio': inicio,
        'fim': fim,
        'dois_anos': str(hoje.replace(year=hoje.year - 2)),
        'sessenta_anos': str(hoje.replace(year=hoje.year - 60)),
        'idade_25': str(hoje.replace(year=hoje.year - 25)),
        'idade_64': str(hoje.replace(year=hoje.year - 64)),
    }
    
    resultados = {}
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        for codigo, query in QUERIES.items():
            try:
                t0 = time.time()
                cur.execute(query, params)
                row = cur.fetchone()
                elapsed = time.time() - t0
                
                if row:
                    keys = list(row.keys())
                    numerador_key = [k for k in keys if k not in ('total','cadastrados','iniciados')][0]
                    denominador_key = next((k for k in keys if k in ('total','cadastrados','iniciados')), None)
                    
                    numerador = int(row[numerador_key] or 0)
                    denominador = int(row[denominador_key] or 1) if denominador_key else 1
                    
                    valor = round((numerador / denominador) * 100, 2) if denominador > 0 else 0.0
                    
                    resultados[codigo] = {
                        'valor': valor, 'numerador': numerador,
                        'denominador': denominador, 'tempo_ms': round(elapsed * 1000)
                    }
                    print(f"  {codigo}: {valor:.1f}% ({numerador}/{denominador}) - {elapsed*1000:.0f}ms")
                else:
                    resultados[codigo] = {'valor': 0.0, 'numerador': 0, 'denominador': 1, 'tempo_ms': round(elapsed * 1000)}
                    print(f"  {codigo}: SEM DADOS")
            except Exception as e:
                print(f"  ERRO {codigo}: {e}")
                resultados[codigo] = {'valor': None, 'erro': str(e)}
    
    return resultados

# ============================================
# ENVIAR PARA SUPABASE
# ============================================

def enviar_supabase(resultados, equipe_ine, inicio):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("AVISO: SUPABASE_URL/KEY nao configurados. Pulando envio.")
        return 0
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
    }
    
    enviados = 0
    for codigo, dados in resultados.items():
        if dados['valor'] is None:
            continue
        
        body = json.dumps({
            'codigo': codigo,
            'equipe_ine': equipe_ine,
            'valor': dados['valor'],
            'periodo': inicio,
            'municipio_id': MUNICIPIO_ID,
            'sync_em': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        })
        
        req = Request(f'{SUPABASE_URL}/rest/v1/rpc/sync_indicador_pec', data=body.encode(), headers=headers)
        try:
            urlopen(req, timeout=15)
            enviados += 1
        except URLError as e:
            print(f"  ERRO envio {codigo}: {e}")
    
    return enviados

# ============================================
# MAIN
# ============================================

def main():
    inicio = (date.today().replace(day=1)).isoformat()
    fim = date.today().isoformat()
    
    print(f"[APEX PEC Sync] {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Periodo: {inicio} a {fim}")
    print(f"  PEC: {PEC_HOST}:{PEC_PORT}/{PEC_DB}")
    print(f"  Equipes: {EQUIPE_INE}")
    print()
    
    try:
        conn = conectar_pec()
        print(f"  Conectado ao PEC (PostgreSQL)")
        
        total_enviados = 0
        for equipe_ine in EQUIPE_INE:
            equipe_ine = equipe_ine.strip()
            print(f"\n  === Equipe {equipe_ine} ===")
            resultados = executar_queries(conn, inicio, fim)
            enviados = enviar_supabase(resultados, equipe_ine, inicio)
            total_enviados += enviados
        
        conn.close()
        
        ok = sum(1 for r in resultados.values() if r['valor'] is not None)
        erros = sum(1 for r in resultados.values() if r['valor'] is None)
        
        print(f"\n[OK] {ok} indicadores atualizados, {erros} erros, {total_enviados} enviados ao Supabase")
        sys.exit(0 if erros == 0 else 1)
        
    except Exception as e:
        print(f"\n[FALHA] {e}")
        sys.exit(2)

if __name__ == '__main__':
    main()

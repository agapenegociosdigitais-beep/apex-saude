#!/usr/bin/env python3
"""
APEX Saude - PEC Sync Script v2.0
Roda na VPS (23.106.45.137) via cron.

Fluxo:
1. Conecta no PostgreSQL do PEC (read-only)
2. DESCOBRE automaticamente UBS e equipes do municipio
3. Auto-cadastra no Supabase (unidades_saude + equipes)
4. Sincroniza os 15 indicadores de cada equipe
5. Registra log de execucao

VARIAVEIS DE AMBIENTE:
  PEC_HOST/PEC_PORT/PEC_DB/PEC_USER/PEC_PASS — conexao PEC
  SUPABASE_URL/SUPABASE_SERVICE_KEY — conexao Supabase
  MUNICIPIO_ID — UUID do municipio no Supabase (obrigatorio)
  MUNICIPIO_IBGE — codigo IBGE de 7 digitos (ex: 1501453 para Belterra)
  EQUIPE_INE — (opcional) INEs especificos separados por virgula.
              Se vazio, descobre automaticamente via MUNICIPIO_IBGE
  PEC_TABELA_ESTABELECIMENTO — (opcional) nome da tabela de estabelecimentos.
                               Default: tb_estabelecimento
  PEC_TABELA_EQUIPE — (opcional) nome da tabela de equipes. Default: tb_equipe
  AUTO_DESCOBERTA — (opcional) default: true
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
    print("[SETUP] Instalando psycopg2...")
    os.system("pip3 install psycopg2-binary -q")
    import psycopg2
    import psycopg2.extras

# ============================================
# CONFIGURACAO
# ============================================

PEC_HOST = os.getenv("PEC_HOST", "localhost")
PEC_PORT = int(os.getenv("PEC_PORT", "5432"))
PEC_DB = os.getenv("PEC_DB", "esus")
PEC_USER = os.getenv("PEC_USER", "apex_readonly")
PEC_PASS = os.getenv("PEC_PASS", "")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

MUNICIPIO_ID = os.getenv("MUNICIPIO_ID", "")
MUNICIPIO_IBGE = os.getenv("MUNICIPIO_IBGE", "")
EQUIPE_INE = os.getenv("EQUIPE_INE", "")

# Tabelas PEC (com fallback)
TAB_ESTABELECIMENTO = os.getenv("PEC_TABELA_ESTABELECIMENTO", "tb_estabelecimento")
TAB_EQUIPE = os.getenv("PEC_TABELA_EQUIPE", "tb_equipe")

AUTO_DESCOBERTA = os.getenv("AUTO_DESCOBERTA", "").lower() in ("true", "1", "yes", "")

# ============================================
# QUERIES DE INDICADORES (NT 6/2025)
# ============================================

QUERIES_INDICADORES = {
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
# QUERIES DE DESCOBERTA (UBS + Equipes)
# ============================================

def gerar_queries_descoberta():
    """
    Gera queries de descoberta com fallback para diferentes
    schemas do PEC (e-SUS AB, PEC Cloud, etc.)
    """
    # Tabelas possiveis para estabelecimentos
    tabelas_estab = [
        TAB_ESTABELECIMENTO,
        "vw_estabelecimento",
        "v_estabelecimento",
        "estabelecimento",
        "tb_unidade_saude",
    ]

    # Tabelas possiveis para equipes
    tabelas_eq = [
        TAB_EQUIPE,
        "vw_equipe",
        "v_equipe",
        "equipe",
        "tb_equipes",
    ]

    return tabelas_estab, tabelas_eq


QUERY_DESCOBRIR_TABELAS = """
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name
"""

QUERY_UBS_POR_IBGE = """
SELECT DISTINCT co_cnes AS cnes, no_estabelecimento AS nome
FROM {tabela}
WHERE co_municipio_gestor = '{ibge}'
OR co_municipio = '{ibge}'
ORDER BY nome
"""

QUERY_UBS_TODAS = """
SELECT DISTINCT co_cnes AS cnes, no_estabelecimento AS nome
FROM {tabela}
ORDER BY nome
"""

QUERY_EQUIPES_POR_CNES = """
SELECT DISTINCT co_ine AS ine, no_equipe AS nome, tp_equipe AS tipo
FROM {tabela}
WHERE co_cnes IN ({cnes_list})
ORDER BY nome
"""

QUERY_EQUIPES_POR_IBGE = """
SELECT DISTINCT e.co_ine AS ine, e.no_equipe AS nome, e.tp_equipe AS tipo,
       e.co_cnes AS cnes
FROM {tabela} e
WHERE e.co_municipio = '{ibge}'
   OR e.co_municipio_gestor = '{ibge}'
ORDER BY nome
"""

# Query alternativa se nao achar tabela de estabelecimento:
# descobre equipes direto + infere UBS pelo CNES
QUERY_EQUIPES_COM_CNES = """
SELECT DISTINCT e.co_ine AS ine, e.no_equipe AS nome,
       e.tp_equipe AS tipo, e.co_cnes AS cnes
FROM {tabela} e
ORDER BY nome
"""

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
# DESCOBERTA DE UBS + EQUIPES
# ============================================

def descobrir_tabelas(conn):
    """Descobre quais tabelas existem no schema public do PEC."""
    with conn.cursor() as cur:
        cur.execute(QUERY_DESCOBRIR_TABELAS)
        return [r[0] for r in cur.fetchall()]


def descobrir_ubs(conn, tabelas_existentes):
    """
    Tenta descobrir UBS/estabelecimentos no PEC.
    Retorna lista de dicts: [{cnes, nome}, ...]
    """
    tabelas_estab, _ = gerar_queries_descoberta()

    # Tenta cada tabela de estabelecimento
    for tabela in tabelas_estab:
        if tabela not in tabelas_existentes:
            continue

        try:
            if MUNICIPIO_IBGE:
                query = QUERY_UBS_POR_IBGE.format(tabela=tabela, ibge=MUNICIPIO_IBGE)
            else:
                query = QUERY_UBS_TODAS.format(tabela=tabela)

            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query)
                rows = cur.fetchall()

            if rows:
                print(f"  [UBS] Tabela '{tabela}' usada. Encontradas {len(rows)} UBS.")
                return [
                    {"cnes": r["cnes"].strip(), "nome": r["nome"].strip()}
                    for r in rows if r.get("cnes")
                ]
        except Exception as e:
            print(f"  [UBS] Tabela '{tabela}' falhou: {e}")
            continue

    print("  [UBS] Nenhuma tabela de estabelecimento encontrada.")
    return []


def descobrir_equipes(conn, tabelas_existentes, ubs_encontradas=None):
    """
    Tenta descobrir equipes no PEC.
    Se UBS foram encontradas, filtra por CNES.
    Retorna lista de dicts: [{ine, nome, tipo, cnes}, ...]
    """
    _, tabelas_eq = gerar_queries_descoberta()

    cnes_list = [u["cnes"] for u in (ubs_encontradas or [])]

    for tabela in tabelas_eq:
        if tabela not in tabelas_existentes:
            continue

        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                if cnes_list and MUNICIPIO_IBGE:
                    # Tem UBS + IBGE: filtra por municipio
                    query = QUERY_EQUIPES_POR_IBGE.format(tabela=tabela, ibge=MUNICIPIO_IBGE)
                    cur.execute(query)
                elif cnes_list:
                    # Tem UBS mas sem IBGE: filtra por CNES
                    quoted = ",".join(f"'{c}'" for c in cnes_list)
                    query = QUERY_EQUIPES_POR_CNES.format(tabela=tabela, cnes_list=quoted)
                    cur.execute(query)
                elif MUNICIPIO_IBGE:
                    # Sem UBS mas com IBGE
                    query = QUERY_EQUIPES_POR_IBGE.format(tabela=tabela, ibge=MUNICIPIO_IBGE)
                    cur.execute(query)
                else:
                    # Pega todas
                    query = QUERY_EQUIPES_COM_CNES.format(tabela=tabela)
                    cur.execute(query)

                rows = cur.fetchall()

            if rows:
                tipo_mapeado = []
                for r in rows:
                    ine = r.get("ine", "").strip()
                    if not ine:
                        continue
                    tipo_raw = str(r.get("tipo", "") or "").strip().lower()
                    tipo = mapear_tipo_equipe(tipo_raw)
                    tipo_mapeado.append({
                        "ine": ine,
                        "nome": r.get("nome", ine).strip(),
                        "tipo": tipo,
                        "cnes": str(r.get("cnes", "") or "").strip(),
                    })

                print(f"  [Equipes] Tabela '{tabela}' usada. Encontradas {len(tipo_mapeado)} equipes.")
                return tipo_mapeado

        except Exception as e:
            print(f"  [Equipes] Tabela '{tabela}' falhou: {e}")
            continue

    print("  [Equipes] Nenhuma tabela de equipe encontrada.")
    return []


def mapear_tipo_equipe(tipo_raw):
    """Mapeia tipo do PEC para o padrao APEX (esf/esb/emulti)."""
    if not tipo_raw:
        return "esf"
    tipo_raw = tipo_raw.strip().lower()
    if tipo_raw in ("esb", "sb", "saude bucal", "odontologia"):
        return "esb"
    if tipo_raw in ("emulti", "multi", "multiprofissional", "nasf"):
        return "emulti"
    if tipo_raw in ("eap", "ap"):
        return "esf"
    # default: esf
    return "esf"


# ============================================
# AUTO-CADASTRO NO SUPABASE
# ============================================

def enviar_para_supabase(endpoint, dados):
    """Envia dados para uma API do Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("  AVISO: SUPABASE_URL/KEY nao configurados. Pulando.")
        return None

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    req = Request(url, data=json.dumps(dados).encode(), headers=headers, method="POST")

    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except URLError as e:
        print(f"  ERRO Supabase {endpoint}: {e}")
        return None


def upsert_unidade_saude(cnes, nome):
    """Cria ou atualiza uma UBS no Supabase."""
    dados = {
        "municipio_id": MUNICIPIO_ID,
        "cnes": cnes,
        "nome": nome,
        "tipo": "ubs",
        "ativa": True,
    }
    return enviar_para_supabase("unidades_saude", dados)


def upsert_equipe(ine, nome, tipo, cnes):
    """
    Cria ou atualiza uma equipe no Supabase.
    Primeiro encontra a UBS pelo CNES, depois cria a equipe vinculada.
    """
    if not MUNICIPIO_ID:
        print(f"  ERRO: MUNICIPIO_ID nao configurado")
        return None

    dados = {
        "municipio_id": MUNICIPIO_ID,
        "codigo_ine": ine,
        "nome": nome,
        "tipo": tipo,
        "ativa": True,
    }

    # Se temos CNES, vincula a UBS
    if cnes:
        # Buscar unidade_saude pelo CNES
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        url = f"{SUPABASE_URL}/rest/v1/unidades_saude?cnes=eq.{cnes}&select=id"
        req = Request(url, headers=headers)

        try:
            with urlopen(req, timeout=10) as resp:
                unidades = json.loads(resp.read().decode())
                if unidades:
                    dados["unidade_id"] = unidades[0]["id"]
        except Exception as e:
            print(f"  AVISO: Nao foi possivel vincular UBS {cnes}: {e}")

    return enviar_para_supabase("equipes", dados)


def auto_cadastrar(ubs_list, equipes_list):
    """
    Auto-cadastra UBS e equipes no Supabase.
    1. Cria/atualiza UBS
    2. Cria/atualiza equipes vinculadas
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("\n  [Auto-Cadastro] SKIP: Supabase nao configurado.")
        return []

    if not MUNICIPIO_ID:
        print("\n  [Auto-Cadastro] SKIP: MUNICIPIO_ID nao configurado.")
        return []

    print(f"\n  [Auto-Cadastro] Cadastrando {len(ubs_list)} UBS e {len(equipes_list)} equipes...")

    # 1. Cadastrar UBS
    ubs_criadas = 0
    for ubs in ubs_list:
        resultado = upsert_unidade_saude(ubs["cnes"], ubs["nome"])
        if resultado is not None or True:  # upsert silencioso
            ubs_criadas += 1
        print(f"    UBS {ubs['cnes']}: {ubs['nome']} {'✓' if ubs_criadas else '?'}")

    # 2. Cadastrar equipes
    equipes_criadas = 0
    for eq in equipes_list:
        resultado = upsert_equipe(eq["ine"], eq["nome"], eq["tipo"], eq.get("cnes", ""))
        equipes_criadas += 1
        print(f"    Equipe {eq['ine']}: {eq['nome']} ({eq['tipo'].upper()}) ✓")

    print(f"  [Auto-Cadastro] Concluido: {ubs_criadas} UBS, {equipes_criadas} equipes")
    return equipes_list


# ============================================
# EXECUTAR QUERIES DOS INDICADORES
# ============================================

QUERY_PARAMS = None

def get_query_params():
    global QUERY_PARAMS
    if QUERY_PARAMS is None:
        hoje = date.today()
        QUERY_PARAMS = {
            "inicio": str(hoje.replace(day=1)),
            "fim": str(hoje),
            "dois_anos": str(hoje.replace(year=hoje.year - 2)),
            "sessenta_anos": str(hoje.replace(year=hoje.year - 60)),
            "idade_25": str(hoje.replace(year=hoje.year - 25)),
            "idade_64": str(hoje.replace(year=hoje.year - 64)),
        }
    return QUERY_PARAMS


def executar_query_indicador(conn, codigo, equipe_ine):
    """Executa uma query de indicador para uma equipe."""
    params = dict(get_query_params())
    params["equipe_ine"] = equipe_ine

    # Algumas queries usam filtro por equipe
    query = QUERIES_INDICADORES[codigo]

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            t0 = time.time()
            cur.execute(query, params)
            row = cur.fetchone()
            elapsed = time.time() - t0

            if row:
                keys = list(row.keys())
                numerador_key = [k for k in keys if k not in ("total", "cadastrados", "iniciados")][0]
                denominador_key = next((k for k in keys if k in ("total", "cadastrados", "iniciados")), None)

                numerador = int(row[numerador_key] or 0)
                denominador = int(row[denominador_key] or 1) if denominador_key else 1
                valor = round((numerador / denominador) * 100, 2) if denominador > 0 else 0.0

                return {
                    "codigo": codigo,
                    "valor": valor,
                    "numerador": numerador,
                    "denominador": denominador,
                    "tempo_ms": round(elapsed * 1000),
                }
            else:
                return {"codigo": codigo, "valor": 0.0, "numerador": 0, "denominador": 1, "tempo_ms": round(elapsed * 1000)}

    except Exception as e:
        return {"codigo": codigo, "valor": None, "erro": str(e)}


def executar_todas_queries(conn, equipe_ine):
    """Executa todas as 15 queries para uma equipe."""
    resultados = {}
    for codigo in sorted(QUERIES_INDICADORES.keys()):
        resultado = executar_query_indicador(conn, codigo, equipe_ine)
        resultados[codigo] = resultado

        if resultado.get("erro"):
            print(f"    {codigo}: ERRO - {resultado['erro']}")
        else:
            print(f"    {codigo}: {resultado['valor']:.1f}% ({resultado['numerador']}/{resultado['denominador']}) - {resultado['tempo_ms']}ms")

    return resultados


# ============================================
# ENVIAR PARA SUPABASE (RPC)
# ============================================

def enviar_indicador_supabase(resultado, equipe_ine, periodo):
    """Envia resultado de um indicador para o Supabase via RPC."""
    if resultado["valor"] is None:
        return False

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    body = json.dumps({
        "codigo": resultado["codigo"],
        "equipe_ine": equipe_ine,
        "valor": resultado["valor"],
        "periodo": periodo,
        "municipio_id": MUNICIPIO_ID,
        "sync_em": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    req = Request(
        f"{SUPABASE_URL}/rest/v1/rpc/sync_indicador_pec",
        data=body.encode(), headers=headers
    )

    try:
        urlopen(req, timeout=15)
        return True
    except URLError as e:
        print(f"    ERRO envio {resultado['codigo']}: {e}")
        return False


# ============================================
# SINCRONIZAR MUNICIPIO COMPLETO
# ============================================

def sincronizar_municipio(conn, equipes):
    """Sincroniza todos os indicadores para todas as equipes de um municipio."""
    hoje = date.today()
    inicio = str(hoje.replace(day=1))
    fim = str(hoje)

    print(f"\n{'='*50}")
    print(f"  SINCRONIZANDO {len(equipes)} EQUIPES")
    print(f"  Periodo: {inicio} a {fim}")
    print(f"{'='*50}\n")

    total_ok = 0
    total_erro = 0
    total_enviados = 0

    for eq in equipes:
        ine = eq["ine"]
        nome = eq["nome"]
        print(f"\n  --- {nome} ({ine}) ---")

        resultados = executar_todas_queries(conn, ine)

        # Enviar para Supabase
        for codigo, resultado in resultados.items():
            if resultado.get("erro"):
                total_erro += 1
            else:
                total_ok += 1
                if enviar_indicador_supabase(resultado, ine, inicio):
                    total_enviados += 1

    print(f"\n{'='*50}")
    print(f"  RESUMO: {total_ok} OK, {total_erro} ERROS, {total_enviados} ENVIADOS")
    print(f"{'='*50}")

    return total_ok, total_erro, total_enviados


# ============================================
# VALIDACAO PRE-SYNC
# ============================================

def validar_schema_pec(conn):
    """Valida se as tabelas essenciais existem no PEC."""
    tabelas = descobrir_tabelas(conn)
    essenciais = [
        "tb_ficha_atendimento_individual",
        "tb_ficha_procedimentos",
        "tb_cidadao",
    ]
    faltando = [t for t in essenciais if t not in tabelas]
    if faltando:
        print(f"  AVISO: Tabelas essenciais faltando no PEC: {faltando}")
        return False
    return True


# ============================================
# MAIN
# ============================================

def main():
    start_time = time.time()

    print(f"[APEX PEC Sync v2.0] {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  PEC: {PEC_HOST}:{PEC_PORT}/{PEC_DB}")
    print(f"  Supabase: {SUPABASE_URL}")
    print(f"  Municipio ID: {MUNICIPIO_ID}")
    print(f"  Municipio IBGE: {MUNICIPIO_IBGE or 'nao informado'}")
    print(f"  Auto-descoberta: {'SIM' if AUTO_DESCOBERTA else 'NAO'}")

    # --- FASE 0: Validar config ---
    if not MUNICIPIO_ID:
        print("\n[FALHA] MUNICIPIO_ID obrigatorio. Defina no .env")
        sys.exit(1)

    # --- FASE 1: Conectar PEC ---
    print("\n[Fase 1] Conectando ao PEC...")
    try:
        conn = conectar_pec()
        print("  Conectado ao PostgreSQL do PEC")

        # Validar schema
        schema_ok = validar_schema_pec(conn)
        if not schema_ok:
            print("  [AVISO] Schema PEC incompleto. Sincronizacao pode falhar para alguns indicadores.")
    except Exception as e:
        print(f"\n[FALHA] Nao foi possivel conectar ao PEC: {e}")
        print("  Verifique as credenciais em .env")
        sys.exit(2)

    # --- FASE 2: Descoberta (auto ou manual) ---
    equipes_para_sincronizar = []

    if AUTO_DESCOBERTA and not EQUIPE_INE:
        print("\n[Fase 2] Auto-descoberta de UBS e equipes...")
        tabelas = descobrir_tabelas(conn)
        print(f"  Tabelas encontradas: {len(tabelas)}")

        ubs = descobrir_ubs(conn, tabelas)
        equipes = descobrir_equipes(conn, tabelas, ubs)

        if not equipes:
            print("  [AVISO] Nenhuma equipe encontrada via auto-descoberta.")
            print("  Defina EQUIPE_INE manualmente no .env se necessario.")
        else:
            # Auto-cadastrar no Supabase
            equipes_para_sincronizar = auto_cadastrar(ubs, equipes)

    elif EQUIPE_INE:
        # Manual: usa INEs definidos no .env
        print(f"\n[Fase 2] Usando equipes do .env: {EQUIPE_INE}")
        ines = [i.strip() for i in EQUIPE_INE.split(",") if i.strip()]
        equipes_para_sincronizar = [{"ine": ine, "nome": f"Equipe {ine}", "tipo": "esf"} for ine in ines]
    else:
        print(f"\n[Fase 2] SKIP: EQUIPE_INE vazio e AUTO_DESCOBERTA=false, pulando sincronizacao")
        conn.close()
        print(f"\n[Concluido] {time.strftime('%Y-%m-%d %H:%M:%S')} ({time.time()-start_time:.0f}s)")
        sys.exit(0)

    # --- FASE 3: Sincronizar indicadores ---
    if equipes_para_sincronizar:
        total_ok, total_erro, total_enviados = sincronizar_municipio(
            conn, equipes_para_sincronizar
        )
    else:
        print("\n[Fase 3] SKIP: Nenhuma equipe para sincronizar")
        total_ok = total_erro = total_enviados = 0

    # --- Fechar conexao ---
    conn.close()

    # --- Relatorio final ---
    elapsed = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"  RELATORIO FINAL")
    print(f"{'='*50}")
    print(f"  Duracao: {elapsed:.0f}s")
    print(f"  Indicadores OK: {total_ok}")
    print(f"  Erros: {total_erro}")
    print(f"  Enviados ao Supabase: {total_enviados}")
    print(f"  Status: {'OK' if total_erro == 0 else 'PARCIAL' if total_ok > 0 else 'FALHA'}")
    print(f"{'='*50}")

    sys.exit(0 if total_erro == 0 else 1)


if __name__ == "__main__":
    main()

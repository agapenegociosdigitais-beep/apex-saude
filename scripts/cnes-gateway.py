#!/usr/bin/env python3
"""
APEX Saude - CNES Data Gateway (VPS)
Consulta a API publica do DATASUS e retorna dados de estabelecimentos.
Executado via SSH pelo servidor Next.js.

Uso: python3 cnes-gateway.py <ibge_6dig> [tipo_unidade]
  tipo_unidade: 1=Posto, 2=Centro/UBS, 4=Policlinica, 70=NASF, null=todos
"""
import json
import sys
from urllib.request import Request, urlopen
from urllib.error import URLError

API_BASE = "https://apidadosabertos.saude.gov.br/cnes"

def fetch_cnes(ibge_6dig, tipo_unidade=None, limit=50):
    """Busca estabelecimentos de um municipio na API do DATASUS"""
    url = f"{API_BASE}/estabelecimentos?codigo_municipio={ibge_6dig}&limit={limit}"
    if tipo_unidade:
        url += f"&codigo_tipo_unidade={tipo_unidade}"

    headers = {"Accept": "application/json"}

    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("estabelecimentos", [])
    except URLError as e:
        return {"erro": str(e)}
    except Exception as e:
        return {"erro": str(e)}


def list_to_ubs(estabelecimentos, tipo_unidade=None):
    """Converte resposta da API pro formato padrao de UBS"""
    ubs_list = []
    for e in estabelecimentos:
        if isinstance(e, dict) and "codigo_cnes" in e:
            nome = e.get("nome_fantasia") or e.get("nome_razao_social") or f"Estabelecimento {e['codigo_cnes']}"
            ubs_list.append({
                "cnes": str(e["codigo_cnes"]),
                "nome": nome.strip().upper(),
                "tipo": "ubs",
                "endereco": e.get("endereco_estabelecimento", "").strip(),
                "bairro": e.get("bairro_estabelecimento", "").strip(),
                "cep": str(e.get("codigo_cep_estabelecimento", "")).strip(),
            })
    return ubs_list


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"erro": "Uso: cnes-gateway.py <ibge_6digitos> [tipo_unidade]"}))
        sys.exit(1)

    ibge = sys.argv[1]
    tipo = sys.argv[2] if len(sys.argv) > 2 else None

    # Para NASF eMulti: tipo 70
    # Para Posto: 1
    # Para Centro/UBS: 2
    # Para todos: None (faz 2 chamadas)

    if tipo:
        estab = fetch_cnes(ibge, tipo_unidade=int(tipo))
        ubs = list_to_ubs(estab)
        print(json.dumps({"total": len(ubs), "ubs": ubs}, ensure_ascii=False))
    else:
        # Buscar postos (1) e centros (2)
        postos = fetch_cnes(ibge, tipo_unidade=1)
        centros = fetch_cnes(ibge, tipo_unidade=2)
        nasf = fetch_cnes(ibge, tipo_unidade=70)
        all_estab = postos + centros + nasf
        ubs = list_to_ubs(all_estab if isinstance(all_estab, list) else [])
        print(json.dumps({"total": len(ubs), "ubs": ubs}, ensure_ascii=False))

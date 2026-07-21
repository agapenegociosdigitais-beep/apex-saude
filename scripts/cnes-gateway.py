#!/usr/bin/env python3
"""CNES API Gateway - VPS server para consultar dados do DATASUS"""
import json, sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
import re

API = "https://apidadosabertos.saude.gov.br/cnes"

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        m = re.match(r'^/cnes/(\d{6})$', self.path)
        if not m:
            self.send_error(404, "Use /cnes/<ibge6digitos>")
            return

        ibge = m.group(1)
        ubs = []
        for tipo in [1, 2, 70]:  # Posto, Centro/UBS, NASF
            try:
                url = f"{API}/estabelecimentos?codigo_municipio={ibge}&codigo_tipo_unidade={tipo}&limit=50"
                req = Request(url, headers={"Accept": "application/json"})
                with urlopen(req, timeout=15) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    for e in data.get("estabelecimentos", []):
                        if isinstance(e, dict) and "codigo_cnes" in e:
                            nome = e.get("nome_fantasia") or e.get("nome_razao_social") or "?"
                            ubs.append({
                                "cnes": str(e["codigo_cnes"]),
                                "nome": nome.strip().upper(),
                                "tipo": "ubs",
                            })
            except Exception:
                pass

        resp = json.dumps({"total": len(ubs), "ubs": ubs}, ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(resp.encode())

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3597
    print(f"CNES Gateway rodando na porta {port}")
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()

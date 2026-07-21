#!/bin/bash
# ============================================
# APEX SAUDE - Setup PEC Sync na VPS v2
# Execute na VPS (23.106.45.137) como root
# ============================================

set -e

echo "========================================"
echo " APEX SAUDE - Setup PEC Sync na VPS"
echo " v2.0 - Auto-descoberta de UBS + Equipes"
echo "========================================"
echo ""

# 1. Instalar dependencias
echo "[1/5] Instalando dependencias..."
pip3 install psycopg2-binary -q
echo "  OK: psycopg2-binary"

# 2. Criar diretorio do script
echo "[2/5] Criando diretorio..."
mkdir -p /root/apex-sync
echo "  OK: /root/apex-sync"

# 3. Copiar scripts
echo "[3/5] Verificando scripts..."
if [ -f /root/apex-sync/pec-sync.py ]; then
    chmod +x /root/apex-sync/pec-sync.py
    echo "  OK: pec-sync.py"
else
    echo "  ATENCAO: Copie pec-sync.py primeiro:"
    echo "  scp scripts/pec-sync.py root@23.106.45.137:/root/apex-sync/"
fi

if [ -f /root/apex-sync/.env.example ]; then
    echo "  OK: .env.example"
else
    echo "  Copie .env.example:"
    echo "  scp scripts/.env.example root@23.106.45.137:/root/apex-sync/"
fi

# 4. Configurar .env
echo "[4/5] Configurando .env..."
if [ ! -f /root/apex-sync/.env ]; then
    cp /root/apex-sync/.env.example /root/apex-sync/.env 2>/dev/null || true
    echo "  ATENCAO: Edite /root/apex-sync/.env com os dados:"
    echo "   - PEC_HOST/PEC_USER/PEC_PASS (dados do TI)"
    echo "   - MUNICIPIO_ID (UUID do municipio no Supabase)"
    echo "   - MUNICIPIO_IBGE (codigo IBGE de 7 digitos)"
    echo ""
    echo "  Exemplo para Belterra:"
    echo "    MUNICIPIO_ID=<consultar no admin>"
    echo "    MUNICIPIO_IBGE=1501453"
    echo "    AUTO_DESCOBERTA=true"
else
    echo "  OK: .env ja existe"
fi

# 5. Configurar CRON (todo dia as 6h)
echo "[5/5] Configurando cron..."
CRON_JOB="0 6 * * * cd /root/apex-sync && python3 pec-sync.py >> /var/log/apex-sync.log 2>&1"
(crontab -l 2>/dev/null | grep -v "apex-sync"; echo "$CRON_JOB") | crontab -
echo "  OK: Sync diario as 06:00"

echo ""
echo "========================================"
echo " SETUP COMPLETO!"
echo "========================================"
echo ""
echo "Proximos passos:"
echo "1. Edite /root/apex-sync/.env com os dados reais do PEC + Supabase"
echo "2. Teste a descoberta: cd /root/apex-sync && python3 pec-sync.py"
echo "3. Veja as equipes encontradas: consulte o admin do APEX"
echo "4. Ver log: tail -f /var/log/apex-sync.log"
echo ""
echo "DICA: Se auto-descoberta falhar, veja as tabelas do PEC:"
echo "  PEC_TABELA_ESTABELECIMENTO=tb_estabelecimento"
echo "  PEC_TABELA_EQUIPE=tb_equipe"
echo ""

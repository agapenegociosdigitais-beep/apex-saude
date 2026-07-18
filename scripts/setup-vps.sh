#!/bin/bash
# ============================================
# APEX SAUDE - Setup Sync Script na VPS
# Execute na VPS (23.106.45.137) como root
# ============================================

set -e

echo "========================================"
echo " APEX SAUDE - Setup PEC Sync na VPS"
echo "========================================"
echo ""

# 1. Instalar dependencias
echo "[1/5] Instalando psycopg2..."
pip3 install psycopg2-binary -q
echo "  OK"

# 2. Criar diretorio do script
echo "[2/5] Criando diretorio..."
mkdir -p /root/apex-sync
echo "  OK: /root/apex-sync"

# 3. Copiar script (assumindo que foi enviado por SCP)
echo "[3/5] Verificando script..."
if [ -f /root/apex-sync/pec-sync.py ]; then
    chmod +x /root/apex-sync/pec-sync.py
    echo "  OK: /root/apex-sync/pec-sync.py"
else
    echo "  ATENCAO: Copie pec-sync.py para /root/apex-sync/ primeiro"
    echo "  scp scripts/pec-sync.py root@23.106.45.137:/root/apex-sync/"
fi

# 4. Configurar .env
echo "[4/5] Criando .env..."
if [ ! -f /root/apex-sync/.env ]; then
    cp /root/apex-sync/.env.example /root/apex-sync/.env 2>/dev/null || true
    echo "  ATENCAO: Edite /root/apex-sync/.env com os dados do PEC e Supabase"
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
echo "1. Edite /root/apex-sync/.env com os dados reais"
echo "2. Teste: cd /root/apex-sync && python3 pec-sync.py"
echo "3. Ver log: tail -f /var/log/apex-sync.log"
echo ""

#!/usr/bin/env bash
#
# restore-mongo.sh
#
# Restaura um backup (BSON/JSON) para um banco MongoDB rodando em um pod
# Kubernetes, em dois passos:
#   1. Copia o arquivo para dentro do pod com kubectl cp
#   2. Executa mongorestore no container do Mongo e faz a limpeza
#
# ──────────────── COMO USAR ─────────────────
#   ./restore-mongo.sh \
#       --backup-dir   ./meuBackup \
#       --namespace    minha-app \
#       --pod          mongo-pod-0 \
#       --container    mongo \
#       --db           activityDB
#
# Todos os parâmetros têm valores-padrão; se o cluster só tem um pod de
# Mongo e você está no namespace default, basta:
#   ./restore-mongo.sh --backup-dir ./meuBackup
#
# -------------------------------------------------------------

set -euo pipefail

# ---------- PARÂMETROS ----------
BACKUP_DIR="../backup/miaAjudaDB"
NAMESPACE="activity-service"
POD=""
CONTAINER=""
DB_NAME="activityDB"
REMOTE_DIR="/tmp/mongo-restore"
BACKUP_DB_NAME="miaAjudaDB"

while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--backup-dir) BACKUP_DIR="$2";   shift 2 ;;
    -n|--namespace)  NAMESPACE="$2";    shift 2 ;;
    -p|--pod)        POD="$2";          shift 2 ;;
    -c|--container)  CONTAINER="$2";    shift 2 ;;
    -d|--db)         DB_NAME="$2";      shift 2 ;;
    *) echo "Parâmetro desconhecido: $1"; exit 1 ;;
  esac
done

# ---------- PRÉ-CHECAGENS ----------
echo "🔍 Verificando acesso ao cluster…"
kubectl cluster-info > /dev/null

if [[ -z "$POD" ]]; then
  echo "🔍 Buscando primeiro pod com label 'app=mongo'"
  POD=$(kubectl get pod -n "$NAMESPACE" -l app="mongodb" -o jsonpath='{.items[0].metadata.name}')
  [[ -z "$POD" ]] && { echo "❌ Nenhum pod Mongo encontrado!"; exit 1; }
fi

if [[ -z "$CONTAINER" ]]; then
  CONTAINER=$(kubectl get pod "$POD" -n "$NAMESPACE" -o jsonpath='{.spec.containers[0].name}')
fi

echo "ℹ️  Namespace : $NAMESPACE"
echo "ℹ️  Pod       : $POD"
echo "ℹ️  Container : $CONTAINER"
echo "ℹ️  BackupDir : $BACKUP_DIR"
echo "ℹ️  DB alvo   : $DB_NAME"
echo

# ---------- PASSO 2: Copia ----------
echo "🚚 Copiando para o pod…"
kubectl cp "$BACKUP_DIR" "$NAMESPACE/$POD:$REMOTE_DIR" -c "$CONTAINER"

# ---------- PASSO 3: Restaura ----------
echo "⏳ Restaurando dentro do container…"
kubectl exec -n "$NAMESPACE" "$POD" -- mongorestore --drop --db "$DB_NAME" "$REMOTE_DIR/$BACKUP_DB_NAME"

echo "🧹 Limpando arquivos temporários…"
rm -rf "$REMOTE_DIR"

echo "✅ Restore concluído com sucesso!"

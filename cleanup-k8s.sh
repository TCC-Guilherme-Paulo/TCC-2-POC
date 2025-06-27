#!/bin/bash

echo "🧹 Limpando ambiente Kubernetes"
echo "=============================="

# Parar Minikube
echo "🛑 Parando Minikube..."
minikube stop

echo "🗑️ Removendo Minikube..."
minikube delete

# Remover namespace (isso remove todos os recursos)
echo "🗑️ Removendo namespace activity-service..."
kubectl delete namespace activity-service --ignore-not-found=true

# Remover entrada do /etc/hosts
echo "📝 Removendo entrada do /etc/hosts..."
# sudo sed -i '' '/activity-service.local/d' /etc/hosts

echo "✅ Limpeza concluída!"
echo ""
echo "💡 Para reiniciar o ambiente, execute:"
echo "   ./setup-k8s.sh" 
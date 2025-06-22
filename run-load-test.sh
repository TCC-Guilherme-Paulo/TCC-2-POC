#!/bin/bash

echo "🧪 Executando Teste de Carga no Kubernetes"
echo "=========================================="

# Verificar se o Minikube está rodando
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube não está rodando. Execute ./setup-k8s.sh primeiro."
    exit 1
fi

# Obter IP do Minikube
MINIKUBE_IP=$(minikube ip)
echo "🌐 Minikube IP: $MINIKUBE_IP"

# Verificar se o entry está no /etc/hosts
if ! grep -q "activity-service.local" /etc/hosts; then
    echo "📝 Adicionando activity-service.local ao /etc/hosts..."
    echo "$MINIKUBE_IP activity-service.local" | sudo tee -a /etc/hosts
fi

# Verificar se os pods estão prontos
echo "⏳ Verificando se os pods estão prontos..."
kubectl wait --for=condition=ready pod -l app=activity-service -n activity-service --timeout=60s

if [ $? -ne 0 ]; then
    echo "❌ Pods não estão prontos. Verifique o status:"
    kubectl get pods -n activity-service
    exit 1
fi

echo "✅ Pods prontos!"

# Mostrar status inicial
echo "📊 Status inicial:"
kubectl get pods -n activity-service
kubectl get hpa -n activity-service

echo ""
echo "🚀 Iniciando teste de carga..."
echo "📈 Para monitorar o escalonamento, abra outro terminal e execute:"
echo "   ./monitor-k8s.sh"
echo ""

# Executar teste de carga
artillery run artillary-load-test.yml

echo ""
echo "✅ Teste de carga concluído!"
echo ""
echo "📊 Status final:"
kubectl get pods -n activity-service
kubectl get hpa -n activity-service 
#!/bin/bash

echo "🚀 Iniciando teste de carga com Minikube Tunnel"
echo "================================================"

# Verificar se minikube está rodando
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube não está rodando. Execute ./setup-k8s.sh primeiro."
    exit 1
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

# Iniciar minikube tunnel em background
echo "🌐 Iniciando minikube tunnel..."
minikube tunnel > /dev/null 2>&1 &
TUNNEL_PID=$!

# Aguardar o tunnel estar pronto
echo "⏳ Aguardando tunnel estar pronto..."
sleep 10

# Verificar se o LoadBalancer está ativo
echo "🔍 Verificando LoadBalancer..."
for i in {1..30}; do
    EXTERNAL_IP=$(kubectl get service activity-service-lb -n activity-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ "$EXTERNAL_IP" = "127.0.0.1" ]; then
        echo "✅ LoadBalancer ativo em $EXTERNAL_IP"
        break
    fi
    echo "⏳ Aguardando LoadBalancer... ($i/30)"
    sleep 2
done

if [ "$EXTERNAL_IP" != "127.0.0.1" ]; then
    echo "❌ LoadBalancer não ficou ativo. Parando tunnel..."
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

# Testar se o serviço está acessível
echo "🧪 Testando acesso ao serviço..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1 | grep -q "200"; then
    echo "✅ Serviço acessível!"
else
    echo "❌ Serviço não está respondendo. Parando tunnel..."
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🚀 Iniciando teste de carga..."
echo "📈 Para monitorar o escalonamento, abra outro terminal e execute:"
echo "   ./monitor-k8s.sh"
echo ""

# Executar teste de carga
artillery run artillary-load-test.yml --record --key a9_19g1891m75d4ongelvyli55fk3murwrr

echo ""
echo "✅ Teste de carga concluído!"
echo "📊 Status final:"
kubectl get pods -n activity-service
kubectl get hpa -n activity-service

# Parar o tunnel
echo "🛑 Parando minikube tunnel..."
kill $TUNNEL_PID 2>/dev/null

echo "✅ Processo concluído!" 
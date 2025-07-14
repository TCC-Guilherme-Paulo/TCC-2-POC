#!/bin/bash

echo "🚀 Iniciando teste de carga via nginx (sem tunnel)"
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

# Obter IP do minikube
MINIKUBE_IP=$(minikube ip)
NODEPORT=30080

# Atualizar nginx.conf com o IP correto (opcional, se não for fixo)
sed "s/<MINIKUBE_IP>/$MINIKUBE_IP/g" nginx.conf > nginx-temp.conf

# Subir nginx em docker
echo "🌐 Subindo nginx como proxy reverso..."
docker run --rm -d --name nginx-proxy -p 8080:8080 -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf:ro nginx:alpine
# docker run --rm -d --name nginx-proxy -p 8080:8080 -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine

# Testar se o serviço está acessível via nginx
echo "🧪 Testando acesso ao serviço via nginx..."
for i in {1..10}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
        echo "✅ Serviço acessível via nginx!"
        break
    fi
    echo "⏳ Aguardando serviço via nginx... ($i/10)"
    sleep 2
done

if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "❌ Serviço não está respondendo via nginx. Parando nginx..."
    docker stop nginx-proxy
    exit 1
fi

echo ""
echo "🚀 Iniciando teste de carga..."
echo "📈 Para monitorar o escalonamento, abra outro terminal e execute:"
echo "   ./monitor-k8s.sh"
echo ""

# Executar teste de carga
# artillery run artillery/artillary-load-test.yml --record --key a9_19g1891m75d4ongelvyli55fk3murwrr

echo ""
echo "✅ Teste de carga concluído!"
echo "📊 Status final:"
kubectl get pods -n activity-service
kubectl get hpa -n activity-service

# Parar nginx
echo "🛑 Parando nginx proxy..."
docker stop nginx-proxy

# Limpar arquivo temporário
rm -f nginx-temp.conf

echo "✅ Processo concluído!"
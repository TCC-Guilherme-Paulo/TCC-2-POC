#!/bin/bash

echo "🚀 Iniciando configuração do Kubernetes para Activity Service"

# Verificar se minikube está instalado
if ! command -v minikube &> /dev/null; then
    echo "❌ Minikube não está instalado. Instalando..."
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
    sudo install minikube-darwin-amd64 /usr/local/bin/minikube
    rm minikube-darwin-amd64
fi

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado. Instalando..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
fi

echo "✅ Minikube e kubectl verificados"

# Parar minikube se estiver rodando
echo "🛑 Parando minikube se estiver rodando..."
minikube stop 2>/dev/null || true

# Iniciar minikube com configurações mais conservadoras
echo "🚀 Iniciando minikube..."
minikube start --cpus=2 --memory=3000 --driver=docker

# Verificar se minikube iniciou corretamente
if ! minikube status | grep -q "Running"; then
    echo "❌ Falha ao iniciar minikube. Tentando com configurações mínimas..."
    minikube start --cpus=1 --memory=2000 --driver=docker
fi

# Verificar novamente
if ! minikube status | grep -q "Running"; then
    echo "❌ Falha ao iniciar minikube. Verifique se o Docker Desktop está rodando."
    exit 1
fi

echo "✅ Minikube iniciado com sucesso!"

# Habilitar addons
echo "🔧 Habilitando addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Configurar ambiente docker
echo "🐳 Configurando ambiente docker..."
eval $(minikube docker-env)

# Build da imagem
echo "🔨 Fazendo build da imagem Docker..."
docker build -t activity-service:latest .

# Verificar se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "❌ Falha no build da imagem Docker"
    exit 1
fi

# Aplicar manifests
echo "📋 Aplicando manifests do Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/activity-service.yaml
kubectl apply -f k8s/ingress.yaml

# Aguardar pods ficarem prontos
echo "⏳ Aguardando pods ficarem prontos..."
kubectl wait --for=condition=ready pod -l app=activity-service -n activity-service --timeout=300s
kubectl wait --for=condition=ready pod -l app=mongodb -n activity-service --timeout=300s

# Obter IP do minikube
MINIKUBE_IP=$(minikube ip)
echo "🌐 Minikube IP: $MINIKUBE_IP"

# Aguardar ingress estar pronto
echo "⏳ Aguardando ingress estar pronto..."
sleep 30

echo "✅ Configuração concluída!"
echo ""
echo "📊 Status dos pods:"
kubectl get pods -n activity-service
echo ""
echo "🌐 Para acessar a aplicação:"
echo "   Minikube IP: $MINIKUBE_IP"
echo "   Adicione ao /etc/hosts: $MINIKUBE_IP activity-service.local"
echo ""
echo "🧪 Para rodar o teste de carga:"
echo "   artillery run artillary-load-test.yml --target http://$MINIKUBE_IP"
echo ""
echo "📈 Para monitorar o HPA:"
echo "   kubectl get hpa -n activity-service -w"
echo ""
echo "📝 Para ver logs:"
echo "   kubectl logs -f deployment/activity-service -n activity-service" 
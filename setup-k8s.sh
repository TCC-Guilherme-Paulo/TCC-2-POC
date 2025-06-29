#!/bin/bash

set -e  # Parar em caso de erro

echo "🚀 Configuração Simples do Kubernetes"
echo "====================================="

# Verificar Docker
echo "🐳 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker Desktop primeiro."
    exit 1
fi
echo "✅ Docker está rodando"

# Parar minikube se estiver rodando
echo "🛑 Parando minikube..."
minikube stop 2>/dev/null || true

# Iniciar minikube com configurações mínimas
echo "🚀 Iniciando minikube..."
minikube start --cpus=4 --memory=3919 --driver=docker

# Verificar se iniciou
if ! minikube status | grep -q "Running"; then
    echo "❌ Falha ao iniciar minikube"
    exit 1
fi

echo "✅ Minikube iniciado!"

# Habilitar addons
echo "🔧 Habilitando addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Configurar Docker
echo "🐳 Configurando ambiente Docker..."
eval $(minikube docker-env)

# Build da imagem
echo "🔨 Build da imagem..."
docker build -t activity-service:latest .

# Aplicar manifests
echo "📋 Aplicando configurações..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/activity-service.yaml
kubectl apply -f k8s/ingress.yaml

# Aguardar
echo "⏳ Aguardando pods..."
sleep 60

# Status
echo "📊 Status:"
kubectl get pods -n activity-service

# IP
MINIKUBE_IP=$(minikube ip)
echo ""
echo "🌐 Minikube IP: $MINIKUBE_IP"
echo "📝 Adicione ao /etc/hosts: $MINIKUBE_IP activity-service.local"
echo ""
echo "🧪 Para testar: ./run-load-test.sh" 
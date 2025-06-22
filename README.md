# Activity Service - Kubernetes Setup

Este projeto demonstra um serviço de atividades com escalonamento horizontal automático usando Kubernetes.

## 🚀 Inicialização Rápida

### Opção 1: Script Automatizado (Recomendado)
```bash
# Executar script de configuração
./setup-k8s.sh
```

### Opção 2: Configuração Manual

#### Pré-requisitos
- Docker Desktop
- Minikube
- kubectl
- Artillery (para testes de carga)

#### Instalação das Ferramentas (macOS)
```bash
# Instalar Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube

# Instalar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

#### Configuração do Ambiente
```bash
# Iniciar Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# Habilitar addons necessários
minikube addons enable ingress
minikube addons enable metrics-server

# Configurar ambiente Docker
eval $(minikube docker-env)

# Build da imagem
docker build -t activity-service:latest .

# Aplicar manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/activity-service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 🧪 Testes de Carga

### Configurar acesso
```bash
# Obter IP do Minikube
MINIKUBE_IP=$(minikube ip)
echo "Minikube IP: $MINIKUBE_IP"

# Adicionar ao /etc/hosts (necessário para ingress)
echo "$MINIKUBE_IP activity-service.local" | sudo tee -a /etc/hosts
```

### Executar teste de carga
```bash
# Teste básico
artillery run artillary-load-test.yml

# Teste com métricas (requer conta no Artillery)
artillery run artillary-load-test.yml --record --key YOUR_API_KEY
```

## 📊 Monitoramento

### Script de Monitoramento
```bash
# Monitorar em tempo real
./monitor-k8s.sh
```

### Comandos Úteis
```bash
# Status dos pods
kubectl get pods -n activity-service

# Status do HPA
kubectl get hpa -n activity-service

# Logs da aplicação
kubectl logs -f deployment/activity-service -n activity-service

# Uso de recursos
kubectl top pods -n activity-service

# Status dos serviços
kubectl get services -n activity-service
```

## 🔧 Configurações

### Horizontal Pod Autoscaler (HPA)
- **Mínimo de réplicas**: 2
- **Máximo de réplicas**: 10
- **Trigger de CPU**: 50% de utilização
- **Trigger de Memória**: 50% de utilização

### Recursos por Pod
- **CPU Request**: 250m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

## 🏗️ Arquitetura

### Componentes Kubernetes
- **Namespace**: `activity-service`
- **Deployment**: Aplicação NestJS com 2 réplicas iniciais
- **Service**: ClusterIP para comunicação interna
- **Ingress**: Nginx para acesso externo
- **HPA**: Escalonamento automático baseado em recursos
- **ConfigMap**: Configurações da aplicação
- **PersistentVolume**: Dados do MongoDB

### Fluxo de Tráfego
```
Internet → Ingress → Service → Pods (escalonáveis)
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Pods não iniciam**
   ```bash
   kubectl describe pod <pod-name> -n activity-service
   kubectl logs <pod-name> -n activity-service
   ```

2. **Ingress não funciona**
   ```bash
   kubectl get ingress -n activity-service
   minikube addons list | grep ingress
   ```

3. **HPA não escala**
   ```bash
   kubectl describe hpa activity-service-hpa -n activity-service
   kubectl top pods -n activity-service
   ```

### Limpeza
```bash
# Parar Minikube
minikube stop

# Remover namespace
kubectl delete namespace activity-service

# Remover do /etc/hosts
sudo sed -i '' '/activity-service.local/d' /etc/hosts
```

## 📈 Métricas de Performance

O sistema está configurado para escalar automaticamente quando:
- CPU média dos pods > 50%
- Memória média dos pods > 50%

O teste de carga simula:
- **Warm-up**: 1-10 req/s por 1 minuto
- **Sustain**: 20 req/s por 2 minutos  
- **Spike**: 50 req/s por 1 minuto
- **Ramp-down**: 50-0 req/s por 1 minuto


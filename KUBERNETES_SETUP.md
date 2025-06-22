# 🚀 Guia Completo - Kubernetes Setup

## ✅ Correções e Melhorias Implementadas

### 1. **Dockerfile Corrigido**
- ✅ Mudança de `start:dev` para `start:prod`
- ✅ Porta corrigida de 3000 para 3001
- ✅ Adicionado build de produção
- ✅ Removida instalação desnecessária do @nestjs/cli

### 2. **ConfigMap Atualizado**
- ✅ URL do MongoDB corrigida
- ✅ Adicionada variável PORT
- ✅ Configurações de produção

### 3. **Health Checks Melhorados**
- ✅ Endpoint raiz adicionado (`/`)
- ✅ Probes configurados corretamente
- ✅ Timeouts e thresholds ajustados

### 4. **MongoDB Configurado**
- ✅ Health checks TCP adicionados
- ✅ Variável de ambiente para database
- ✅ PersistentVolume configurado

### 5. **Scripts Automatizados**
- ✅ `setup-k8s.sh` - Configuração completa
- ✅ `monitor-k8s.sh` - Monitoramento em tempo real
- ✅ `run-load-test.sh` - Teste de carga automatizado
- ✅ `cleanup-k8s.sh` - Limpeza do ambiente

### 6. **Teste de Carga Otimizado**
- ✅ `artillary-load-test.yml` - Configuração específica para K8s
- ✅ Múltiplos cenários de teste
- ✅ Validações de status code

## 🎯 Como Usar

### Inicialização Rápida
```bash
# 1. Configurar ambiente
./setup-k8s.sh

# 2. Em outro terminal, monitorar
./monitor-k8s.sh

# 3. Executar teste de carga
./run-load-test.sh
```

### Configuração Manual (se necessário)
```bash
# Instalar ferramentas
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Configurar ambiente
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
eval $(minikube docker-env)

# Build e deploy
docker build -t activity-service:latest .
kubectl apply -f k8s/
```

## 📊 Monitoramento

### Comandos Úteis
```bash
# Status geral
kubectl get all -n activity-service

# Logs em tempo real
kubectl logs -f deployment/activity-service -n activity-service

# Uso de recursos
kubectl top pods -n activity-service

# Status do HPA
kubectl get hpa -n activity-service -w
```

### Escalonamento Automático
- **Trigger**: CPU > 50% OU Memória > 50%
- **Mínimo**: 2 pods
- **Máximo**: 10 pods
- **Cooldown**: 5 minutos

## 🧪 Teste de Carga

### Cenários Testados
1. **Warm-up**: 1-10 req/s (1 min)
2. **Sustain**: 20 req/s (2 min)
3. **Spike**: 50 req/s (1 min)
4. **Ramp-down**: 50-0 req/s (1 min)

### Endpoints Testados
- `/activities` (70% do tráfego)
- `/` (20% do tráfego)
- `/categories` (10% do tráfego)

## 🏗️ Arquitetura

```
Internet
    ↓
Ingress (Nginx)
    ↓
Service (ClusterIP)
    ↓
Pods (2-10 réplicas)
    ↓
MongoDB (1 réplica)
```

## 🔧 Troubleshooting

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
./cleanup-k8s.sh
```

## 📈 Métricas Esperadas

### Durante Teste de Carga
- **Início**: 2 pods
- **Pico**: 6-8 pods (dependendo da carga)
- **Final**: 2 pods (após cooldown)

### Performance
- **Latência**: < 200ms (sem carga)
- **Throughput**: 50+ req/s (com escalonamento)
- **Disponibilidade**: 99.9%+

## 🎉 Próximos Passos

1. **Monitoramento Avançado**
   - Prometheus + Grafana
   - Alertas automáticos

2. **CI/CD Pipeline**
   - GitHub Actions
   - Deploy automático

3. **Segurança**
   - Network Policies
   - RBAC
   - Secrets management

4. **Backup**
   - MongoDB backup automático
   - Disaster recovery 
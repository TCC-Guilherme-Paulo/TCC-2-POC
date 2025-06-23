# Activity Service - Kubernetes & Resilience Demo

Este projeto demonstra um serviço de atividades com escalonamento horizontal automático e testes de resiliência usando Kubernetes.

## 🚀 Guia Rápido

O projeto utiliza scripts para automatizar a maior parte do processo.

1.  **Configurar o Ambiente Kubernetes (Primeira vez):**
    ```bash
    ./setup-k8s.sh
    ```

2.  **Executar Teste de Carga e Performance:**
    ```bash
    ./run-load-test-with-tunnel.sh
    ```
    *Este script inicia o `minikube tunnel` automaticamente, que é necessário para acessar os serviços no macOS e Windows.*

3.  **Monitorar o Ambiente em Tempo Real:**
    *Abra um novo terminal e execute:*
    ```bash
    ./monitor-k8s.sh
    ```

4.  **Limpar o Ambiente:**
    *Para o Minikube e remove todos os recursos do Kubernetes.*
    ```bash
    ./cleanup-k8s.sh
    ```

---

## 🏗️ Arquitetura e Componentes

-   **Namespace**: `activity-service` isola todos os componentes.
-   **Deployment**: Gerencia os pods da aplicação NestJS.
-   **Service (ClusterIP)**: Para comunicação interna entre a aplicação e o MongoDB.
-   **Service (LoadBalancer)**: Expõe a aplicação para testes de carga via `minikube tunnel`.
-   **HPA (Horizontal Pod Autoscaler)**: Escala os pods automaticamente com base no uso de CPU e memória.
-   **ConfigMap**: Armazena as configurações da aplicação.
-   **StatefulSet**: Gerencia o pod do MongoDB para garantir dados persistentes.

---

## 🔧 Configurações Detalhadas

### Recursos por Pod
-   **CPU Request**: 250m
-   **CPU Limit**: 500m
-   **Memory Request**: 256Mi
-   **Memory Limit**: 512Mi

### Horizontal Pod Autoscaler (HPA)
-   **Mínimo de réplicas**: 2
-   **Máximo de réplicas**: 10
-   **Gatilho de CPU**: 50% de utilização
-   **Gatilho de Memória**: 50% de utilização

---

## 🧪 Testes de Carga

O script `run-load-test-with-tunnel.sh` executa um teste de carga que simula diferentes fases de tráfego para avaliar a performance e o escalonamento do sistema.

**Fases do Teste:**
-   **Warm-up**: Aquece o sistema com carga leve (1 a 10 req/s).
-   **Sustain**: Mantém uma carga estável (20 req/s) para medir a performance sob estresse constante.
-   **Spike**: Simula um pico repentino de tráfego (50 req/s).
-   **Ramp-down**: Reduz a carga gradualmente.

Os resultados são enviados para o Artillery Cloud para análise detalhada (a chave está no script).

---

## 🛠️ Comandos Úteis para Monitoramento e Debug

-   **Ver status dos pods:**
    ```bash
    kubectl get pods -n activity-service -w
    ```

-   **Ver status do HPA e escalonamento:**
    ```bash
    kubectl get hpa -n activity-service -w
    ```

-   **Ver logs da aplicação em tempo real:**
    ```bash
    kubectl logs -f deployment/activity-service -n activity-service
    ```

-   **Verificar o uso de recursos (CPU/Memória):**
    *Requer o `metrics-server` habilitado (`minikube addons enable metrics-server`)*
    ```bash
    kubectl top pods -n activity-service
    ```

-   **Descrever um pod para ver detalhes e eventos:**
    ```bash
    kubectl describe pod <nome-do-pod> -n activity-service
    ```


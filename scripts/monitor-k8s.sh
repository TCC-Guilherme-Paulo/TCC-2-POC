#!/bin/bash

echo "📊 Monitorando Kubernetes Activity Service"
echo "=========================================="

# Função para mostrar status dos pods
show_pods() {
    echo "🐳 Status dos Pods:"
    kubectl get pods -n activity-service -o wide
    echo ""
}

# Função para mostrar HPA
show_hpa() {
    echo "📈 Status do HPA (Horizontal Pod Autoscaler):"
    kubectl get hpa -n activity-service
    echo ""
}

# Função para mostrar serviços
show_services() {
    echo "🔗 Status dos Serviços:"
    kubectl get services -n activity-service
    echo ""
}

# Função para mostrar ingress
show_ingress() {
    echo "🌐 Status do Ingress:"
    kubectl get ingress -n activity-service
    echo ""
}

# Função para mostrar uso de recursos
show_resources() {
    echo "💾 Uso de Recursos:"
    kubectl top pods -n activity-service 2>/dev/null || echo "Metrics server não disponível ainda"
    echo ""
}

# Função para mostrar logs
show_logs() {
    echo "📝 Últimos logs do activity-service:"
    kubectl logs --tail=10 deployment/activity-service -n activity-service
    echo ""
}

# Loop principal de monitoramento
while true; do
    clear
    echo "📊 Monitorando Kubernetes Activity Service - $(date)"
    echo "=========================================="
    
    show_pods
    show_hpa
    show_services
    show_ingress
    show_resources
    
    echo "🔄 Atualizando em 10 segundos... (Ctrl+C para sair)"
    sleep 10
done 
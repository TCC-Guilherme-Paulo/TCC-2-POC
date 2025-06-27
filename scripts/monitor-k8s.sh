#!/bin/bash

show_pods() {
    kubectl get pods -n activity-service -o wide
}

show_hpa() {
    kubectl get hpa -n activity-service
}

show_services() {
    kubectl get services -n activity-service
}

show_ingress() {
    kubectl get ingress -n activity-service
}

show_resources() {
    kubectl top pods -n activity-service 2>/dev/null || echo "Metrics server não disponível ainda"
}

show_logs() {
    kubectl logs --tail=10 deployment/activity-service -n activity-service
}

while true; do
    clear
    show_pods
    show_hpa
    show_services
    show_ingress
    show_resources
    sleep 2
done 
#!/bin/bash


if ! minikube status | grep -q "Running"; then
    exit 1
fi

kubectl wait --for=condition=ready pod -l app=activity-service -n activity-service --timeout=60s

if [ $? -ne 0 ]; then
    kubectl get pods -n activity-service
fi

minikube tunnel > /dev/null 2>&1 &
TUNNEL_PID=$!

sleep 10

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

if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1 | grep -q "200"; then
    echo "Serviço acessível!"
else
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

artillery run artillery/artillary-load-test.yml --record --key a9_19g1891m75d4ongelvyli55fk3murwrr

kubectl get pods -n activity-service
kubectl get hpa -n activity-service

kill $TUNNEL_PID 2>/dev/null
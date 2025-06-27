#!/bin/bash

set -e  


if ! docker info > /dev/null 2>&1; then
    exit 1
fi

minikube stop 2>/dev/null || true

minikube start --cpus=2 --memory=2000 --driver=docker

if ! minikube status | grep -q "Running"; then
    exit 1
fi


minikube addons enable ingress
minikube addons enable metrics-server

eval $(minikube docker-env)

docker build -t activity-service:latest .

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/activity-service.yaml
kubectl apply -f k8s/ingress.yaml

sleep 60

kubectl get pods -n activity-service

MINIKUBE_IP=$(minikube ip)
echo "nano /etc/hosts"
echo "$MINIKUBE_IP activity-service.local"
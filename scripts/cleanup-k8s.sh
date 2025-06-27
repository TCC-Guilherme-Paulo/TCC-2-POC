#!/bin/bash

minikube stop

minikube delete

kubectl delete namespace activity-service --ignore-not-found=true

# sudo sed -i '' '/activity-service.local/d' /etc/hosts
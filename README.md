Roda o ambiente com:
docker-compose up --build


##########


# Run teste:
artillery run artillary-load-test.yml --record --key a9_19g1891m75d4ongelvyli55fk3murwrr

# Kubernetes Core Concepts:
- Pods: The smallest deployable units in Kubernetes. In your case, each pod will contain your NestJS application container.

- Deployments: Manages the desired state for your pods. It ensures that the specified number of pods are running at all times.

- Services: Provides network access to your pods. We'll need:
ClusterIP service for internal communication
LoadBalancer service for external access

- Horizontal Pod Autoscaler (HPA): Automatically scales the number of pods based on CPU/Memory usage.

- ConfigMaps & Secrets: For managing configuration and sensitive data.

- PersistentVolumes: For MongoDB data persistence.


##########


Now, let me explain how to set up and run this Kubernetes environment using Minikube:
First, install Minikube and kubectl:

# Settings for minkube and kubernetes

- Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

- Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

- Start minikube:
minikube start --cpus=4 --memory=8192 --driver=docker
minikube start --cpus=2 --memory=3000mb --driver=docker

- Enable the ingress:
minikube addons enable ingress

- Build docker image:
eval $(minikube docker-env)

- Build the image
docker build -t activity-service:latest .

- Apply manifests:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/activity-service.yaml
kubectl apply -f k8s/ingress.yaml

# Get the Minikube IP
minikube ip

# Run Artillery (replace <minikube-ip> with the actual IP)
artillery run artillary-load-test.yml --record --key a9_19g1891m75d4ongelvyli55fk3murwrr --target http://<minikube-ip>


##########

# Watch pods
kubectl get pods -n activity-service -w

# Check HPA status
kubectl get hpa -n activity-service

# View logs
kubectl logs -f deployment/activity-service -n activity-service

# Check resource usage
kubectl top pods -n activity-service


Roda o ambiente com:
docker-compose up --build

Executa o teste:
artillery run artillary-load-test.yml --record --key artillary-key

<!--  -->

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl get deployment metrics-server -n kube-system

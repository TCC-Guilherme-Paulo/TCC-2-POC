import json

def calcular_media_total(path):
    with open(path) as f:
        data = json.load(f)
    soma = 0
    total = 0
    for item in data.get('intermediate', []):
        summary = item.get('summaries', {}).get('http.response_time', {})
        mean = summary.get('mean')
        count = summary.get('count')
        if mean is not None and count is not None:
            soma += mean * count
            total += count
    return soma / total if total > 0 else None

def calcular_media_max(path):
    with open(path) as f:
        data = json.load(f)
    maximos = []
    for item in data.get('intermediate', []):
        summary = item.get('summaries', {}).get('http.response_time', {})
        val = summary.get('max')
        if val is not None:
            maximos.append(val)
    return sum(maximos) / len(maximos) if maximos else None

def calcular_media_min(path):
    with open(path) as f:
        data = json.load(f)
    minimos = []
    for item in data.get('intermediate', []):
        summary = item.get('summaries', {}).get('http.response_time', {})
        val = summary.get('min')
        if val is not None and val > 0.0: 
            minimos.append(val)
    return sum(minimos) / len(minimos) if minimos else None

if __name__ == "__main__":
    docker_file = "./docker2.json"
    kube_file = "./kube2.json"
    media_docker = calcular_media_total(docker_file)
    media_kube = calcular_media_total(kube_file)
    media_max_docker = calcular_media_max(docker_file)
    media_max_kube = calcular_media_max(kube_file)
    media_min_docker = calcular_media_min(docker_file)
    media_min_kube = calcular_media_min(kube_file)
    print(f"Tempo médio total de resposta (Docker): {media_docker:.2f} ms")
    print(f"Tempo médio total de resposta (Kubernetes): {media_kube:.2f} ms")
    print(f"Tempo máximo de resposta (Docker): {media_max_docker:.2f} ms")
    print(f"Tempo máximo de resposta (Kubernetes): {media_max_kube:.2f} ms")
    print(f"Tempo mínimo de resposta (Docker): {media_min_docker:.2f} ms")
    print(f"Tempo mínimo de resposta (Kubernetes): {media_min_kube:.2f} ms")
    if media_docker and media_kube:
        diff = media_kube - media_docker
        print(f"Diferença (Kubernetes - Docker): {diff:.2f} ms")
    if media_max_docker and media_max_kube:
        diff = media_max_kube - media_max_docker
        print(f"Diferença (Kubernetes - Docker): {diff:.2f} ms")
    if media_min_docker and media_min_kube:
        diff = media_min_kube - media_min_docker
        print(f"Diferença (Kubernetes - Docker): {diff:.2f} ms")
    
    
    
    
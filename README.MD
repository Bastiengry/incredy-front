### Création PWA React JS :

- Primereact : https://create-react-app.dev/docs/making-a-progressive-web-app/

### Primeflex

- Primeflex : https://primeflex.org/installation

### Icons for PrimeReact

- Primereact icons : https://primereact.org/icons/

### Connect to keycloak

- Use domain name and not IP address. By instance: http://localhost:9999

### React application in Docker

- Go in root folder of incredy-front project
- Build the Docker image (with root account): docker build --tag=incredy-front:latest .
- Launch the Docker image in a container (via docker): docker run --name incredy-front --net host -p 80:80 -d incredy-front:latest
- Launch the Docker image in a container (via docker compose): docker compose up

### Minikube

- Launch WSL2 (Debian distribution): wsl --distribution Debian
- Switch to user mode: su myuser
- Launch minikube: minikube start --driver=docker (launch Minikube with user, not root)
- See Minikube dashboard: minikube dashboard
- Saves the images as TAR: docker save -o /tmp/incredy-front.tar incredy-front
- Import image in Minikube: minikube image load /tmp/incredy-front.tar
- List images in Minikube: minikube image ls --format table
- Get minikube IP: minikube ip
- Deployment of application in Minikube: kubectl apply -f kubernetes/incredy-front-complete-deployment.yml
- Launch service in Minikube: minikube service incredy-front-nodeport-service

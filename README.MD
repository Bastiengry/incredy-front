### Création PWA React JS :

- Primereact : https://create-react-app.dev/docs/making-a-progressive-web-app/

### Primeflex

- Primeflex : https://primeflex.org/installation

### Icons for PrimeReact

- Primereact icons : https://primereact.org/icons/

### React application in Docker

- Go in root folder of incredy-front project
- Build the Docker image (with root account): docker build --tag=incredy-front:latest .
- Launch the Docker image in a container (via docker): docker run --name incredy-front --net host -p 80:80 -d incredy-front:latest
- Launch the Docker image in a container (via docker compose): docker compose up

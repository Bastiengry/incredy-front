# Use the official Node.js runtime as the base image
# Step useful to set environment variables via Docker
FROM node:18 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

ARG NODE_ENV
ARG REACT_APP_KEYCLOAK_URL
ARG REACT_APP_BACKEND_PREFIX
ARG REACT_APP_BACKEND_URL

ENV NODE_ENV $NODE_ENV
ENV REACT_APP_KEYCLOAK_URL $REACT_APP_KEYCLOAK_URL
ENV REACT_APP_BACKEND_PREFIX $REACT_APP_BACKEND_PREFIX
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
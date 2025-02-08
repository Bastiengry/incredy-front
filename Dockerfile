# Use the official Node.js runtime as the base image
# Step useful to set environment variables via Docker
FROM node:23 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

ARG APP_CONFIG_FILE_PATH

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the appConfig.js
COPY $APP_CONFIG_FILE_PATH /usr/share/nginx/html/appConfig.js

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
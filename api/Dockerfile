# Use the official Node.js 16.13.0 Alpine base image
FROM node:16.13.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Install required tools for building native modules
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force && rm -rf node_modules
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code to the container
COPY . .

# Run Prisma generate to ensure the Prisma client is generated
RUN npx prisma generate

# Define the command to run the application
CMD ["npm", "run", "prod"]

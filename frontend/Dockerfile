# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# print npm version
RUN npm -v

# Copy the rest of your application code to the working directory
COPY . .

# Install app dependencies
RUN npm install
RUN npm install react-dropzone

# Expose a port to communicate with the React app
EXPOSE 4000



# Start your React app
CMD ["npm", "run", "dev"]


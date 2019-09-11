FROM node:9-alpine AS builder
 
# WORKDIR specifies the application directory
WORKDIR /usr/src/app
 
# Copying package.json file to the app directory
COPY package*.json /usr/src/app/
 
# Installing npm for DOCKER
RUN npm install
 
# Copying rest of the application to app directory
COPY . /usr/src/app/

#expose the port

EXPOSE 3000
 
# Starting the application using npm start
CMD ["npm","start"]
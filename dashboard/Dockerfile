FROM node:10.0-alpine

#Create APP directory
ADD . /app/

#Define where we work
WORKDIR /app/

#Set False the package-lock creation
RUN npm config set package-lock false

#Install dependencies
RUN npm install

#Expose port 3000
EXPOSE 3000

#Run code
CMD [ "node", "/app/index.js" ]
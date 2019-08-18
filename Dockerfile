FROM node:carbon

# Create server directory
WORKDIR /usr/src/server

# Install server dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle server source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
# Use Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source code
COPY . .

# Expose port and start application
EXPOSE 3000
CMD ["node", "src/app.js"]
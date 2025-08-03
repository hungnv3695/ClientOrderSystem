FROM node:20.14.0-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# 30000 port
EXPOSE 30000

# run the application
CMD ["npm", "start"]

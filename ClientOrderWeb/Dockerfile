FROM node:20-alpine
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./  

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# vite port
EXPOSE 5173

# run vite
CMD ["npm", "run", "dev", "--", "--host"]



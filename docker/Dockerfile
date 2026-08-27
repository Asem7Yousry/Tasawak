FROM node:22 as base
WORKDIR /app
COPY package.json .

# for development container
FROM base as development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# for production container
FROM base as production
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]


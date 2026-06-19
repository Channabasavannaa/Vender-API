# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7


#Connect
FROM amazon/aws-lambda-nodejs AS connect
# Use production node environment by default.

COPY package.json .

RUN npm install && npm install -g typescript

COPY . .

RUN npx tsc



CMD ["build/connect.handler"]

#disconnect
FROM amazon/aws-lambda-nodejs AS disconnect

COPY package.json .

RUN npm install && npm install -g typescript

COPY . .

RUN npx tsc

CMD ["build/disconnect.js"]


#sendVenderMessage
FROM amazon/aws-lambda-nodejs AS sendVender

COPY package.json .

RUN npm install && npm install -g typescript

COPY . .

RUN npx tsc

CMD ["build/sendVender.handler"]


#getAllVenders
FROM amazon/aws-lambda-nodejs AS getallvenders

COPY package.json .

RUN npm install && npm install -g typescript

COPY . .

RUN npx tsc

CMD ["build/getVenders.handler"]

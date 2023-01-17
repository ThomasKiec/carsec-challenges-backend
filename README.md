# carsec-challenges

## Installation

Dependent on the choosen project structure the Dockerfiles of the frontend and backend
projects may need to be modified
As the webplattform is build by dockers a docker-compose.yml needs to be created
with the following scheme:

```
version: '3'

services:
    db:
        build: ./carsec-challenges-backend/database
        environment:
            MYSQL_DATABASE: hacking_challenges
            MYSQL_ROOT_PASSWORD: <MYSQL Root Password>
            MYSQL_USER: carsec-challenges-backend
            MYSQL_PASSWORD: carsec-challenges-backend
            DATABASE_HOST: db
    carsecChallengesFrontend:
        build: ./carsec-challenges-frontend/
    carsecChallengesServer:
        build: ./carsec-challenges-backend/
        environment:
            DB_HOST: db
            DB_USER: carsec-challenges-backend
            DB_PASSWORD: carsec-challenges-backend
            DB_DATABASE: hacking_challenges
            DB_PORT: 3306
            EMAIL_USER: <Service E-Mail Adress>
            EMAIL_PASSWORD: <Service E-Mail password>
            PORT: 4000
            JWT_SECRET: <JWT_Secret>
            NODE_ENV: production
        container_name: docker-carsec-challenges
        restart: on-failure
        ports:
            - '80:4000'
        depends_on:
            - db
            - carsecChallengesFronted

```

## Start Webserver

```
docker-compose run
```

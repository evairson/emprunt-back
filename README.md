## Description

Système d'emprunt du matériel du BDS. Projet réalisé dans le cadre d'un défi sérieux de la campagne BDS pour la liste Totally Sport!

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Create database

We recommend using Docker to create the database. You can run the following command to create a PostgreSQL database:

```bash
$ docker run --name bds-postgres \
  -e POSTGRES_PASSWORD=YOUR_PASSWORD \
  -e POSTGRES_DB=emprunt \
  -p 5432:5432 \
  -d postgres
```

Don't forget to update the `DATABASE_URL` in the `.env` file with the correct credentials and host information.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

## Authors

- Eva Herson
- Gabriel Sabot
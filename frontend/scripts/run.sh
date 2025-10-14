#!/bin/bash

docker run --name fluxion-fe --env-file .env -p 3000:3000 fluxion-fe:latest

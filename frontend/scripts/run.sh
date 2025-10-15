#!/bin/bash

docker run --name fluxion-fe --env-file .env --network fluxion_net --rm -p 3000:3000 fluxion-fe:latest

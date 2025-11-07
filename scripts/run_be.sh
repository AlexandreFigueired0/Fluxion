#!/bin/bash

docker run -d --rm -p 8080:8080 --name fluxion-be --network fluxion_net --env-file backend/.env fluxion-be
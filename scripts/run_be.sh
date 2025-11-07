#!/bin/bash

docker run -d --rm -p 8080:8080 --name fluxion-be --env-file backend/.env fluxion-be
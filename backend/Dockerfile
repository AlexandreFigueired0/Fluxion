FROM golang:1.25.4-alpine3.21

WORKDIR /app

COPY . .

RUN go mod download && \
    go build -o main . 

EXPOSE 8080

ENTRYPOINT ["./main"]
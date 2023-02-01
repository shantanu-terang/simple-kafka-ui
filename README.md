# simple-kafka-ui
Simple Kafka UI for local development

# Start the server by running
```bash
docker run -p3000:3000 -v$(pwd)/kafka.json:/app/config.json shantanuterang/simple-kafka-ui

# open http://localhost:3000
```

# Example without password
```JSON
{
    "clientId": "simple-kafka-ui",
    "brokers": [
        "localhost:9092"
    ]
}
```

# Example if you are using confluent cloud
```JSON
{
    "clientId": "simple-kafka-ui",
    "brokers": [
        "<your id>.us-central1.gcp.confluent.cloud:9092"
    ],
    "connectionTimeout": 5000,
    "ssl": true,
    "sasl": {
        "mechanism": "plain",
        "username": "your_username",
        "password": "your password"
    }
}
```

# Example Localhost with plain password
```JSON
{
    "clientId": "simple-kafka-ui",
    "brokers": ["localhost:9092"],
    "connectionTimeout": 5000,
    "sasl": {
        "mechanism": "plain",
        "username": "alice",
        "password": "alice-secret"
    }
}
```

# Example if using https://www.cloudkarafka.com/
```JSON
{
  "clientId": "simple-kafka-ui",
  "brokers": ["hello-01.srvs.cloudkafka.com:9094"],
  "authenticationTimeout": 10000,
  "reauthenticationThreshold": 10000,
  "ssl": true,
  "sasl": {
    "mechanism": "scram-sha-256",
    "username": "lpy10330",
    "password": "M6_DV-bW9Qn7BzwDsFasAfeRBcBZVGAb"
  }
}
```
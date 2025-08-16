# 🚀 Simple Kafka UI

A modern, lightweight **Kafka UI for local development**.  
Easily manage your Kafka topics, messages, and streams with an intuitive interface.  

---

## ✨ Features

- 🔧 **Topic Management** – create and list topics  
- 📜 **Message Explorer** – list and filter/search messages  
- 📡 **Realtime Streaming** – enable realtime updates for live data inspection  
- ✍️ **Produce Messages** – publish new messages directly from the UI  
- 🔁 **Resend Messages** – quickly resend messages to topics  
- 🎨 **Theme Support** – light/dark mode toggle  
- 🐳 **Dockerized** – simple setup with Docker & Docker Compose  

---

## 🛠️ Tech Stack

**Backend**  
- [Express.js](https://expressjs.com/)  
- [KafkaJS](https://kafka.js.org/)  
- [Socket.IO](https://socket.io/)  

**Frontend**  
- [Vite](https://vitejs.dev/) + [React (TypeScript)](https://react.dev/)  
- [Zustand](https://github.com/pmndrs/zustand)  
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)  

**Deployment**  
- Docker & Docker Compose  

---

## 🚀 Getting Started

📦 Docker Hub: [shantanuterang/simple-kafka-ui](https://hub.docker.com/r/shantanuterang/simple-kafka-ui)

### Run with Docker Compose
You can also check the [docker-compose.yml](./docker-compose.yml) file in the root of this repository.


```bash
docker compose up

# or

docker compose -f docker-compose.dev.yml up 

```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

or 

Open [http://localhost:5173](http://localhost:5173) for development version.


---

## ⚙️ Example Configurations

### Localhost (no password)
```json
{
  "clientId": "simple-kafka-ui",
  "brokers": ["kafka:9092", "localhost:29092"],
  "connectionTimeout": 5000
}
```

### Localhost with Plain Password
```json
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

### Confluent Cloud
```json
{
  "clientId": "simple-kafka-ui",
  "brokers": ["<your-id>.us-central1.gcp.confluent.cloud:9092"],
  "connectionTimeout": 5000,
  "ssl": true,
  "sasl": {
    "mechanism": "plain",
    "username": "your_username",
    "password": "your_password"
  }
}
```

### CloudKarafka
```json
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

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 🎉  
Feel free to check the [issues page](../../issues) or open a pull request.

To contribute:
1. Fork this repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📌 Notes
- This project is built for **local development purposes** (not production).  
- Requires a running Kafka cluster (local or cloud).  

---

## 📜 License
MIT License – free to use, modify, and distribute.
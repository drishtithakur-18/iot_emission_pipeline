# High-Throughput IoT Emission Ingestion Pipeline

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)


An event-driven backend pipeline designed to process high-frequency telemetry data from IoT devices. Built to handle massive traffic spikes without dropping payloads or blocking the Node.js event loop.

## Load Testing & Performance
Stress-tested using **Autocannon** with the initial burst throughput exceeding 66k requests/10s, while sustained throughput stabilized around 36k requests/10s.
* **Sustained Throughput:** ~3,600 Requests/Second
* **Average Latency:** ~27.5ms
* **Reliability:** Safely buffered 36,000+ concurrent requests during a 10-second burst window .

<img width="850" height="390" alt="image" src="https://github.com/user-attachments/assets/d6fa8dcc-a600-46be-a103-2839d8b42e9d" />




## Core Architecture & Engineering Decisions
* **Asynchronous Ingestion:** Redis Streams act as an in-memory shock absorber, decoupling the Express API ingestion layer from MongoDB network I/O.
* **Optimized Database Writes:** Background worker nodes process events asynchronously and utilize memory arrays to execute MongoDB `.insertMany()` batch inserts, drastically reducing connection overhead.
* **Poison Pill Prevention:** Strict payload validation via Joi at the edge prevents malformed sensor data from entering the message broker.
* **Dead Letter Queue (DLQ):** Failed events or database constraint errors inside the worker are caught, isolated, and routed to a dedicated DLQ stream to prevent infinite crash loops.
* **Future Scalability:** The architecture is designed to easily extend with Redis Consumer Groups for horizontal scaling of worker nodes.

## Architecture Flow
`IoT Devices` ➔ `Express API Gateway` ➔ `Redis Stream` ➔ `Worker Service` ➔ `MongoDB`

## Local Setup & Installation

**Prerequisites:** Docker, Docker Compose, Node.js (v18+)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/drishtithakur-18/iot_emission_pipeline.git
3. **Install Dependencies:**
   ```bash
   npm install
5. **Start the Infrastructure (Redis & MongoDB):**
   ```bash
   docker-compose up -d
7. **Run the API Server & Worker:**
   *(Open two separate terminals)*
   ```bash
   npm run dev
   node src/workers/worker.js

## Running the Load Test
To reproduce the 6,500+ req/sec benchmark locally, run the Autocannon script:
`npm run test:load` 

## 📂 Project Structure

<img width="367" height="427" alt="image" src="https://github.com/user-attachments/assets/08a50369-1b82-48a2-a0df-fb77f4304616" />



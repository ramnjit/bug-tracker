# Bug Tracker API (Serverless Microservices on AWS)

A complete, multi-service backend for a bug tracking application, built with a serverless-first, microservice architecture on AWS using Node.js and AWS SAM.

## Synopsis

This project is a robust, scalable, and professionally deployed backend system. It features a full authentication service with JWTs, a custom authorizer, and multiple microservices for managing organizations, issues, and comments. The system also includes an asynchronous event-driven notification flow using SNS and SQS.

The entire infrastructure is defined as code (IaC) using AWS SAM and is automatically deployed via a CI/CD pipeline with GitHub Actions.

A full frontend for this application is currently in development. In the meantime, the entire backend API can be fully tested using an API client like **Insomnia** or **Postman**. A simple `demo.html` page is also included to demonstrate the live `/register` and `/login` endpoints.

---

## Live Demo URL

**Live API Base URL:** `https://lnh11a8k6j.execute-api.us-east-1.amazonaws.com/Prod/`

---

## Technology Stack

* **Backend:** **Node.js** - The runtime environment for the server-side JavaScript code.
* **Infrastructure:** **AWS (Amazon Web Services)** - The cloud provider hosting all services.
    * **Lambda:** Provides the serverless, event-driven compute for each microservice.
    * **API Gateway:** Creates and manages the public HTTP endpoints for the API.
    * **DynamoDB:** A fully-managed NoSQL database used for all data storage.
    * **SNS (Simple Notification Service):** A messaging topic used to publish events (e.g., "issue created").
    * **SQS (Simple Queue Service):** A message queue that receives events from SNS for reliable, asynchronous processing.
* **IaC (Infrastructure as Code):** **AWS SAM (`template.yaml`)** - Defines all cloud resources in a single, version-controlled file.
* **CI/CD:** **GitHub Actions** - Automates the build and deployment process on every push to the `main` branch.
* **Authentication:** **JSON Web Tokens (JWT)** - The standard used to create secure authentication tokens to protect API endpoints.

## API Endpoints

* `POST /register`
* `POST /login`
* `POST /organizations` (Secure)
* `POST /organizations/{orgId}/issues` (Secure)
* `GET /organizations/{orgId}/issues` (Secure)
* `POST /issues/{issueId}/comments` (Secure)
* `GET /issues/{issueId}/comments` (Secure)

# 📊 Influencer Intel Dashboard

An interactive analytics dashboard built with **Python**, **Streamlit**, and **Pandas** to help influencer marketers and content creators analyse YouTube channel performance, uncover audience insights, and make data-driven decisions.

This project began as a data analytics application and is now being continuously evolved as part of my **Cloud Engineering** learning journey. Future iterations will focus on containerization, cloud deployment on AWS, infrastructure automation, monitoring, and cloud cost optimization (FinOps).

---

## 🎯 Project Overview

Influencer Intel Dashboard provides a clean and interactive interface for exploring YouTube analytics data. It transforms raw datasets into meaningful visualisations and key performance indicators (KPIs), making it easier to evaluate channel growth, audience engagement, and content performance.

The project demonstrates practical skills in:

- Data analysis
- Data visualization
- Dashboard development
- Python programming
- Business intelligence
- Software engineering fundamentals

As I progress through Cloud Engineering, this repository will continue evolving into a cloud-native analytics platform.

---

## ✨ Features

- 📈 Interactive analytics dashboard
- 📊 Key Performance Indicators (KPIs)
- 📉 Data visualisations using Plotly
- 🔍 Interactive filtering and exploration
- 🧹 Data cleaning and preprocessing with Pandas
- 📁 CSV dataset support
- ⚡ Fast and responsive Streamlit interface

---

## 🛠️ Tech Stack

### Current Technologies

- Python
- Streamlit
- Pandas
- NumPy
- Plotly

### Planned Technologies

- Docker
- AWS ECS (Fargate)
- Amazon ECR
- Amazon S3
- Amazon RDS (PostgreSQL)
- GitHub Actions
- Amazon CloudWatch
- AWS CloudFormation
- Terraform

---

## 📂 Project Structure

```text
Influencer-Intel-Dashboard/
│
├── pages/                  # Streamlit pages
├── assets/                 # Images and static assets
├── data/                   # Sample datasets
├── Home.py                 # Main Streamlit application
├── requirements.txt
├── Dockerfile
├── .dockerignore
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/Thando-init/Influencer-Intel-Dashboard.git
cd Influencer-Intel-Dashboard
```

### Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

Windows

```bash
.venv\Scripts\activate
```

macOS/Linux

```bash
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the application

```bash
streamlit run Home.py
```

---

## 🐳 Running with Docker

Build the Docker image:

```bash
docker build -t influencer-intel-dashboard .
```

Run the container:

```bash
docker run -p 8501:8501 influencer-intel-dashboard
```

Then open:

```
http://localhost:8501
```

---

# ☁️ Cloud Engineering Roadmap

This project is being continuously evolved as part of my Cloud Engineering learning journey.

Rather than treating this as a once-off dashboard, my goal is to progressively transform it into a scalable cloud-native analytics platform by applying concepts learned through AWS and modern cloud-native development.

Future iterations will focus on:

- Containerization
- AWS deployment
- Infrastructure as Code
- Monitoring
- CI/CD
- Cloud cost optimization (FinOps)

---

# 🏗️ Current Architecture

```text
                   +----------------------+
                   |   YouTube Dataset    |
                   |    CSV / Excel       |
                   +----------+-----------+
                              |
                              |
                              v
                   +----------------------+
                   |      Pandas          |
                   | Data Cleaning & ETL  |
                   +----------+-----------+
                              |
                              |
                              v
                   +----------------------+
                   | Business Analytics   |
                   | KPI Calculations     |
                   +----------+-----------+
                              |
                              |
                              v
                   +----------------------+
                   |     Streamlit UI     |
                   | Interactive Dashboard|
                   +----------+-----------+
                              |
                              |
                              v
                           End User
```

---

# ☁️ Planned AWS Cloud Architecture

```text
                    GitHub Repository
                           |
                           |
                    GitHub Actions (CI/CD)
                           |
                           |
                           v
                 Amazon Elastic Container Registry
                           |
                           |
                           v
                  Amazon ECS (Fargate)
                           |
                           |
              Application Load Balancer
                           |
                           |
                           v
                      Streamlit App
                           |
                 +---------+---------+
                 |                   |
                 |                   |
                 v                   v
         Amazon RDS           Amazon S3
      (Analytics Data)      (Datasets & Assets)

                           |
                           |
                           v
                    Amazon CloudWatch
                 (Logs & Monitoring)
```

---

# ☁️ Future Cloud Deployment

Although the current version of the application runs locally using Streamlit, the long-term vision is to deploy it as a scalable cloud-native analytics platform on Amazon Web Services (AWS).

The planned deployment architecture includes:

- Amazon ECS (Fargate) for hosting the containerized application
- Amazon ECR for Docker image storage
- Amazon S3 for datasets and static assets
- Amazon RDS (PostgreSQL) for persistent storage
- Application Load Balancer (ALB)
- Amazon CloudWatch for monitoring and logging
- GitHub Actions for CI/CD automation

---

# 📈 Future Enhancements

## Cloud Engineering

- Deploy the application to AWS
- Containerize the application using Docker
- Implement Infrastructure as Code
- Configure CI/CD pipelines
- Add monitoring and logging
- Improve application scalability

## Analytics

- Support multiple datasets
- Historical analytics
- Export reports
- Advanced KPI calculations
- Enhanced interactive filtering

## Integrations

- YouTube Data API
- Authentication and user accounts
- Scheduled data refreshes
- PostgreSQL database
- REST API backend

## FinOps

As I continue learning Cloud Engineering, I also plan to incorporate FinOps principles by:

- Monitoring cloud resource usage
- Understanding AWS pricing models
- Optimising infrastructure for cost efficiency
- Tracking cloud resource consumption
- Exploring budgeting and cloud cost reporting

---

# 🎯 Learning Objectives

This repository serves as a practical learning project for applying software engineering and cloud computing concepts.

Current focus areas include:

- Python application development
- Interactive dashboards
- Data analysis
- Data visualization

Future focus areas include:

- Docker
- Cloud-native applications
- AWS
- Infrastructure as Code
- CI/CD
- Monitoring & Observability
- Cloud Cost Optimization (FinOps)

---

# 🛣️ Project Roadmap

- [x] Build an interactive Streamlit dashboard
- [x] Perform data cleaning with Pandas
- [x] Create interactive visualisations
- [x] Publish project on GitHub
- [ ] Containerize using Docker
- [ ] Deploy to AWS
- [ ] Add PostgreSQL backend
- [ ] Integrate the YouTube Data API
- [ ] Implement GitHub Actions CI/CD
- [ ] Add authentication
- [ ] Configure Amazon CloudWatch monitoring
- [ ] Explore FinOps cost optimisation techniques

---

# 📜 License

This project is licensed under the MIT License.

---

## 👤 Author

**Thando Majola**

GitHub: https://github.com/Thando-init

---

> **Note:** This repository is an evolving portfolio project and will continue to grow as I expand my skills in Cloud Engineering, AWS, distributed systems, and FinOps.
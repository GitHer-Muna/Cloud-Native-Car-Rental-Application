# Cloud-Native Car Rental Application with GitOps 🚀

[![GitOps Pipeline](https://github.com/your-username/cloud-native-car-rental/workflows/GitOps%20Pipeline/badge.svg)](https://github.com/your-username/cloud-native-car-rental/actions)

## 📋 What This Project Demonstrates

A production-ready car rental system showcasing **modern DevOps and GitOps practices**:

- ✅ **GitOps**: Git as single source of truth for deployment
- ✅ **Event-Driven Architecture**: Async processing with Azure Functions
- ✅ **Microservices**: Containerized services with Docker
- ✅ **CI/CD**: Automated testing and deployment
- ✅ **Cloud-Native**: Serverless, NoSQL, and message queues
- ✅ **Infrastructure as Code**: Automated Azure resource provisioning

**🌟 Perfect for DevOps learners and interview preparation!**

## What This Application Does

This application allows customers to book rental cars through a web interface. The system processes bookings asynchronously using Azure Functions, stores data in Cosmos DB, and sends confirmation emails to customers.

### Real-World Example

This mimics a real car rental system where:
- Customers book online 24/7
- System handles high traffic (thousands of bookings)
- Bookings are processed reliably even during peak times
- All data is stored securely in the cloud
- Customers receive instant email confirmations

## How It Works: Local vs Cloud

### Local Development (docker-compose up)
```
Customer → Frontend → BFF Service → Console Logs
                                  ↓
                            (No persistence)
```
- Data is **NOT saved** to any database
- Queues are **simulated** in-memory
- Functions are **not connected**
- Restart = all data lost

### Cloud Deployment (Azure)
```
Customer → Frontend → BFF Service → rent-queue
                                        ↓
                                  RentProcess Function
                                        ↓
                                  Cosmos DB (Rentals)
                                        ↓
                                  payment-queue
                                        ↓
                                  PaymentProcess Function
                                        ↓
                                  Cosmos DB (Payments) + Email
```
- All data **persists** in Cosmos DB
- Queues ensure **reliable** processing
- Functions run **automatically**
- **Scalable** to millions of bookings

### What Happens When You Click "Book Now"?

**Locally:**
1. Form data sent to BFF
2. BFF logs booking to console
3. Returns success message
4. **Nothing is saved**

**In Cloud:**
1. Form data sent to BFF on Azure
2. BFF creates booking message → sends to `rent-queue`
3. RentProcess Function triggered automatically
4. Booking saved to Cosmos DB `Rentals` collection
5. Payment message sent to `payment-queue`
6. PaymentProcess Function triggered
7. Payment saved to Cosmos DB `Payments` collection
8. Confirmation email sent (if configured)
9. **Everything persists forever** in database

## System Architecture

The system follows a cloud-native architecture with the following components:

- **Frontend**: Simple HTML/CSS/JavaScript interface for customers to book cars
- **BFF Service**: Node.js Backend-for-Frontend that handles API requests and queue management
- **RentProcess Function**: Azure Function that processes rental bookings from the queue
- **PaymentProcess Function**: Azure Function that handles payment processing and sends notifications
- **Storage Queues**: Message queues for asynchronous communication between services
- **Cosmos DB**: NoSQL database for storing rental and payment records
- **Application Insights**: Monitoring and logging for the entire system

## Project Structure

```
Cloud-Native Car Rental Application/
├── .github/workflows/
│   └── ci-cd.yml               # GitOps pipeline (automated deployment)
├── frontend/                    # Web UI
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── Dockerfile
├── bff-service/                 # Backend API
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── azure-functions/
│   ├── RentProcess/            # Rental processing function
│   └── PaymentProcess/         # Payment processing function
├── config/                     # GitOps environment configurations
│   ├── production.env
│   └── staging.env
├── docker-compose.yml          # Local development environment
├── GITOPS.md                   # 🚀 GitOps implementation guide
└── README.md                   # This file
```

## 🚀 GitOps Deployment (Recommended)

This project uses **GitOps** for deployment - the simplest and most modern way!

### Quick Start: Deploy to Cloud

1. **Fork this repository** to your GitHub account

2. **Add Azure credentials** as GitHub Secret:
   ```bash
   # Create service principal
   az ad sp create-for-rbac --name "carrental-sp" \
     --role contributor \
     --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
     --sdk-auth
   ```
   Copy the JSON output and add as `AZURE_CREDENTIALS` secret in GitHub

3. **Push to deploy**:
   ```bash
   git checkout main
   git push origin main
   # ✅ Automatically deploys to production!
   ```

### GitOps in Action

| Action | What Happens |
|--------|--------------|
| Push to `main` branch | → Deploys to **Production** |
| Push to `staging` branch | → Deploys to **Staging** (for testing) |
| Git commit revert | → Automatically rolls back deployment |

**That's it! No manual Azure portal work needed.** 🎯

👉 **Learn more:** See [GITOPS.md](GITOPS.md) for detailed GitOps guide

## Project Structure

```
Cloud-Native Car Rental Application/
├── frontend/                    # Web UI
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── Dockerfile
├── bff-service/                 # Backend API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── azure-functions/
│   ├── RentProcess/            # Rental processing function
│   │   ├── RentProcess/
│   │   │   ├── function.json
│   │   │   └── index.js
│   │   ├── host.json
│   │   ├── package.json
│   │   └── local.settings.json
│   └── PaymentProcess/         # Payment processing function
│       ├── PaymentProcess/
│       │   ├── function.json
│       │   └── index.js
│       ├── host.json
│       ├── package.json
│       └── local.settings.json
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
└── README.md
```

## Prerequisites

Before you begin, make sure you have these installed:

- Node.js 18 or higher
- Azure CLI
- Azure Functions Core Tools
- Docker and Docker Compose
- Git
- An Azure subscription (for cloud deployment)

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Cloud-Native\ Car\ Rental\ Application
```

### Step 2: Install Dependencies

```bash
cd bff-service
npm install
cd ..

cd azure-functions/RentProcess
npm install
cd ../..

cd azure-functions/PaymentProcess
npm install
cd ../..
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `bff-service` directory:

```bash
cd bff-service
copy .env.example .env
```

For local development, you can leave the Azure connection strings empty. The application will run in local mode.

### Step 4: Run with Docker Compose (Recommended)

```bash
docker-compose up --build
```

This starts:
- Frontend on http://localhost:8080
- BFF Service on http://localhost:3000
- Azurite (local Azure Storage emulator)

### Step 5: Run Services Individually (Alternative)

**Terminal 1 - BFF Service:**
```bash
cd bff-service
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Open index.html in your browser or use a simple HTTP server
npx http-server -p 8080
```

**Terminal 3 - RentProcess Function:**
```bash
cd azure-functions/RentProcess
func start --port 7071
```

**Terminal 4 - PaymentProcess Function:**
```bash
cd azure-functions/PaymentProcess
func start --port 7072
```

## Testing Locally

1. Open http://localhost:8080 in your browser
2. Fill out the booking form with your details
3. Click "Book Now"
4. You should see a success message with your booking ID
5. Check the BFF Service terminal to see the booking being logged

**Note**: In local mode without Azure Storage connection:
- Bookings are logged to console only
- No data is persisted to database
- Queues are simulated in-memory

## 🚀 GitOps Cloud Deployment

### Automated GitOps Deployment (Recommended)

The project uses **GitOps** for zero-touch deployment - just push to Git!

#### Step 1: Set Up GitHub Secrets

Add `AZURE_CREDENTIALS` secret to your GitHub repository:

```bash
az ad sp create-for-rbac --name "carrental-sp" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID \
  --sdk-auth
```

Copy the JSON output → GitHub Repository → Settings → Secrets → New secret → Name: `AZURE_CREDENTIALS`

#### Step 2: Deploy with Git Push

```bash
# Deploy to production
git checkout main
git push origin main

# Deploy to staging (for testing)
git checkout -b staging
git push origin staging
```

**That's all!** The GitOps pipeline automatically:
- ✅ Creates Azure infrastructure (if doesn't exist)
- ✅ Runs tests
- ✅ Builds Docker images
- ✅ Deploys applications
- ✅ Verifies deployment health

#### Step 3: Access Your Application

After deployment completes (5-10 minutes), access at:
- **Production**: `https://carrental-frontend.azurewebsites.net`
- **Staging**: `https://carrental-staging-frontend.azurewebsites.net`

### What Gets Created in Azure

The GitOps pipeline automatically provisions:

| Resource | Purpose | Environment |
|----------|---------|-------------|
| Resource Group | Container for all resources | `rentacar-app-rg` (prod) |
| Storage Account | Queue storage for functions | Auto-generated name |
| Cosmos DB | NoSQL database for data | `carrental-cosmos` |
| Function App | Serverless functions | `carrental-functions` |
| App Services (2x) | Frontend & BFF hosting | `carrental-frontend/bff` |

### Rollback a Deployment

```bash
# Find the last good commit
git log

# Revert to it
git revert <commit-hash>

# Push to trigger re-deployment
git push origin main
```

## 📊 Monitoring GitOps Deployments

### View Deployment Status

1. Go to your GitHub repository
2. Click "**Actions**" tab
3. See real-time deployment progress
4. Click on any workflow run for detailed logs

### Pipeline Jobs (GitOps Automation)

| Job | Purpose | Duration |
|-----|---------|----------|
| GitOps Info | Shows environment detection | 10s |
| Build & Test | Validates code quality | 1-2min |
| Create Infrastructure | Provisions Azure resources | 5-8min |
| Deploy Applications | Deploys to cloud | 2-3min |
| Health Check | Verifies deployment | 30s |

### Pipeline Triggers

- ✅ **Automatic**: Push to `main` or `staging` branch
- ✅ **Manual**: Workflow dispatch in GitHub Actions

### Check Deployment Health
- View deployment logs in Azure Portal
- Monitor Application Insights for application metrics

### CI/CD Troubleshooting

#### Common Issues

1. **ACR Login Fails**: Check `AZURE_CREDENTIALS` secret format
2. **Function Deployment Fails**: Ensure Functions app exists in Azure
3. **App Service Deployment Fails**: Check container registry permissions
4. **Health Check Fails**: Wait a few minutes for services to start

#### Logs

- **GitHub Actions**: View in Actions tab
- **Azure Functions**: Check in Azure Portal → Function App → Logs
- **App Services**: Check in Azure Portal → App Service → Logs

## Environment Variables

### BFF Service
- `PORT`: Server port (default: 3000)
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string
- `RENT_FUNCTION_URL`: RentProcess function URL (optional)
- `PAYMENT_FUNCTION_URL`: PaymentProcess function URL (optional)

### Azure Functions
- `AzureWebJobsStorage`: Storage account for functions runtime
- `AZURE_STORAGE_CONNECTION_STRING`: Storage account for queues
- `COSMOS_DB_CONNECTION_STRING`: Cosmos DB connection string
- `SENDGRID_API_KEY`: SendGrid API key for emails (optional)
- `NOTIFICATION_EMAIL`: Sender email address

## Monitoring and Troubleshooting

### View Function Logs

```bash
az functionapp log tail \
  --resource-group rentacar-app-rg \
  --name <function-app-name>
```

### Check Application Insights

Go to Azure Portal → Application Insights → your instance → Logs

Query example:
```kusto
traces
| where timestamp > ago(1h)
| order by timestamp desc
```

### Check Queue Messages

```bash
az storage message peek \
  --queue-name rent-queue \
  --account-name <storage-account-name>
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Serverless**: Azure Functions (Node.js runtime)
- **Database**: Azure Cosmos DB
- **Messaging**: Azure Storage Queues
- **Monitoring**: Azure Application Insights
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Email**: SendGrid (optional)

## Key Features

- **🚀 GitOps deployment** - Push to Git = deployed to cloud
- **Event-driven architecture** - Async processing with Azure Functions
- **Scalable NoSQL database** - Cosmos DB for high performance
- **Containerized microservices** - Docker for consistency
- **Automated CI/CD** - GitHub Actions pipeline
- **Cloud-native patterns** - Serverless, queues, managed services
- **Environment management** - Production and staging via Git branches
- **Responsive web interface** - Modern HTML/CSS/JavaScript

## 🎓 What You'll Learn

### DevOps & GitOps
1. ✅ **GitOps principles** and implementation
2. ✅ **Git-based deployments** and automation
3. ✅ **CI/CD pipeline** design and optimization
4. ✅ **Infrastructure as Code** with Azure
5. ✅ **Environment management** (prod/staging)

### Cloud Architecture
6. ✅ **Event-driven architecture** with message queues
7. ✅ **Serverless computing** with Azure Functions
8. ✅ **NoSQL databases** with Cosmos DB
9. ✅ **Microservices** design patterns
10. ✅ **Container orchestration** with Docker

### Interview-Ready Skills
11. ✅ Answer "What is GitOps?" confidently
12. ✅ Explain cloud-native architecture
13. ✅ Demonstrate automated deployments
14. ✅ Discuss infrastructure automation
15. ✅ Show real production-like project

**💼 Portfolio Value:** This project demonstrates enterprise-level DevOps practices that companies look for!

## Future Enhancements

- Add user authentication with Azure AD
- Implement payment gateway integration
- Add real-time availability checking
- Create admin dashboard for managing cars
- Implement API Gateway with Azure API Management
- Add caching with Azure Redis Cache
- Implement search functionality with Azure Cognitive Search

## Contributing

This is a learning project. Feel free to fork and modify it for your own learning purposes.

## License

MIT License - Feel free to use this project for learning and portfolio purposes.

## Contact

Created as a DevOps learning project. Connect with me on LinkedIn to discuss cloud technologies and DevOps practices!

---

**Note**: This project is designed for learning purposes and demonstrates cloud-native application development. For production use, additional security, error handling, and testing would be required.

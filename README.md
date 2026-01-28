# Cloud-Native Car Rental Application

[![CI/CD Pipeline](https://github.com/your-username/cloud-native-car-rental/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-username/cloud-native-car-rental/actions)

## Ready for Deployment

A complete cloud-based car rental system built with modern DevOps practices and Azure services. This project demonstrates event-driven architecture, microservices patterns, and containerization with Docker. Deployment is automated via CI/CD pipeline.

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

## Cloud Deployment

### Option 1: Automated Deployment (Recommended)

This project includes a complete CI/CD pipeline that automatically deploys to Azure:

1. **Fork & Clone** the repository
2. **Set up GitHub Secrets** (see CI/CD Setup below)
3. **Push to main branch** to trigger automatic deployment
4. **Monitor deployment** in GitHub Actions tab

### Option 2: Manual Infrastructure Setup

If you prefer to set up infrastructure manually:

1. Go to GitHub Actions
2. Select "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Choose "create-infrastructure" from branch dropdown
5. Click "Run workflow"

This creates:
- Resource Group
- Storage Account (for queues and function storage)
- Cosmos DB Account
- Application Insights
- Function App
- Container Registry
- App Services for BFF and Frontend

After deployment, access the application at the URLs provided in the GitHub Actions logs.

## CI/CD Pipeline Setup

### Pipeline Features
- **Automated Testing**: Runs tests for BFF service and Azure Functions
- **Docker Build**: Builds and pushes container images to Azure Container Registry
- **Azure Deployment**: Deploys functions and app services automatically
- **Health Checks**: Verifies deployments are working correctly

### GitHub Secrets Required

Add these secrets to your GitHub repository:

- `AZURE_CREDENTIALS`: Azure service principal credentials (JSON format)
- `AZURE_STORAGE_CONNECTION_STRING`: Storage account connection string
- `COSMOS_DB_CONNECTION_STRING`: Cosmos DB connection string

### Azure Service Principal Setup

```bash
# Create service principal
az ad sp create-for-rbac --name "carrental-cicd-sp" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/rentacar-app-rg \
  --sdk-auth
```

Copy the JSON output and add it as `AZURE_CREDENTIALS` secret.

### Pipeline Jobs

1. **Build and Test**: Runs tests for all applications
2. **Build and Push Docker Images**: Creates and pushes container images to Azure Container Registry
3. **Deploy Functions**: Deploys Azure Functions to Azure
4. **Deploy App Services**: Deploys containerized apps to Azure App Services
5. **Health Check**: Verifies deployments are working

### Pipeline Triggers
- Automatic deployment on push to `main`/`master` branch
- Manual infrastructure creation via workflow dispatch

### CI/CD Monitoring

- Check GitHub Actions tab for pipeline status
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

- Event-driven architecture using message queues
- Asynchronous processing with Azure Functions
- Scalable NoSQL database with Cosmos DB
- Containerized services for easy deployment
- Automated CI/CD with GitHub Actions
- Cloud-native design patterns
- RESTful API design
- Responsive web interface

## What You'll Learn

By building this project, you will learn:

1. How to design cloud-native applications
2. Event-driven architecture with message queues
3. Serverless computing with Azure Functions
4. Working with NoSQL databases (Cosmos DB)
5. Containerization with Docker
6. CI/CD and automated deployment
7. Deploying applications to Azure
8. Monitoring and logging in cloud environments
9. Asynchronous communication patterns
10. DevOps practices and cloud architecture

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

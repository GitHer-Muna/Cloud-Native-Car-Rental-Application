# Car Rental Application on Azure Cloud

A simple car rental booking system that runs on Microsoft Azure cloud. This project shows how to build and deploy a real cloud application.

## What This Application Does

Customers can book rental cars through a website. The system:
- Accepts bookings from customers
- Processes bookings automatically
- Saves all data to cloud database
- Sends email confirmations

## Why I Built This

I wanted to learn:
- How to build cloud applications
- How to use Azure services
- How to deploy code automatically
- How to make systems that can grow

This project is perfect for learning DevOps and cloud development.

## How It Works

```
Customer fills form → Website → Backend → Queue → Function → Database
                                                      ↓
                                               Email sent ✓
```

**Step by step:**
1. Customer enters booking details on website
2. Backend receives the booking
3. Booking goes into a queue (waiting line)
4. Azure Function picks it up automatically
5. Saves to database
6. Sends confirmation email

## Project Structure

```
📁 Car Rental Application/
│
├── 📁 frontend/                  ← Website (HTML, CSS, JavaScript)
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── 📁 bff-service/              ← Backend API (Node.js)
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── 📁 azure-functions/          ← Cloud functions (serverless)
│   ├── RentProcess/             ← Processes bookings
│   └── PaymentProcess/          ← Handles payments
│
├── 📁 .github/workflows/        ← Auto-deployment (CI/CD)
│   └── ci-cd.yml
│
├── docker-compose.yml           ← Run everything locally
├── README.md                    ← You are here
├── BLOG.md                      ← My learning story
└── GITOPS.md                    ← GitOps guide
```

## What You Need

Before starting, install these on your computer:
- **Node.js** (version 18 or newer) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** - [Download here](https://www.docker.com/)
- **Azure account** (free) - [Sign up here](https://azure.microsoft.com/free/)

## Running Locally (On Your Computer)

### Quick Start with Docker

1. **Clone this project:**
```bash
git clone <your-repo-url>
cd "Cloud-Native Car Rental Application"
```

2. **Start everything:**
```bash
docker-compose up
```

3. **Open your browser:**
- Go to: http://localhost:8080
- Fill the booking form
- Click "Book Now"
- See the success message!

**Note:** When running locally, bookings are not saved to database. They only show in logs. To save data, deploy to Azure cloud.

### Running Without Docker

If you want to run services separately:

**1. Start Backend:**
```bash
cd bff-service
npm install
npm start
```

**2. Open Frontend:**
- Open `frontend/index.html` in your browser
- Or use: `npx http-server frontend -p 8080`

## Deploying to Azure Cloud

Since you already have GitHub secrets set up, deployment is simple!

### Step 1: Check Your GitHub Secret

Go to your GitHub repository:
- Click **Settings** → **Secrets and variables** → **Actions**
- Make sure you have a secret named: `AZURE_CREDENTIALS`
- If yes, you're ready! If no, follow Step 2.

### Step 2: Create Azure Secret (If Needed)

Open terminal and run:

```bash
# Login to Azure
az login

# Get your subscription ID
az account show --query id -o tsv

# Create service principal (replace YOUR-SUBSCRIPTION-ID with real ID)
az ad sp create-for-rbac --name "carrental-deploy" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID
```

Copy the JSON output that looks like this:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx"
}
```

Add this to GitHub:
- Go to: Repository → Settings → Secrets → Actions
- Click "New repository secret"
- Name: `AZURE_CREDENTIALS`
- Value: Paste the JSON
- Click "Add secret"

### Step 3: Deploy

Just push your code to GitHub:

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

**That's it!** GitHub will automatically:
1. Create all Azure resources (first time only)
2. Build your application
3. Deploy to cloud
4. Give you the website URL

### Step 4: See Deployment Progress

- Go to your GitHub repository
- Click **Actions** tab
- Watch the deployment happen (takes 5-10 minutes)
- When done, you'll see a green checkmark ✓

### Step 5: Access Your Website

After deployment completes:
- Check GitHub Actions logs for your website URL
- It will look like: `https://carrental-frontend.azurewebsites.net`
- Open it and test your booking system!

## How GitOps Works

**GitOps** means: Git controls everything!

- Push to `main` branch → Deploys to production
- Push to `staging` branch → Deploys to test environment
- No manual work needed

**Rollback is easy:**
```bash
git revert <commit-id>
git push
```
Your previous version automatically deploys!

## Azure Resources Created

When you deploy, Azure creates these automatically:

| Resource | What It Does |
|----------|--------------|
| Resource Group | Holds everything together |
| Storage Account | Stores queues for messages |
| Cosmos DB | Database for bookings and payments |
| Function App | Runs your serverless functions |
| App Service (Frontend) | Hosts your website |
| App Service (Backend) | Runs your backend API |

**Cost:** With Azure free tier, this costs almost nothing to learn!

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript (simple and clean)
- **Backend:** Node.js with Express
- **Database:** Azure Cosmos DB (NoSQL)
- **Functions:** Azure Functions (serverless)
- **Queues:** Azure Storage Queues
- **Deployment:** GitHub Actions (automatic)
- **Containers:** Docker

## What You Will Learn

By building this project:
- ✅ How cloud applications work
- ✅ How to use Azure services
- ✅ How to deploy automatically (CI/CD)
- ✅ How to build microservices
- ✅ How serverless functions work
- ✅ How to use message queues
- ✅ How to work with NoSQL databases
- ✅ How GitOps makes deployment easy

Perfect for:
- DevOps beginners
- Cloud learning
- Job interviews
- Portfolio projects

## Troubleshooting

### "npm not found" error
- Install Node.js from nodejs.org

### "docker command not found"
- Install Docker from docker.com

### GitHub Actions fails
- Check your `AZURE_CREDENTIALS` secret is correct
- Make sure secret is valid JSON format
- Check Azure subscription is active

### Website not loading after deployment
- Wait 2-3 minutes after deployment
- Check GitHub Actions logs for errors
- Check Azure Portal for service status

## Next Steps

After you get this working:
1. Read [BLOG.md](BLOG.md) - my learning journey
2. Read [GITOPS.md](GITOPS.md) - detailed GitOps guide
3. Modify the code and experiment
4. Add new features
5. Deploy your changes

## Need Help?

- Check [BLOG.md](BLOG.md) for detailed explanations
- Check [GITOPS.md](GITOPS.md) for deployment help
- Review GitHub Actions logs
- Check Azure Portal for errors

## License

Free to use for learning and portfolio projects.

---

**Made for learning DevOps and Azure cloud development.** 

If this helped you, give it a ⭐ on GitHub!

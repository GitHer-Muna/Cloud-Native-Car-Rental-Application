# Building Cloud-Native Car Rental System on Azure

## My Journey into Cloud Computing

When I started learning DevOps and cloud technologies, I was confused. There were so many services, tools, and concepts. How do you connect everything? Where do you even start? I decided to build something real - something that would help me understand how cloud applications actually work.

This is the story of how I built a complete car rental application using Azure cloud services. If you are just starting your cloud journey like I was back in 2023, I hope my experience will help you.

## What Did I Want to Build?

I wanted to create a simple but realistic application. Something that:
- Accepts bookings from users through a website
- Processes those bookings in the background
- Saves everything to a database
- Sends confirmation emails to customers

Sounds simple, right? But I wanted to do it the "cloud way" - using modern architecture patterns that real companies use.

## Understanding the Big Picture

Before writing any code, I spent time understanding how cloud applications work. I learned about:

**Microservices**: Instead of one big application, break it into small services that do one thing well.

**Event-Driven Architecture**: Services talk to each other using messages, not direct calls. This makes everything flexible and scalable.

**Serverless Computing**: Write code that runs only when needed. You don't manage servers - the cloud does it for you.

These concepts seemed complicated at first. But when I started building, everything made sense.

## The Architecture I Chose

My application has several parts:

1. **Frontend**: A simple website where customers book cars
2. **BFF Service**: A backend service that receives booking requests
3. **RentProcess Function**: Processes the booking and saves it to the database
4. **PaymentProcess Function**: Handles payment and sends confirmation emails
5. **Storage Queues**: Carries messages between services
6. **Cosmos DB**: Stores all the data

Here's a visual diagram of how everything connects:

```
┌─────────────────┐
│   Customer      │
│   Browser       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   BFF Service   │
│   (HTML/CSS/JS) │     │   (Node.js)     │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  rent-queue     │
                        │ (Azure Storage) │
                        └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ RentProcess     │────▶│   payment-queue │────▶│ PaymentProcess  │
│ Function        │     │ (Azure Storage) │     │ Function        │
│ (Serverless)    │     └─────────────────┘     │ (Serverless)    │
└─────────┬───────┘                             └─────────┬───────┘
          │                                                │
          ▼                                                ▼
┌─────────────────┐                             ┌─────────────────┐
│   Cosmos DB     │                             │   Cosmos DB     │
│   Rentals       │                             │   Payments      │
│   Container     │                             │   Container     │
└─────────────────┘                             └─────────┬───────┘
                                                           │
                                                           ▼
                                                ┌─────────────────┐
                                                │   SendGrid      │
                                                │   (Email)       │
                                                └─────────────────┘
```

**Data Flow Explanation:**
When a customer books a car, the frontend sends the data to the BFF Service. The BFF Service puts this booking into a queue. The RentProcess Function picks up the message from the queue, saves the booking to the database, and puts a payment message into another queue. The PaymentProcess Function then processes the payment and sends a confirmation email.

Why so many steps? Because this is how you build systems that can grow. If thousands of people book cars at the same time, the queues will hold all the messages. The functions will process them one by one. Nothing breaks. Nothing gets lost.

## Starting with the Frontend

I started with the part I could see - the frontend. I used simple HTML, CSS, and JavaScript. No fancy frameworks. I wanted to focus on understanding the backend and cloud services.

The frontend has a form where customers enter their name, email, phone number, car type, pickup date, return date, and location. When they click "Book Now," JavaScript sends this data to the BFF Service.

## Building the BFF Service

BFF stands for "Backend for Frontend." This is a service that sits between your frontend and your backend systems. Why do we need it?

The BFF Service does several important things:
- It receives requests from the frontend
- It validates the data
- It puts messages into queues
- It handles errors gracefully

I built this using Node.js and Express because they are simple and popular. The code is straightforward. When a booking request comes in, the service creates a unique booking ID, adds a timestamp, and sends the message to a queue.

One thing I learned: always handle errors. What if the queue is not available? What if the data is wrong? The BFF Service checks everything and gives clear error messages.

## Working with Azure Storage Queues

Queues were new to me. I had heard about them, but never used them. A queue is like a line at a coffee shop. Messages wait in line. Functions pick them up one by one and process them.

Azure Storage Queues are simple and cheap. Perfect for learning. I created two queues:
- `rent-queue`: For booking messages
- `payment-queue`: For payment messages

The BFF Service puts messages into `rent-queue`. The RentProcess Function reads from `rent-queue` and puts messages into `payment-queue`. The PaymentProcess Function reads from `payment-queue`.

This design is powerful. If a function fails, the message stays in the queue. Azure will try again. This is called "at-least-once delivery." This means that every message will be processed at least once, but sometimes a message might be processed more than once if there's a failure during processing. Your messages are safe and won't be lost.

## Creating Azure Functions

Azure Functions are amazing for beginners. You write a small piece of code, and Azure runs it when needed. You don't worry about servers, scaling, or infrastructure.

I created two functions:

### RentProcess Function

This function triggers when a message appears in `rent-queue`. It:
1. Reads the booking data from the message
2. Saves the booking to Cosmos DB
3. Puts a payment message into `payment-queue`

The code is simple. Azure Functions use triggers and bindings. A trigger is what starts the function - in this case, a new message in the queue. Bindings are pre-configured connections to other Azure services like queues, databases, or storage. Instead of writing code to connect to these services, you declare the bindings in a `function.json` file, and Azure handles the connection details for you.

### PaymentProcess Function

This function triggers when a message appears in `payment-queue`. It:
1. Reads the payment data
2. Processes the payment (in a real app, this would call a payment gateway)
3. Saves the payment record to Cosmos DB
4. Sends a confirmation email

For emails, I learned about SendGrid. It is a service that sends emails from your application. You get an API key, and you can send emails with a few lines of code.

## Storing Data in Cosmos DB

Cosmos DB is Azure's NoSQL database. Unlike traditional relational databases that use tables with fixed columns and rows, NoSQL databases like Cosmos DB store data as flexible JSON documents. This means each record can have different fields and structures, making it easier to evolve your data model as your application grows.

Why did I choose Cosmos DB? Because it is:
- Fast: Data is available globally with low latency
- Flexible: You can store any JSON structure
- Scalable: It grows with your application

I created a database called `RentACarDB` with two containers:
- `Rentals`: Stores booking records
- `Payments`: Stores payment records

Each document has an `id` field. This is the partition key. Cosmos DB uses partition keys to distribute data across multiple servers for better performance and scalability. A good partition key ensures that related data is stored together and queries run efficiently. I used `id` because each booking is unique and queries are typically done by booking ID.

Learning to work with Cosmos DB was easier than I thought. The JavaScript SDK is simple. You create a client, get a reference to your container, and call `items.create()` to save a document.

## Running Everything Locally

Before deploying to Azure, I wanted to test everything on my laptop. This is where I learned about local development tools.

For Azure Functions, I used the **Azure Functions Core Tools**. You can run functions on your local machine just like they run in Azure. For Storage Queues, I used **Azurite** - a local emulator for Azure Storage.

I also used Docker Compose to run everything together:
- Frontend in a container
- BFF Service in a container  
- Azurite for local storage

With one command (`docker-compose up`), everything started. I could test the entire flow on my laptop. This saved me time and money.

## Deploying to Azure

When everything worked locally, I was ready for the cloud. This was the exciting part!

### Deploying with GitOps

I decided to use **GitOps** from the beginning. GitOps means your Git repository controls everything - infrastructure and applications. I set up a GitHub Actions pipeline that automates the entire process. Every time I push code to the main branch, the pipeline:

1. **Creates Azure resources** (resource group, storage, Cosmos DB, etc.) if they don't exist
2. **Runs tests** for all services automatically
3. **Builds Docker images** and pushes them to Azure Container Registry
4. **Deploys Azure Functions** using the Functions Core Tools
5. **Deploys App Services** with the containerized applications
6. **Runs health checks** to verify everything is working

With GitOps, I just push my code to GitHub and everything deploys automatically. No manual steps. No clicking in the Azure Portal. Just `git push` and the cloud updates itself.

## Testing in the Cloud

After deployment, I opened my frontend URL. I filled out a booking form and clicked "Book Now." 

Then I checked:
- **Azure App Service Logs**: To see if the containers were starting properly
- **Storage Queues**: To see messages flowing through the queues
- **Cosmos DB**: To see data being saved in the database

Building this project taught me so much:

### 1. Cloud Architecture is About Design

The code is important, but the design matters more. How do services communicate? What happens if something fails? How does the system scale? These questions shape your architecture.

### 2. Asynchronous Processing is Powerful

Queues make your application resilient. If one part is slow, it doesn't block everything. Messages wait in the queue. Functions process them when ready.

### 3. Serverless is Great for Learning

Azure Functions let me focus on code, not infrastructure. I didn't worry about servers, operating systems, or scaling. I just wrote functions and deployed them.

### 4. Testing Locally Saves Money

Cloud services cost money. By testing locally with emulators and Docker, I could develop and test without spending much. Only when everything worked did I deploy to Azure.

### 5. Monitoring is Essential

Azure App Service logs and deployment logs showed me what was happening in my application. I could see container startup, deployment status, and basic error information. The health checks I implemented provided automated monitoring to ensure services were running. Without proper logging and monitoring, deployment issues would have been much harder to debug.

### 6. GitOps Makes Deployment Simple

I used GitOps from the start - my Git repository is the single source of truth. GitHub Actions automates everything. With one push, my code goes from my laptop to production in the cloud. This ensures quality and speed. No manual deployments, no forgotten steps, no clicking around in the Azure Portal.

## Challenges I Faced

The journey was not all smooth. I faced problems:

### Connection Strings are Confusing

Azure services use connection strings to authenticate. I had to get the storage connection string, Cosmos DB connection string, and configure them in multiple places. I learned to use environment variables and keep secrets safe.

### Function Triggers Took Time to Understand

At first, I didn't understand how queue triggers work. Why does the function need a storage account? How does it know when a message arrives? Reading the documentation and experimenting helped me understand.

### CORS Issues with the Frontend

When my frontend tried to call the BFF Service, I got CORS errors. CORS stands for Cross-Origin Resource Sharing. It's a security feature in web browsers that prevents websites from making requests to different domains than the one they were loaded from. This is important for security, but it can be problematic during development when your frontend and backend are on different ports or domains. I had to configure CORS in my BFF Service to explicitly allow requests from the frontend domain.

### Cosmos DB Partition Keys

Choosing the right partition key is important for performance. Partition keys determine how data is distributed across Cosmos DB's physical partitions. A poor choice can lead to "hot partitions" where one partition gets all the traffic, causing performance issues. I initially used a random field, which distributed data evenly but made queries inefficient. Later, I learned to use `id` as the partition key because each booking is unique and most queries are done by booking ID.

## The Complete Flow

Let me walk you through the complete flow one more time:

1. **Customer visits the website** → Opens the frontend (Azure App Service)
2. **Customer fills the booking form** → Enters name, email, car type, dates, location
3. **Customer clicks "Book Now"** → Frontend sends POST request to BFF Service
4. **BFF Service receives the request** → Validates data, creates booking ID
5. **BFF Service puts message in rent-queue** → Booking message waits in the queue
6. **RentProcess Function triggers** → Picks up message from rent-queue
7. **RentProcess Function saves to Cosmos DB** → Booking record stored in Rentals container
8. **RentProcess Function puts message in payment-queue** → Payment message waits in the queue
9. **PaymentProcess Function triggers** → Picks up message from payment-queue
10. **PaymentProcess Function processes payment** → Simulates payment processing
11. **PaymentProcess Function saves to Cosmos DB** → Payment record stored in Payments container
12. **PaymentProcess Function sends email** → Confirmation email sent via SendGrid
13. **Customer receives confirmation email** → Booking complete!

Every step is asynchronous. Every step is logged. Every step can be monitored.

## How You Can Build This Too

If you want to build this project, here is my advice:

### Start Simple

Don't try to build everything at once. Start with the frontend. Then add the BFF Service. Then add one function. Test each part before moving to the next.

### Use Local Tools

Install Docker, Azure Functions Core Tools, and Azurite. Test everything on your laptop first. This will save you time and help you learn faster.

### Set Up GitOps Early

Don't deploy manually. Set up GitHub Actions from the beginning. It might seem complicated at first, but it will save you so much time. One push to Git and everything deploys automatically.

### Read the Documentation

Azure documentation is excellent. Whenever I was stuck, I searched the docs. They have tutorials, code samples, and best practices.

### Make Mistakes

I made many mistakes. I deployed broken code. I misconfigured services. I forgot to set environment variables. Each mistake taught me something. Don't be afraid to break things.

## What's Next?

This project is complete, but there are many ways to improve it:

- **Add authentication**: Use Azure AD to let users log in
- **Implement real payments**: Integrate with Stripe or PayPal
- **Add an admin dashboard**: Let admins manage cars and view bookings
- **Improve error handling**: Add retry logic and dead-letter queues
- **Add tests**: Write unit tests and integration tests
- **Scale it**: Test how the system handles thousands of concurrent users

## My Final Thoughts

Building this cloud-native car rental application was one of the best learning experiences I have had. I went from confusion to confidence. I understood concepts that seemed impossible before.

If you are starting your DevOps or cloud journey, I encourage you to build something like this. It doesn't have to be a car rental system. It can be anything:
- A todo app
- A blog platform
- An e-commerce store
- A booking system

The important thing is to **build something real**. Use cloud services. Deploy to the cloud. Monitor your application. Learn by doing.

Cloud computing is the future. Serverless architectures, microservices, event-driven systems - these are not just buzzwords. They are real patterns that real companies use to build scalable applications.

You don't need years of experience to start. You just need curiosity and willingness to learn. Start small. Build something. Make mistakes. Learn from them. Keep going.

## Resources and Links

**Project Source Code**: [GitHub Repository - Cloud-Native Car Rental Application](https://github.com/yourusername/cloud-native-car-rental)

**Technologies Used**:
- Azure Functions
- Azure Cosmos DB
- Azure Storage Queues
- Azure App Service
- Azure Container Registry
- Node.js and Express
- Docker and Docker Compose
- GitHub Actions (CI/CD)

**Helpful Resources**:
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure Storage Queues Documentation](https://docs.microsoft.com/azure/storage/queues/)
- [Docker Documentation](https://docs.docker.com/)

## Connect With Me

I am still learning every day. If you build this project or have questions, I would love to hear from you. Connect with me on LinkedIn and let's learn together!

Building in the cloud with GitOps is exciting. The possibilities are endless. I hope my story inspires you to start building your own cloud applications.

Remember: **The best way to learn is by building real projects!**

Happy coding, and welcome to the cloud! ☁️

---
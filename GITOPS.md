# GitOps Guide - Simple Deployment

## What is GitOps?

**GitOps** means: Your Git repository controls your cloud deployment.

Think of it like this:
- You push code to Git
- GitHub automatically deploys it to Azure
- No manual work needed

## How It Works

```
You push code → GitHub Actions runs → Azure gets updated
```

That's it! Super simple.

## Why GitOps is Good

### Before GitOps:
1. Write code
2. Login to Azure Portal
3. Create resources manually
4. Upload code manually
5. Hope nothing breaks
6. Repeat for every change

**Problems:**
- Easy to make mistakes
- Takes a lot of time
- Hard to undo changes
- No record of what changed

### After GitOps:
1. Write code
2. Push to GitHub
3. Done!

**Benefits:**
- No mistakes
- Very fast
- Easy to undo (just revert Git commit)
- Git history shows all changes

## How to Use GitOps in This Project

### First Time Setup

1. **Add Azure secret to GitHub:**

Get your Azure subscription ID:
```bash
az login
az account show --query id -o tsv
```

Create service principal:
```bash
az ad sp create-for-rbac --name "carrental-deploy" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID
```

Copy the output (looks like JSON with clientId, clientSecret, etc.)

Add to GitHub:
- Go to: Your repo → Settings → Secrets → Actions
- Click "New repository secret"
- Name: `AZURE_CREDENTIALS`
- Value: Paste the JSON
- Click "Add secret"

2. **That's it!** Setup done.

### Daily Use

**Deploy to Production:**
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

Done! Your code automatically deploys to Azure.

**Deploy to Test Environment:**
```bash
git checkout -b staging
git push origin staging
```

This creates a separate test environment.

## Understanding Branches

| Branch | Environment | When to Use |
|--------|-------------|-------------|
| `main` | Production | For live customers |
| `staging` | Testing | For testing before going live |

**Example workflow:**
1. Test on `staging` first
2. If it works, merge to `main`
3. Production updates automatically

## What Happens When You Push?

When you push code to GitHub:

**Step 1:** GitHub Actions starts (takes 1 minute)

**Step 2:** Checks your code (runs tests)

**Step 3:** Creates Azure resources if needed:
- Resource Group
- Storage Account
- Cosmos DB
- Function Apps
- Web Apps

**Step 4:** Deploys your code

**Step 5:** Checks if everything works

**Step 6:** Done! Your website is live.

Total time: 5-10 minutes

## Checking Deployment Status

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. See your deployment running

Green checkmark ✓ = Success!
Red X = Something failed (check logs)

## Rolling Back (Undoing Changes)

If something breaks:

```bash
# See recent commits
git log --oneline

# Undo the last commit
git revert HEAD

# Push to deploy old version
git push origin main
```

Your previous working version deploys automatically!

## Cost Management

**Good news:** With Azure free tier, this costs almost nothing!

Resources that use free tier:
- Azure Functions (1 million free executions/month)
- Cosmos DB (1000 RU/s free)
- App Services (free tier available)
- Storage (first 5GB free)

**Tip:** Set up cost alerts in Azure Portal to monitor spending.

## Troubleshooting

### GitHub Actions fails with "Invalid credentials"
- Check your `AZURE_CREDENTIALS` secret
- Make sure it's valid JSON
- Make sure the service principal has contributor role

### Deployment succeeds but website doesn't work
- Wait 2-3 minutes for services to start
- Check GitHub Actions logs for the website URL
- Check Azure Portal for errors

### Resources not created
- Check if your Azure subscription is active
- Check if you have permissions
- Check GitHub Actions logs for specific errors

## Common GitOps Commands

**Check deployment status:**
```bash
# See recent deployments
git log --oneline

# See what branch you're on
git branch
```

**Switch environments:**
```bash
# Switch to production
git checkout main

# Switch to staging
git checkout staging
```

**View deployment history:**
- Go to GitHub → Actions tab
- See all your deployments

## Best Practices

### 1. Always Test on Staging First
```bash
# Test your changes
git checkout staging
git push origin staging
# Wait for deployment
# Test the website
# If good, then deploy to production
git checkout main
git merge staging
git push origin main
```

### 2. Write Clear Commit Messages
```bash
# Good
git commit -m "Fix booking form validation"

# Bad
git commit -m "fix"
```

### 3. Deploy Small Changes
Don't change everything at once. Make small changes and deploy often.

### 4. Monitor Your Deployments
Always check GitHub Actions to make sure deployment succeeded.

## Understanding the Pipeline

The `.github/workflows/ci-cd.yml` file controls everything.

It does:
1. **Detects environment** - Checks which branch you pushed
2. **Runs tests** - Makes sure code works
3. **Creates infrastructure** - Sets up Azure resources
4. **Deploys code** - Uploads your application
5. **Verifies** - Checks everything is working

You don't need to change this file. It works automatically.

## GitOps vs Traditional Deployment

### Traditional Way:
- Manual steps every time
- Easy to forget steps
- No record of changes
- Hard to undo
- Slow

### GitOps Way:
- Automatic
- Never forget steps
- Git shows all changes
- Easy to undo
- Fast

## Resources

**Learn more:**
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure CLI Documentation](https://docs.microsoft.com/cli/azure/)
- [GitOps Principles](https://www.gitops.tech/)

## Summary

GitOps makes deployment simple:
1. Push code to Git
2. Everything deploys automatically
3. That's it!

No manual work. No mistakes. Just push and relax.

---

**Remember:** Git is your deployment tool. Push code = deployed application!

If you have questions, check the GitHub Actions logs or Azure Portal for details.

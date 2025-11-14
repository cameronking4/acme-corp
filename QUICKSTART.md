# Quick Start Guide - Azure Deployment

Get your ACME Corp application deployed to Azure in minutes!

## 🚀 Quick Deploy (5 minutes)

### Step 1: Prerequisites

✅ Azure account with active subscription  
✅ Azure CLI installed ([Download](https://docs.microsoft.com/cli/azure/install-azure-cli))  
✅ GitHub OAuth App created  
✅ Repository cloned locally  

### Step 2: Login to Azure

```bash
az login
```

### Step 3: Run Deployment Script

```bash
cd infrastructure/azure
./deploy.sh
```

The script will:
- Create resource group (if needed)
- Prompt for required configuration
- Deploy ARM template
- Build your application
- Deploy to Azure

### Step 4: Update GitHub OAuth

Update your GitHub OAuth App callback URL to:
```
https://your-webapp-name.azurewebsites.net/api/auth/callback/github
```

### Step 5: Visit Your App

Open your browser to:
```
https://your-webapp-name.azurewebsites.net
```

✅ **Done!** Your app is now running on Azure!

---

## 🔄 Automated CI/CD Setup (10 minutes)

For automated deployments on every push to main:

### Step 1: Create Service Principal

```bash
# Login to Azure
az login

# Create resource group
az group create --name acme-corp-rg --location eastus

# Create service principal
az ad sp create-for-rbac \
  --name "acme-corp-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/acme-corp-rg \
  --sdk-auth
```

**Save the JSON output!** You'll need it in the next step.

### Step 2: Configure GitHub Secrets

Go to your repository: **Settings > Secrets and variables > Actions**

Add these 8 secrets:

| Secret | How to Get |
|--------|-----------|
| `AZURE_CREDENTIALS` | JSON from Step 1 |
| `AZURE_SUBSCRIPTION_ID` | Run: `az account show --query id -o tsv` |
| `AZURE_RESOURCE_GROUP` | `acme-corp-rg` |
| `AZURE_WEBAPP_NAME` | Choose unique name (e.g., `acme-corp-prod-123`) |
| `NEXTAUTH_URL` | `https://your-webapp-name.azurewebsites.net` |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `GITHUB_ID` | From GitHub OAuth App |
| `GITHUB_SECRET` | From GitHub OAuth App |

💡 **Tip:** See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for detailed instructions.

### Step 3: Push to Main

```bash
git push origin main
```

Watch the deployment in **Actions** tab!

### Step 4: Verify

✅ Check GitHub Actions - workflow should be green  
✅ Visit your app URL  
✅ Test sign-in with GitHub  

---

## 📊 What Gets Deployed

Your Azure deployment includes:

| Resource | Description | Cost |
|----------|-------------|------|
| **App Service Plan** | Linux, Node.js 20 | ~$13/month (B1) |
| **App Service** | Your web app | Included in plan |
| **Application Insights** | Monitoring & analytics | ~$2.88/GB ingested |

💰 **Estimated cost:** ~$15-20/month for production workload

---

## 🎯 Common Tasks

### View Logs

```bash
az webapp log tail --name your-webapp-name --resource-group acme-corp-rg
```

### Update Environment Variable

```bash
az webapp config appsettings set \
  --name your-webapp-name \
  --resource-group acme-corp-rg \
  --settings NEXTAUTH_URL=https://new-url.azurewebsites.net
```

### Restart App

```bash
az webapp restart --name your-webapp-name --resource-group acme-corp-rg
```

### Scale Up (Change SKU)

```bash
az appservice plan update \
  --name your-app-plan \
  --resource-group acme-corp-rg \
  --sku S1
```

### Scale Out (Add Instances)

```bash
az appservice plan update \
  --name your-app-plan \
  --resource-group acme-corp-rg \
  --number-of-workers 3
```

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** `npm run build` fails during deployment

**Solution:**
1. Check Node.js version matches (20.x)
2. Test build locally: `npm install && npm run build`
3. Check Application logs for errors

### Can't Sign In

**Problem:** GitHub OAuth fails

**Solution:**
1. Verify GitHub OAuth callback URL matches your Azure URL
2. Check `NEXTAUTH_URL` environment variable is correct
3. Verify `GITHUB_ID` and `GITHUB_SECRET` are set

### App Not Starting

**Problem:** App Service shows "Application Error"

**Solution:**
1. Check logs: `az webapp log tail --name {name} --resource-group {rg}`
2. Verify all environment variables are set
3. SSH into container: `az webapp ssh --name {name} --resource-group {rg}`

### Deployment Fails

**Problem:** ARM template deployment fails

**Solution:**
1. Validate template: `cd infrastructure/azure && ./validate.sh`
2. Check resource group exists
3. Verify service principal has correct permissions

---

## 📚 More Information

- **Full Deployment Guide:** [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
- **Secrets Setup:** [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)
- **IAC Documentation:** [infrastructure/azure/README.md](./infrastructure/azure/README.md)

---

## 🆘 Get Help

**Issue with Azure?** Check [Azure App Service docs](https://docs.microsoft.com/azure/app-service/)  
**Issue with deployment?** Open an issue in this repository  
**Issue with costs?** Review [Azure pricing calculator](https://azure.microsoft.com/pricing/calculator/)

---

## 🎉 Next Steps

Once deployed, consider:

- [ ] Set up staging environment
- [ ] Configure custom domain
- [ ] Enable SSL certificate
- [ ] Set up Azure Front Door for CDN
- [ ] Configure autoscaling rules
- [ ] Set up alerts in Application Insights
- [ ] Implement Azure Key Vault for secrets
- [ ] Configure backup and disaster recovery

---

**Happy Deploying! 🚀**

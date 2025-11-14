# Azure Deployment Guide

This guide will walk you through deploying the ACME Corp Next.js application to Azure using Infrastructure as Code (ARM templates) and CI/CD (GitHub Actions).

## Prerequisites

- An Azure account with an active subscription
- Azure CLI installed locally (for manual deployment)
- GitHub repository with the application code
- GitHub OAuth App credentials

## Architecture

The deployment creates the following Azure resources:

1. **App Service Plan** - Linux-based hosting plan for the web app
2. **App Service (Web App)** - Hosts the Next.js application
3. **Application Insights** - Monitoring and analytics for the application

## Deployment Options

### Option 1: Automated CI/CD with GitHub Actions (Recommended)

This option automatically deploys your application whenever you push to the main branch.

#### Step 1: Create Azure Service Principal

Run these commands in Azure CLI to create a service principal for GitHub Actions:

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# Create a resource group
az group create --name acme-corp-rg --location eastus

# Create service principal and get credentials
az ad sp create-for-rbac \
  --name "acme-corp-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/acme-corp-rg \
  --sdk-auth
```

The last command will output JSON credentials. Save this output - you'll need it in the next step.

#### Step 2: Configure GitHub Secrets

Go to your GitHub repository settings and add the following secrets (Settings > Secrets and variables > Actions > New repository secret):

1. **AZURE_CREDENTIALS** - Paste the entire JSON output from the service principal creation
2. **AZURE_SUBSCRIPTION_ID** - Your Azure subscription ID
3. **AZURE_RESOURCE_GROUP** - `acme-corp-rg` (or your chosen name)
4. **AZURE_WEBAPP_NAME** - Choose a globally unique name (e.g., `acme-corp-webapp-prod`)
5. **NEXTAUTH_URL** - Your app URL (e.g., `https://acme-corp-webapp-prod.azurewebsites.net`)
6. **NEXTAUTH_SECRET** - Generate with: `openssl rand -base64 32`
7. **GITHUB_ID** - Your GitHub OAuth App Client ID
8. **GITHUB_SECRET** - Your GitHub OAuth App Client Secret

#### Step 3: Update GitHub OAuth App

Update your GitHub OAuth App callback URL to:
```
https://{your-webapp-name}.azurewebsites.net/api/auth/callback/github
```

#### Step 4: Deploy

Push to the main branch or manually trigger the workflow:

```bash
git push origin main
```

Or trigger manually from GitHub Actions tab > "Deploy to Azure" > "Run workflow"

The workflow will:
1. Build the Next.js application
2. Deploy the ARM template to create/update Azure resources
3. Deploy the application to Azure App Service

#### Step 5: Verify Deployment

Once the workflow completes, visit your application at:
```
https://{your-webapp-name}.azurewebsites.net
```

### Option 2: Manual Deployment with Azure CLI

If you prefer to deploy manually:

#### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name acme-corp-rg --location eastus

# Deploy ARM template
az deployment group create \
  --resource-group acme-corp-rg \
  --template-file infrastructure/azure/azuredeploy.json \
  --parameters \
    webAppName=acme-corp-webapp-prod \
    nextAuthUrl=https://acme-corp-webapp-prod.azurewebsites.net \
    nextAuthSecret=your-secret-here \
    githubId=your-github-client-id \
    githubSecret=your-github-client-secret
```

#### Step 2: Build Application

```bash
npm install
npm run build
```

#### Step 3: Deploy to App Service

```bash
# Create a zip package
zip -r app.zip . -x "*.git*" "node_modules/*" ".next/cache/*"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group acme-corp-rg \
  --name acme-corp-webapp-prod \
  --src app.zip
```

## Configuration

### ARM Template Parameters

The ARM template (`infrastructure/azure/azuredeploy.json`) accepts the following parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `webAppName` | Name of the web app (must be globally unique) | Auto-generated |
| `location` | Azure region for resources | Resource group location |
| `sku` | App Service Plan SKU (F1, B1, B2, B3, S1, S2, S3, P1V2, P2V2, P3V2) | B1 |
| `linuxFxVersion` | Node.js runtime version | NODE\|20-lts |
| `nextAuthUrl` | NextAuth URL configuration | - |
| `nextAuthSecret` | NextAuth secret key | - |
| `githubId` | GitHub OAuth Client ID | - |
| `githubSecret` | GitHub OAuth Client Secret | - |

### Environment Variables

The application requires these environment variables:

- **NEXTAUTH_URL** - The base URL of your application
- **NEXTAUTH_SECRET** - Secret key for signing tokens
- **GITHUB_ID** - GitHub OAuth App Client ID
- **GITHUB_SECRET** - GitHub OAuth App Client Secret

These are automatically configured by the ARM template during deployment.

## Monitoring

Application Insights is automatically configured for your app. Access it via:

1. Azure Portal > Your Resource Group > Application Insights
2. View metrics, logs, and performance data
3. Set up alerts for critical issues

## Scaling

To scale your application:

### Vertical Scaling (Change SKU)

Update the `sku` parameter in your deployment:

```bash
az deployment group create \
  --resource-group acme-corp-rg \
  --template-file infrastructure/azure/azuredeploy.json \
  --parameters sku=S1
```

### Horizontal Scaling (Add Instances)

```bash
az appservice plan update \
  --name acme-corp-webapp-prod-plan \
  --resource-group acme-corp-rg \
  --number-of-workers 3
```

Or enable autoscaling:

```bash
az monitor autoscale create \
  --resource-group acme-corp-rg \
  --resource acme-corp-webapp-prod-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-plan \
  --min-count 1 \
  --max-count 5 \
  --count 1
```

## Custom Domain

To add a custom domain:

1. Add CNAME record: `www.yourdomain.com` → `acme-corp-webapp-prod.azurewebsites.net`
2. Configure in Azure:

```bash
az webapp config hostname add \
  --webapp-name acme-corp-webapp-prod \
  --resource-group acme-corp-rg \
  --hostname www.yourdomain.com
```

3. Add SSL certificate (App Service Managed Certificate is free):

```bash
az webapp config ssl create \
  --resource-group acme-corp-rg \
  --name acme-corp-webapp-prod \
  --hostname www.yourdomain.com
```

4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Troubleshooting

### Check Application Logs

```bash
az webapp log tail \
  --name acme-corp-webapp-prod \
  --resource-group acme-corp-rg
```

### SSH into the Container

```bash
az webapp ssh \
  --name acme-corp-webapp-prod \
  --resource-group acme-corp-rg
```

### Common Issues

1. **Build fails**: Check Node.js version matches (`NODE|20-lts`)
2. **Authentication fails**: Verify GitHub OAuth callback URL
3. **App doesn't start**: Check environment variables in Azure Portal

### View Deployment History

```bash
az deployment group list \
  --resource-group acme-corp-rg \
  --output table
```

## Cost Optimization

- **Free tier (F1)**: Good for development, but has limitations (no always-on, limited compute)
- **Basic (B1)**: Recommended for production, includes SSL and always-on
- **Standard (S1+)**: For high-traffic applications, includes autoscaling
- **Premium (P1V2+)**: For enterprise applications with high performance requirements

Monitor costs in Azure Portal > Cost Management

## Clean Up Resources

To delete all resources:

```bash
az group delete --name acme-corp-rg --yes --no-wait
```

## Support

For issues with:
- Azure deployment: Check [Azure App Service docs](https://docs.microsoft.com/azure/app-service/)
- ARM templates: Check [ARM template reference](https://docs.microsoft.com/azure/templates/)
- Next.js on Azure: Check [Next.js deployment docs](https://nextjs.org/docs/deployment)

## Security Best Practices

1. **Use Azure Key Vault** for storing secrets (future enhancement)
2. **Enable managed identity** for accessing Azure resources
3. **Configure network security groups** to restrict access
4. **Enable Azure DDoS Protection** for production workloads
5. **Regular security updates** - keep dependencies updated
6. **Use Azure Security Center** recommendations

## Next Steps

- Set up staging and production environments
- Configure Azure DevOps Pipelines as alternative to GitHub Actions
- Implement Azure Key Vault for secrets management
- Set up Azure Front Door for CDN and WAF
- Configure backup and disaster recovery

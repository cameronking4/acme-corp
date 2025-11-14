# Azure Deployment Guide

This directory contains Infrastructure as Code (IaC) templates and CI/CD configuration for deploying the ACME Corp Next.js application to Azure.

## Contents

- `azuredeploy.json` - ARM template for Azure resources
- `azuredeploy.parameters.json` - Parameters file for ARM template
- `azure-deploy.yml` - GitHub Actions workflow for CI/CD

## Azure Resources

The ARM template creates the following resources:

1. **App Service Plan** (Linux)
   - Configurable SKU (default: B1 Basic tier)
   - Reserved for Linux containers

2. **App Service** (Web App)
   - Node.js 18 LTS runtime
   - HTTPS only
   - Configured for Next.js deployment
   - Environment variables for NextAuth and GitHub OAuth

3. **Application Insights** (Optional)
   - Application monitoring and analytics
   - Can be disabled via parameters

## Prerequisites

Before deploying, you need:

1. **Azure Account**
   - Active Azure subscription
   - Contributor access to a resource group

2. **GitHub OAuth App**
   - Create at [GitHub Developer Settings](https://github.com/settings/developers)
   - Set callback URL to: `https://your-app-name.azurewebsites.net/api/auth/callback/github`

3. **Azure CLI** (for manual deployment)
   - Install from [Azure CLI docs](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

## Deployment Options

### Option 1: Manual Deployment via Azure CLI

#### Step 1: Create Resource Group

```bash
az group create --name acme-corp-rg --location eastus
```

#### Step 2: Deploy ARM Template

```bash
az deployment group create \
  --resource-group acme-corp-rg \
  --template-file azuredeploy.json \
  --parameters \
    webAppName=acme-corp-app-unique \
    nextAuthUrl=https://acme-corp-app-unique.azurewebsites.net \
    nextAuthSecret=YOUR_NEXTAUTH_SECRET \
    githubId=YOUR_GITHUB_CLIENT_ID \
    githubSecret=YOUR_GITHUB_CLIENT_SECRET \
    sku=B1 \
    nodeVersion=18-lts \
    enableApplicationInsights=true
```

#### Step 3: Deploy Application Code

```bash
# Build the application
npm install
npm run build

# Create a zip file
zip -r app.zip . -x "*.git*" "node_modules/*" ".next/cache/*"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group acme-corp-rg \
  --name acme-corp-app-unique \
  --src app.zip
```

### Option 2: Automated Deployment via GitHub Actions

#### Step 1: Set up Azure Service Principal

Create a service principal for GitHub Actions:

```bash
az ad sp create-for-rbac \
  --name "github-actions-acme-corp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/acme-corp-rg \
  --sdk-auth
```

Copy the JSON output - you'll need it for GitHub secrets.

#### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AZURE_CREDENTIALS` | JSON output from service principal creation | `{"clientId": "...", ...}` |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_RESOURCE_GROUP` | Name of your Azure resource group | `acme-corp-rg` |
| `AZURE_WEBAPP_NAME` | Name of your Azure Web App | `acme-corp-app-unique` |
| `NEXTAUTH_URL` | Your production app URL | `https://acme-corp-app-unique.azurewebsites.net` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (generate with `openssl rand -base64 32`) | Your generated secret |
| `GITHUB_ID` | GitHub OAuth App Client ID | Your GitHub client ID |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | Your GitHub client secret |

#### Step 3: Move Workflow File

Move the workflow file to the correct location:

```bash
mv infrastructure/azure-deploy.yml .github/workflows/azure-deploy.yml
```

**Note**: Due to GitHub App permissions, Claude Code cannot directly modify files in `.github/workflows/`. You'll need to manually move the file or create it directly in the workflows directory.

#### Step 4: Commit and Push

```bash
git add .
git commit -m "Add Azure deployment infrastructure"
git push origin main
```

The workflow will automatically trigger on push to `main` branch.

## Environment Variables

The application requires these environment variables (configured in ARM template):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth token signing | Yes |
| `GITHUB_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | Yes |

## ARM Template Parameters

You can customize the deployment by modifying these parameters:

| Parameter | Description | Default | Allowed Values |
|-----------|-------------|---------|----------------|
| `webAppName` | Name of the web app (must be globally unique) | `acme-corp-{uniqueString}` | Any valid app name |
| `location` | Azure region for resources | Resource group location | Any Azure region |
| `sku` | App Service Plan pricing tier | `B1` | `F1`, `B1`, `B2`, `B3`, `S1`, `S2`, `S3`, `P1v2`, `P2v2`, `P3v2` |
| `nodeVersion` | Node.js runtime version | `18-lts` | `18-lts`, `20-lts` |
| `enableApplicationInsights` | Enable monitoring | `true` | `true`, `false` |

### SKU Recommendations

- **F1 (Free)**: Good for testing, limited compute and no always-on
- **B1 (Basic)**: Recommended for production, includes always-on
- **S1+ (Standard)**: For high-traffic production apps with scaling needs
- **P1v2+ (Premium)**: For enterprise production workloads

## Monitoring and Troubleshooting

### View Application Logs

```bash
az webapp log tail \
  --resource-group acme-corp-rg \
  --name acme-corp-app-unique
```

### Application Insights

If enabled, view metrics and logs in Azure Portal:
1. Navigate to your App Service
2. Click on "Application Insights" in the left menu
3. View Live Metrics, Failures, Performance, etc.

### Common Issues

#### Issue: "npm start" fails
**Solution**: Ensure `package.json` has the correct start script:
```json
{
  "scripts": {
    "start": "next start"
  }
}
```

#### Issue: Environment variables not set
**Solution**: Verify environment variables in Azure Portal:
1. Go to App Service > Configuration
2. Check Application settings
3. Restart the app after changes

#### Issue: Build fails during deployment
**Solution**: Check that `next.config.ts` has proper output configuration:
```typescript
export default {
  output: 'standalone', // Optional: for optimized deployment
}
```

## Costs

Estimated monthly costs (US East region):

- **F1 (Free Tier)**: $0/month (limited features)
- **B1 (Basic)**: ~$13/month
- **S1 (Standard)**: ~$70/month
- **Application Insights**: Free tier available, then pay-as-you-go

See [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/) for detailed estimates.

## Scaling

### Manual Scaling

```bash
# Scale up (change tier)
az appservice plan update \
  --resource-group acme-corp-rg \
  --name acme-corp-app-unique-plan \
  --sku S1

# Scale out (add instances)
az appservice plan update \
  --resource-group acme-corp-rg \
  --name acme-corp-app-unique-plan \
  --number-of-workers 2
```

### Auto-scaling

Auto-scaling is available in Standard tier and above. Configure in Azure Portal:
1. Go to App Service Plan
2. Click "Scale out (App Service plan)"
3. Enable auto-scaling rules

## Cleanup

To delete all Azure resources:

```bash
az group delete --name acme-corp-rg --yes --no-wait
```

## Security Best Practices

1. **Use Key Vault**: For production, store secrets in Azure Key Vault
2. **Enable Managed Identity**: Use managed identity for Azure service authentication
3. **HTTPS Only**: Already configured in the ARM template
4. **IP Restrictions**: Configure in App Service settings if needed
5. **Rotate Secrets**: Regularly rotate OAuth secrets and NEXTAUTH_SECRET

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Deploy Next.js to Azure](https://nextjs.org/docs/deployment#azure)
- [ARM Template Reference](https://docs.microsoft.com/en-us/azure/templates/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)

## Support

For issues with:
- **Azure deployment**: Check Azure Portal logs and Application Insights
- **Application code**: See main README.md
- **GitHub Actions**: Check workflow run logs in GitHub Actions tab

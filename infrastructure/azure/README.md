# Infrastructure as Code - Azure Deployment

This directory contains the Infrastructure as Code (IAC) files for deploying the ACME Corp application to Azure.

## Contents

- **azuredeploy.json** - ARM template defining Azure resources
- **azuredeploy.parameters.json** - Parameters file for the ARM template (example)

## Resources Created

The ARM template creates the following Azure resources:

1. **App Service Plan** (`Microsoft.Web/serverfarms`)
   - Linux-based hosting plan
   - Configurable SKU (F1 to P3V2)
   - Reserved for Linux containers

2. **App Service** (`Microsoft.Web/sites`)
   - Web application hosting
   - Node.js 20 LTS runtime
   - HTTPS only
   - Automatic deployment configuration
   - Environment variables for NextAuth and GitHub OAuth

3. **Application Insights** (`Microsoft.Insights/components`)
   - Application monitoring and analytics
   - Performance tracking
   - Error logging and diagnostics

## Template Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `webAppName` | string | Name of the web app (globally unique) | Auto-generated with uniqueString |
| `location` | string | Azure region for resources | Resource group location |
| `sku` | string | App Service Plan pricing tier | B1 |
| `linuxFxVersion` | string | Node.js runtime version | NODE\|20-lts |
| `nextAuthUrl` | string | NextAuth URL configuration | Required |
| `nextAuthSecret` | securestring | NextAuth secret key | Required |
| `githubId` | string | GitHub OAuth Client ID | Required |
| `githubSecret` | securestring | GitHub OAuth Client Secret | Required |

## Deployment Methods

### Using Azure CLI

```bash
# Create resource group
az group create --name acme-corp-rg --location eastus

# Deploy template
az deployment group create \
  --resource-group acme-corp-rg \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json
```

### Using GitHub Actions

The template is automatically deployed via the `.github/workflows/azure-deploy.yml` workflow when you push to the main branch.

### Using Azure Portal

1. Go to Azure Portal
2. Click "Create a resource" > "Template deployment (deploy using custom templates)"
3. Click "Build your own template in the editor"
4. Copy and paste the contents of `azuredeploy.json`
5. Click "Save"
6. Fill in the parameters
7. Click "Review + create" then "Create"

## Configuration

### Updating Parameters

1. For production use, create a parameters file with your values:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "webAppName": {
      "value": "your-unique-app-name"
    },
    "sku": {
      "value": "B1"
    },
    "nextAuthUrl": {
      "value": "https://your-unique-app-name.azurewebsites.net"
    },
    "nextAuthSecret": {
      "value": "your-secret-key"
    },
    "githubId": {
      "value": "your-github-client-id"
    },
    "githubSecret": {
      "value": "your-github-client-secret"
    }
  }
}
```

2. **Never commit sensitive values to version control!** Use:
   - Azure Key Vault references
   - GitHub Secrets (for CI/CD)
   - Azure DevOps variables
   - Environment-specific parameter files (gitignored)

### Environment Variables

The template automatically configures these environment variables in App Service:

- `NEXTAUTH_URL` - Base URL for NextAuth
- `NEXTAUTH_SECRET` - Secret key for token signing
- `GITHUB_ID` - GitHub OAuth Client ID
- `GITHUB_SECRET` - GitHub OAuth Client Secret
- `APPINSIGHTS_INSTRUMENTATIONKEY` - Application Insights key
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Application Insights connection
- `ApplicationInsightsAgent_EXTENSION_VERSION` - Application Insights agent version
- `SCM_DO_BUILD_DURING_DEPLOYMENT` - Enable build during deployment
- `WEBSITE_NODE_DEFAULT_VERSION` - Node.js version

## Outputs

After deployment, the template provides these outputs:

- `webAppUrl` - The HTTPS URL of your deployed application
- `webAppName` - The name of the web app resource
- `appInsightsInstrumentationKey` - Application Insights instrumentation key

## Validation

Validate the template before deployment:

```bash
az deployment group validate \
  --resource-group acme-corp-rg \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json
```

## What-If Analysis

Preview changes before deployment:

```bash
az deployment group what-if \
  --resource-group acme-corp-rg \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json
```

## Updating Resources

To update existing resources, simply redeploy the template with modified parameters:

```bash
az deployment group create \
  --resource-group acme-corp-rg \
  --template-file azuredeploy.json \
  --parameters sku=S1
```

ARM templates are idempotent - they only make necessary changes.

## Best Practices

1. **Use separate parameter files for different environments**
   - `azuredeploy.parameters.dev.json`
   - `azuredeploy.parameters.staging.json`
   - `azuredeploy.parameters.prod.json`

2. **Never hardcode secrets** - Use:
   - Azure Key Vault
   - GitHub Secrets
   - Parameter files (gitignored)

3. **Enable resource locks for production**
   ```bash
   az lock create --name DoNotDelete \
     --resource-group acme-corp-rg \
     --lock-type CanNotDelete
   ```

4. **Tag your resources**
   ```json
   "tags": {
     "Environment": "Production",
     "Project": "ACME-Corp",
     "CostCenter": "IT"
   }
   ```

5. **Use managed identities** instead of connection strings where possible

## Troubleshooting

### Template Validation Errors

```bash
# Get detailed error information
az deployment group list \
  --resource-group acme-corp-rg \
  --query "[?properties.provisioningState=='Failed']"
```

### View Deployment Operations

```bash
az deployment operation group list \
  --resource-group acme-corp-rg \
  --name {deployment-name}
```

### Common Issues

1. **Name already exists**: Web app names must be globally unique
2. **Quota exceeded**: Check your subscription limits
3. **Invalid parameters**: Validate parameter types and allowed values

## Monitoring

After deployment, monitor your resources:

```bash
# View App Service logs
az webapp log tail \
  --name {your-webapp-name} \
  --resource-group acme-corp-rg

# View Application Insights data
az monitor app-insights component show \
  --app {your-app-insights-name} \
  --resource-group acme-corp-rg
```

## Clean Up

To delete all resources:

```bash
az group delete --name acme-corp-rg --yes --no-wait
```

## Additional Resources

- [ARM Template Reference](https://docs.microsoft.com/azure/templates/)
- [App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)

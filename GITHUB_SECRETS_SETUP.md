# GitHub Secrets Setup Guide

To enable automated Azure deployment via GitHub Actions, you need to configure the following secrets in your GitHub repository.

## Required GitHub Secrets

Navigate to: **Settings > Secrets and variables > Actions > New repository secret**

### 1. AZURE_CREDENTIALS

Service principal credentials for GitHub Actions to authenticate with Azure.

**How to get this:**

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your-Subscription-Name"

# Create service principal (replace {subscription-id} with your actual ID)
az ad sp create-for-rbac \
  --name "acme-corp-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/acme-corp-rg \
  --sdk-auth
```

Copy the entire JSON output and paste it as the secret value.

### 2. AZURE_SUBSCRIPTION_ID

Your Azure subscription ID.

**How to get this:**

```bash
az account show --query id --output tsv
```

Or find it in the Azure Portal under "Subscriptions".

### 3. AZURE_RESOURCE_GROUP

The name of your Azure Resource Group.

**Example value:** `acme-corp-rg`

**How to create:**

```bash
az group create --name acme-corp-rg --location eastus
```

### 4. AZURE_WEBAPP_NAME

The name of your Azure Web App (must be globally unique).

**Example value:** `acme-corp-webapp-prod`

**Note:** This will be your app's URL: `https://acme-corp-webapp-prod.azurewebsites.net`

### 5. NEXTAUTH_URL

The full URL of your deployed application.

**Example value:** `https://acme-corp-webapp-prod.azurewebsites.net`

**Important:** This must match your `AZURE_WEBAPP_NAME`:
- If `AZURE_WEBAPP_NAME` = `acme-corp-webapp-prod`
- Then `NEXTAUTH_URL` = `https://acme-corp-webapp-prod.azurewebsites.net`

### 6. NEXTAUTH_SECRET

A random secret key for NextAuth.js to sign tokens.

**How to generate:**

```bash
openssl rand -base64 32
```

Copy the output and paste it as the secret value.

### 7. GITHUB_ID

Your GitHub OAuth App Client ID.

**How to get this:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps"
3. Select your app or create a new one
4. Copy the "Client ID"

**When creating a new OAuth App, use:**
- Homepage URL: `https://your-webapp-name.azurewebsites.net`
- Callback URL: `https://your-webapp-name.azurewebsites.net/api/auth/callback/github`

### 8. GITHUB_SECRET

Your GitHub OAuth App Client Secret.

**How to get this:**

1. In your GitHub OAuth App settings
2. Click "Generate a new client secret"
3. Copy the secret immediately (you won't be able to see it again)
4. Paste it as the secret value

## Secrets Summary Table

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AZURE_CREDENTIALS` | Service principal JSON | `{"clientId": "...", ...}` |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | `12345678-1234-1234-1234-123456789abc` |
| `AZURE_RESOURCE_GROUP` | Resource group name | `acme-corp-rg` |
| `AZURE_WEBAPP_NAME` | Web app name (globally unique) | `acme-corp-webapp-prod` |
| `NEXTAUTH_URL` | Full app URL | `https://acme-corp-webapp-prod.azurewebsites.net` |
| `NEXTAUTH_SECRET` | Random secret key | `abc123def456...` |
| `GITHUB_ID` | GitHub OAuth Client ID | `Iv1.abc123def456` |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | `abc123def456...` |

## Verification Checklist

Before triggering the deployment, verify:

- [ ] All 8 secrets are configured in GitHub
- [ ] Azure Resource Group exists (`az group show --name acme-corp-rg`)
- [ ] Service principal has Contributor role on the resource group
- [ ] `AZURE_WEBAPP_NAME` is globally unique
- [ ] `NEXTAUTH_URL` matches the webapp URL
- [ ] GitHub OAuth App callback URL is updated to Azure URL
- [ ] `NEXTAUTH_SECRET` is a secure random string (at least 32 characters)

## Testing the Setup

1. Commit and push your changes to the main branch
2. Go to GitHub Actions tab in your repository
3. Watch the "Deploy to Azure" workflow run
4. If it fails, check the logs for specific errors
5. Verify secrets are correctly configured (common issues: trailing spaces, wrong format)

## Troubleshooting

### Service Principal Authentication Failed

- Verify `AZURE_CREDENTIALS` is valid JSON
- Check the service principal hasn't expired
- Ensure it has the correct permissions on the resource group

### Resource Group Not Found

- Verify `AZURE_RESOURCE_GROUP` name is correct
- Ensure the resource group exists in your subscription
- Check the resource group is in the same subscription as your service principal

### Web App Name Already Taken

- Change `AZURE_WEBAPP_NAME` to a unique value
- Try adding your organization name or random string
- Update `NEXTAUTH_URL` to match the new name

### Deployment Succeeds But App Doesn't Work

- Verify all environment variables are set correctly
- Check GitHub OAuth callback URL matches your Azure URL
- Look at Azure App Service logs: `az webapp log tail --name {webapp-name} --resource-group {rg-name}`

## Security Best Practices

1. **Never commit secrets to version control**
2. **Rotate secrets regularly** (especially `NEXTAUTH_SECRET`)
3. **Use separate environments** (dev, staging, prod) with different secrets
4. **Limit service principal permissions** to only what's needed
5. **Enable branch protection** to prevent unauthorized deployments
6. **Use Azure Key Vault** for production secrets (advanced)

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Service Principal Documentation](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli)
- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

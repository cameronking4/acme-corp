#!/bin/bash
# Azure Deployment Script
# This script deploys the ACME Corp application to Azure using ARM template

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 ACME Corp - Azure Deployment Script"
echo "========================================"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure${NC}"
    echo "Please run: az login"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is installed and authenticated${NC}"
echo ""

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-acme-corp-rg}"
LOCATION="${AZURE_LOCATION:-eastus}"
WEBAPP_NAME="${AZURE_WEBAPP_NAME:-acme-corp-webapp}"
TEMPLATE_FILE="infrastructure/azure/azuredeploy.json"

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Web App Name: $WEBAPP_NAME"
echo ""

# Check if resource group exists
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Resource group does not exist. Creating...${NC}"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
    echo -e "${GREEN}✅ Resource group created${NC}"
else
    echo -e "${GREEN}✅ Resource group exists${NC}"
fi

echo ""

# Prompt for required parameters
echo "Please provide the following configuration values:"
echo ""

read -p "NextAuth URL (e.g., https://$WEBAPP_NAME.azurewebsites.net): " NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
    NEXTAUTH_URL="https://$WEBAPP_NAME.azurewebsites.net"
fi

read -sp "NextAuth Secret (generate with: openssl rand -base64 32): " NEXTAUTH_SECRET
echo ""
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ NEXTAUTH_SECRET is required${NC}"
    exit 1
fi

read -p "GitHub OAuth Client ID: " GITHUB_ID
if [ -z "$GITHUB_ID" ]; then
    echo -e "${RED}❌ GITHUB_ID is required${NC}"
    exit 1
fi

read -sp "GitHub OAuth Client Secret: " GITHUB_SECRET
echo ""
if [ -z "$GITHUB_SECRET" ]; then
    echo -e "${RED}❌ GITHUB_SECRET is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Deploying ARM template...${NC}"

# Deploy ARM template
az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE_FILE" \
    --parameters \
        webAppName="$WEBAPP_NAME" \
        nextAuthUrl="$NEXTAUTH_URL" \
        nextAuthSecret="$NEXTAUTH_SECRET" \
        githubId="$GITHUB_ID" \
        githubSecret="$GITHUB_SECRET"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ARM template deployed successfully!${NC}"
else
    echo -e "${RED}❌ ARM template deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🏗️  Building application...${NC}"

# Build the application
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📤 Deploying application to Azure...${NC}"

# Deploy to Azure Web App
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEBAPP_NAME" \
    --src <(git archive --format=zip HEAD)

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "🌐 Your application is available at:"
    echo "   $NEXTAUTH_URL"
    echo ""
    echo "📊 Monitor your application:"
    echo "   Azure Portal: https://portal.azure.com"
    echo "   Resource Group: $RESOURCE_GROUP"
    echo ""
    echo "📝 Don't forget to:"
    echo "   1. Update your GitHub OAuth App callback URL to: $NEXTAUTH_URL/api/auth/callback/github"
    echo "   2. Check Application Insights for monitoring"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

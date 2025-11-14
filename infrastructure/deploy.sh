#!/bin/bash

# ACME Corp Azure Deployment Script
# This script automates the deployment of the application to Azure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

print_info "Azure CLI is installed"

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

print_info "Logged in to Azure"

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-acme-corp-rg}"
LOCATION="${AZURE_LOCATION:-eastus}"
WEBAPP_NAME="${AZURE_WEBAPP_NAME:-acme-corp-app-$(date +%s)}"

# Prompt for required parameters
echo ""
print_info "=== Azure Deployment Configuration ==="
echo ""

read -p "Resource Group Name [$RESOURCE_GROUP]: " input
RESOURCE_GROUP="${input:-$RESOURCE_GROUP}"

read -p "Location [$LOCATION]: " input
LOCATION="${input:-$LOCATION}"

read -p "Web App Name [$WEBAPP_NAME]: " input
WEBAPP_NAME="${input:-$WEBAPP_NAME}"

read -p "App Service Plan SKU [B1]: " input
SKU="${input:-B1}"

# Check for required secrets
echo ""
print_info "=== Environment Variables Check ==="
echo ""

if [ -z "$NEXTAUTH_SECRET" ]; then
    print_warning "NEXTAUTH_SECRET not set. Generating one..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi

if [ -z "$GITHUB_ID" ]; then
    read -p "GitHub OAuth Client ID: " GITHUB_ID
fi

if [ -z "$GITHUB_SECRET" ]; then
    read -sp "GitHub OAuth Client Secret: " GITHUB_SECRET
    echo ""
fi

NEXTAUTH_URL="https://${WEBAPP_NAME}.azurewebsites.net"

# Confirm deployment
echo ""
print_info "=== Deployment Summary ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Web App Name: $WEBAPP_NAME"
echo "App URL: $NEXTAUTH_URL"
echo "SKU: $SKU"
echo ""

read -p "Proceed with deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    print_info "Deployment cancelled"
    exit 0
fi

# Create resource group
echo ""
print_info "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Deploy ARM template
echo ""
print_info "Deploying ARM template..."
az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$SCRIPT_DIR/azuredeploy.json" \
    --parameters \
        webAppName="$WEBAPP_NAME" \
        nextAuthUrl="$NEXTAUTH_URL" \
        nextAuthSecret="$NEXTAUTH_SECRET" \
        githubId="$GITHUB_ID" \
        githubSecret="$GITHUB_SECRET" \
        sku="$SKU" \
        nodeVersion="18-lts" \
        enableApplicationInsights=true

# Build the application
echo ""
print_info "Building application..."
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

print_info "Building Next.js application..."
npm run build

# Create deployment package
echo ""
print_info "Creating deployment package..."
TEMP_DIR=$(mktemp -d)
DEPLOY_ZIP="$TEMP_DIR/deploy.zip"

# Copy necessary files
cp -r .next "$TEMP_DIR/"
cp -r public "$TEMP_DIR/" 2>/dev/null || true
cp package*.json "$TEMP_DIR/"
cp next.config.* "$TEMP_DIR/" 2>/dev/null || true

# Create zip
cd "$TEMP_DIR"
zip -r "$DEPLOY_ZIP" . > /dev/null

# Deploy to Azure
echo ""
print_info "Deploying application to Azure..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEBAPP_NAME" \
    --src "$DEPLOY_ZIP"

# Restart the app
print_info "Restarting application..."
az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEBAPP_NAME"

# Cleanup
rm -rf "$TEMP_DIR"

# Print success message
echo ""
print_info "=== Deployment Complete ==="
echo ""
print_info "Your application is deployed at: $NEXTAUTH_URL"
echo ""
print_warning "Important Next Steps:"
echo "1. Update your GitHub OAuth App callback URL to: ${NEXTAUTH_URL}/api/auth/callback/github"
echo "2. Visit your app at: $NEXTAUTH_URL"
echo "3. Monitor logs with: az webapp log tail --resource-group $RESOURCE_GROUP --name $WEBAPP_NAME"
echo ""

# Save configuration
CONFIG_FILE="$SCRIPT_DIR/.deployment-config"
cat > "$CONFIG_FILE" << EOF
RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
WEBAPP_NAME=$WEBAPP_NAME
NEXTAUTH_URL=$NEXTAUTH_URL
EOF

print_info "Deployment configuration saved to: $CONFIG_FILE"

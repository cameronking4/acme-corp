#!/bin/bash
# ARM Template Validation Script
# This script validates the Azure ARM template before deployment

set -e

echo "🔍 Validating Azure ARM Template..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it from:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

# Variables
TEMPLATE_FILE="infrastructure/azure/azuredeploy.json"
PARAMETERS_FILE="infrastructure/azure/azuredeploy.parameters.json"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-acme-corp-rg}"

echo "✅ Azure CLI is installed and authenticated"

# Validate template syntax
echo "📝 Validating ARM template syntax..."
if ! az deployment group validate \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE_FILE" \
    --parameters "$PARAMETERS_FILE" \
    --no-prompt 2>&1; then
    echo "❌ ARM template validation failed"
    exit 1
fi

echo "✅ ARM template is valid"

# Show what-if analysis
echo "🔮 Running what-if analysis..."
az deployment group what-if \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE_FILE" \
    --parameters "$PARAMETERS_FILE" \
    --no-prompt

echo ""
echo "✅ Validation complete!"
echo ""
echo "To deploy, run:"
echo "  az deployment group create \\"
echo "    --resource-group $RESOURCE_GROUP \\"
echo "    --template-file $TEMPLATE_FILE \\"
echo "    --parameters @$PARAMETERS_FILE"

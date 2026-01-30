# Dronacharya Beta Deployment Guide

This guide covers deploying Dronacharya to Azure App Service with PostgreSQL.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────┐  │
│  │  Test   │───▶│  Build  │───▶│  Deploy to Azure    │  │
│  └─────────┘    └─────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Azure                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Azure App Service (Linux B2)               │   │
│  │        dronacharya-beta-app.azurewebsites.net    │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│                           ▼                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │     PostgreSQL Flexible Server (B_Standard_B1ms)  │   │
│  │     dronacharya-beta-postgres                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Azure CLI installed and configured
- Terraform installed (v1.0+)
- GitHub repository access with admin permissions
- Domain access for dronacharya.ai (for production)

## Setup Steps

### 1. Create Terraform State Storage

```bash
# Login to Azure
az login

# Create resource group for Terraform state
az group create --name dronacharya-tfstate --location eastus

# Create storage account (name must be globally unique)
az storage account create \
  --name dronacharyatfstate \
  --resource-group dronacharya-tfstate \
  --sku Standard_LRS \
  --encryption-services blob

# Create container for state file
az storage container create \
  --name tfstate \
  --account-name dronacharyatfstate
```

### 2. Generate Azure Credentials for GitHub Actions

```bash
# Create service principal with contributor role
az ad sp create-for-rbac \
  --name "dronacharya-github-actions" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# Copy the JSON output - this goes in GitHub Secrets as AZURE_CREDENTIALS
```

### 3. Configure GitHub Secrets

Navigate to: `Repository > Settings > Secrets and variables > Actions`

Add these secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | JSON output from service principal creation |
| `NEXT_PUBLIC_APP_URL` | `https://dronacharya-beta-app.azurewebsites.net` |

### 4. Configure Terraform Variables

Create a `terraform.tfvars` file (never commit this):

```hcl
postgres_admin_password = "your-secure-password-here"
anthropic_api_key       = "sk-ant-..."
openai_api_key          = "sk-..."
nextauth_secret         = "your-nextauth-secret"
```

Or use environment variables:

```bash
export TF_VAR_postgres_admin_password="your-secure-password"
export TF_VAR_anthropic_api_key="sk-ant-..."
export TF_VAR_openai_api_key="sk-..."
export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"
```

### 5. Deploy Infrastructure with Terraform

```bash
cd terraform/azure

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply

# Note the outputs
terraform output
```

### 6. Run Database Migrations

```bash
# Set DATABASE_URL from Terraform output
export DATABASE_URL="postgresql://dronacharyaadmin:<password>@dronacharya-beta-postgres.postgres.database.azure.com:5432/dronacharya?sslmode=require"

# Run migrations
pnpm db:push

# Seed initial content
pnpm db:seed
```

### 7. Trigger Deployment

Push to the `dronacharya-beta-launch` branch to trigger the GitHub Actions workflow:

```bash
git push origin dronacharya-beta-launch
```

## Environment Variables Reference

### App Service Configuration

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (set by Terraform) |
| `NEXTAUTH_URL` | Full URL of the app |
| `NEXTAUTH_SECRET` | Random secret for NextAuth sessions |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | Public-facing URL |

## Monitoring

### View Logs

```bash
# Stream live logs
az webapp log tail \
  --name dronacharya-beta-app \
  --resource-group dronacharya-beta-rg

# Download log files
az webapp log download \
  --name dronacharya-beta-app \
  --resource-group dronacharya-beta-rg \
  --log-file logs.zip
```

### Check App Status

```bash
# View deployment status
az webapp show \
  --name dronacharya-beta-app \
  --resource-group dronacharya-beta-rg \
  --query state

# View configuration
az webapp config show \
  --name dronacharya-beta-app \
  --resource-group dronacharya-beta-rg
```

## Troubleshooting

### Common Issues

**1. Build Fails - Memory Issues**

App Service B2 tier provides 3.5GB RAM. If builds fail:
- Consider using build artifacts from GitHub Actions
- Or upgrade to P1v2 tier

**2. Database Connection Fails**

```bash
# Verify firewall allows Azure services
az postgres flexible-server firewall-rule list \
  --resource-group dronacharya-beta-rg \
  --name dronacharya-beta-postgres

# Test connection
psql "host=dronacharya-beta-postgres.postgres.database.azure.com \
      dbname=dronacharya \
      user=dronacharyaadmin \
      sslmode=require"
```

**3. Deployment Timeout**

- Check GitHub Actions logs
- Verify Azure credentials are valid
- Check App Service deployment center logs

### Useful Commands

```bash
# Restart the app
az webapp restart \
  --name dronacharya-beta-app \
  --resource-group dronacharya-beta-rg

# Scale up/down
az appservice plan update \
  --name dronacharya-beta-plan \
  --resource-group dronacharya-beta-rg \
  --sku P1v2  # or B1, B2, etc.

# View metrics
az monitor metrics list \
  --resource dronacharya-beta-app \
  --resource-group dronacharya-beta-rg \
  --resource-type Microsoft.Web/sites \
  --metric "CpuPercentage"
```

## Cost Estimate (Beta)

| Resource | SKU | Est. Monthly Cost |
|----------|-----|-------------------|
| App Service | B2 | ~$55 |
| PostgreSQL | B_Standard_B1ms | ~$25 |
| Storage (Terraform State) | Standard LRS | ~$1 |
| **Total** | | **~$81/month** |

## Security Checklist

- [ ] All secrets stored in GitHub Secrets or Azure Key Vault
- [ ] PostgreSQL firewall restricts access to Azure services only
- [ ] HTTPS enforced on App Service
- [ ] NextAuth secret is randomly generated (32+ chars)
- [ ] API keys are not logged or exposed

## Next Steps

1. Configure custom domain (dronacharya.ai)
2. Set up SSL certificate (Let's Encrypt via Azure)
3. Configure Application Insights for monitoring
4. Set up alerts for errors and performance
5. Implement backup strategy for PostgreSQL

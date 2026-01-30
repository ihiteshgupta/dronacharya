# Dronacharya Azure Infrastructure
# Beta deployment using Azure App Service + PostgreSQL

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "dronacharya-tfstate"
    storage_account_name = "dronacharyatfstate"
    container_name       = "tfstate"
    key                  = "beta.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "location" {
  default = "East US"
}

variable "environment" {
  default = "beta"
}

variable "postgres_admin_password" {
  sensitive = true
}

variable "anthropic_api_key" {
  sensitive = true
}

variable "openai_api_key" {
  sensitive = true
}

variable "nextauth_secret" {
  sensitive = true
}

locals {
  prefix = "dronacharya-${var.environment}"
  tags = {
    Project     = "Dronacharya"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${local.prefix}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B2" # Basic tier for beta

  tags = local.tags
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = "${local.prefix}-app"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION = "~20"
    NEXT_PUBLIC_APP_URL          = "https://${local.prefix}-app.azurewebsites.net"
    DATABASE_URL                 = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
    ANTHROPIC_API_KEY            = var.anthropic_api_key
    OPENAI_API_KEY               = var.openai_api_key
    NEXTAUTH_URL                 = "https://${local.prefix}-app.azurewebsites.net"
    NEXTAUTH_SECRET              = var.nextauth_secret
  }

  tags = local.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.prefix}-postgres"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "dronacharyaadmin"
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb = 32768  # 32 GB
  sku_name   = "B_Standard_B1ms"  # Burstable tier for beta

  tags = local.tags
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "dronacharya"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Outputs
output "app_url" {
  value = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "postgres_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "resource_group" {
  value = azurerm_resource_group.main.name
}

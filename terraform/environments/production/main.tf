terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "learnflow-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "learnflow-terraform-locks"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "production"
      Project     = "learnflow"
      ManagedBy   = "terraform"
    }
  }
}

module "aws_infrastructure" {
  source = "../../modules/aws"

  environment  = "production"
  region       = var.region
  cluster_name = "learnflow-production"

  # Production-grade configuration
  node_desired_size = 3
  node_min_size     = 3
  node_max_size     = 10
  node_instance_types = ["t3.large", "t3.xlarge"]

  # Database - Multi-AZ with larger instance
  db_instance_class = "db.r6g.large"
  db_instance_count = 2  # Multi-AZ

  # Redis - Clustered
  redis_node_type   = "cache.r6g.large"
  redis_num_nodes   = 2  # With automatic failover
}

# Outputs
output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.aws_infrastructure.eks_cluster_endpoint
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.aws_infrastructure.eks_cluster_name
}

output "rds_endpoint" {
  description = "RDS cluster endpoint"
  value       = module.aws_infrastructure.rds_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.aws_infrastructure.redis_endpoint
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.aws_infrastructure.vpc_id
}

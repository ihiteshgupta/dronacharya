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
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "learnflow-terraform-locks"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "staging"
      Project     = "learnflow"
      ManagedBy   = "terraform"
    }
  }
}

module "aws_infrastructure" {
  source = "../../modules/aws"

  environment  = "staging"
  region       = var.region
  cluster_name = "learnflow-staging"

  # Smaller staging configuration
  node_desired_size = 2
  node_min_size     = 1
  node_max_size     = 4
  node_instance_types = ["t3.medium"]

  # Database
  db_instance_class = "db.t3.medium"
  db_instance_count = 1

  # Redis
  redis_node_type   = "cache.t3.micro"
  redis_num_nodes   = 1
}

output "eks_cluster_endpoint" {
  value = module.aws_infrastructure.eks_cluster_endpoint
}

output "rds_endpoint" {
  value     = module.aws_infrastructure.rds_endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = module.aws_infrastructure.redis_endpoint
  sensitive = true
}

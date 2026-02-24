terraform{
required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }   
  }

  backend "s3"{
  }
}

provider "aws" {
  region = "${var.aws_region}"
}

data "aws_caller_identity" "current" {}

locals { //creats a local variable to store the account id
  account_id = data.aws_caller_identity.current.account_id
}
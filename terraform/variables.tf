variable "app_name" {
  type        = string
  description = "Application Name"
  default     = "vender-gateway"
}

variable "app_name_generic" {
  type        = string
  description = "Application Name"
  default     = "vender"
}

variable "sqs_name" {
  type        = string
  description = "Name of queue"
  default     = "Mqueue"
}

variable "websocket_table_name" {
  type        = string
  description = "Name of the web socket connection table in dynamo db"
  default     = "WebSocketConnections"
}

variable "sqs_queue_name" {
  type        = string
  description = "Queue name"
  default     = "Mqueue"
}

variable "aws_region" {
    type        = string
    description = "aws region"
    default     = "us-east-1"
}

variable "api_gateway_stage_name" {
    type        = string
    description = "dev stagename (could add more)"
    default     = "primary"
}

variable "dynamodb_vendor_table_name" {
  description = "Table name for dynamodb vendors"
  default = "Vendors"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

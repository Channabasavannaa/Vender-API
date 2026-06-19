resource "aws_api_gatewayv2_api" "websocket_gw" {
    name                       = "${var.app_name}-websocket-gw"
    protocol_type              = "WEBSOCKET"
    route_selection_expression = "$request.body.action"
}

resource "aws_api_gatewayv2_integration" "connect" {       
    api_id           = aws_api_gatewayv2_api.websocket_gw.id
    integration_type = "AWS_PROXY"
    integration_uri  = aws_lambda_function.connect.invoke_arn
    integration_method = "POST"
}

resource "aws_api_gatewayv2_integration" "disconnect" {       
    api_id           = aws_api_gatewayv2_api.websocket_gw.id
    integration_type = "AWS_PROXY"
    integration_uri  = aws_lambda_function.disconnect.invoke_arn
    integration_method = "POST"
}

resource "aws_api_gatewayv2_integration" "sendvendor" {      
    api_id           = aws_api_gatewayv2_api.websocket_gw.id
    integration_type = "AWS_PROXY"
    integration_uri  = aws_lambda_function.sendvendor.invoke_arn
    integration_method = "POST"
}


resource "aws_api_gatewayv2_route" "connect_route" {
    api_id    = aws_api_gatewayv2_api.websocket_gw.id
    route_key = "$connect"
    target    = "integrations/${aws_api_gatewayv2_integration.connect.id}"
}


resource "aws_api_gatewayv2_route" "disconnect_route" {
    api_id    = aws_api_gatewayv2_api.websocket_gw.id
    route_key = "$disconnect"
    target    = "integrations/${aws_api_gatewayv2_integration.disconnect.id}"
}


resource "aws_api_gatewayv2_route" "sendvendor_route" {
    api_id    = aws_api_gatewayv2_api.websocket_gw.id
    route_key = "sendvendor"
    target    = "integrations/${aws_api_gatewayv2_integration.sendvendor.id}"
}


resource "aws_api_gatewayv2_stage" "primary" {
    api_id = aws_api_gatewayv2_api.websocket_gw.id
    name   = var.api_gateway_stage_name
    auto_deploy = true
  
}

#HTTP API GATEWAY
resource "aws_api_gatewayv2_api" "http_gw" {
    name                       = "${var.app_name}-http-gw"
    protocol_type              = "HTTP"
    route_selection_expression = "$request.body.action"
    cors_config {
        allow_origins = ["*"]
        allow_methods   = ["GET", "POST", "PUT", "DELETE"]
        allow_headers   = ["Content-Type"]
    }
}

resource "aws_api_gatewayv2_integration" "getvenders" {        
    api_id           = aws_api_gatewayv2_api.http_gw.id
    integration_type = "AWS_PROXY"
    integration_uri  = aws_lambda_function.getvenders.invoke_arn
    integration_method = "POST"
}


resource "aws_api_gatewayv2_route" "getvenders_route" {
    api_id    = aws_api_gatewayv2_api.http_gw.id
    route_key = "GET /getvenders"
    target    = "integrations/${aws_api_gatewayv2_integration.getvenders.id}"
}

resource "aws_api_gatewayv2_stage" "http_primary" {
    api_id = aws_api_gatewayv2_api.http_gw.id
    name   = var.api_gateway_stage_name
    auto_deploy = true
  
}

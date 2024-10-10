#!/bin/bash

# API URL for creating notifications
API_URL="http://localhost:3000/notification/create"

# Function to generate a mock notification
generate_notification() {
  author="$1"
  target="sam"
  type="NEW"
  message="$2"

  # Send POST request to the backend
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{
          "author": "'"$author"'",
          "target": "'"$target"'",
          "type": "'"$type"'",
          "message": "'"$message"'"
        }'
}

# Generate some notifications targeting 'sam'
echo "Generating mock notifications targeting sam..."

generate_notification "alice" "LIKE"
generate_notification "bob" "VIEW"
generate_notification "charlie" "BLOCK"
generate_notification "diana" "MESSAGE: 'Hey Sam!'"
generate_notification "edward" "LIKE"
generate_notification "test" "BLOCK"

echo "Mock notifications sent!"
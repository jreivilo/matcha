# Base URL for the API
BASE_URL="http://localhost:3000/user/create-user"

# User 1: Bob
echo "Creating user Bob..."
response_bob=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "username": "bob",
    "password": "bob123",
    "first_name": "Bob",
    "last_name": "Builder"
  }')

echo "Response for Bob:"
echo "$response_bob"

# User 2: Patrick Star
echo "Creating user Patrick Star..."
response_patrick=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patrick@example.com",
    "username": "patrickstar",
    "password": "star12",
    "first_name": "Patrick",
    "last_name": "Star"
  }')

echo "Response for Patrick Star:"
echo "$response_patrick"

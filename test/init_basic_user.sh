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
    "last_name": "Builder",
	"picture_path": "bob_1.png"
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
    "last_name": "Star",
	"picture_path": "patrickstar_1.png"
  }')

echo "Response for Patrick Star:"
echo "$response_patrick"

# User 3: Jennifer Nguyen
echo "Creating user Jennifer Nguyen..."
response_jennifer=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jennifer@example.com",
    "username": "jennifernguyen",
    "password": "nguyen123",
    "first_name": "Jennifer",
    "last_name": "Nguyen"
  }')

echo "Response for Jennifer Nguyen:" 
echo "$response_jennifer"

# User 4: Roberto
echo "Creating user Roberto..."
response_roberto=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "roberto@example.com",
    "username": "roberto",
    "password": "roberto123",
    "first_name": "Roberto",
    "last_name": "Rossi"
  }')

echo "Response for Roberto:"
echo "$response_roberto"
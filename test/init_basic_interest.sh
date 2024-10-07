# Base URL for the profile API
PROFILE_URL="http://localhost:3000/user/profile"

# Fill profile for Bob
echo "Filling profile for Bob..."
response_bob_profile=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $PROFILE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "gender": "Male",
    "sexuality": "Straight",
    "biography": "I love building things and helping others.",
    "interests": "construction,tools,architecture",
    "coordinates": "40.712776,-74.005974"
  }')

echo "Response for Bob profile:"
echo "$response_bob_profile"

# Fill profile for Patrick Star
echo "Filling profile for Patrick Star..."
response_patrick_profile=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $PROFILE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patrickstar",
    "gender": "Male",
    "sexuality": "Straight",
    "biography": "Just a starfish living under a rock.",
    "interests": "jellyfishing,sleeping,eating",
    "coordinates": "31.968599,-99.901813"
  }')

echo "Response for Patrick Star profile:"
echo "$response_patrick_profile"

# Fill profile for Jennifer Nguyen
echo "Filling profile for Jennifer Nguyen..."
response_jennifer_profile=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $PROFILE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jennifernguyen",
    "gender": "Female",
    "sexuality": "Straight",
    "biography": "Passionate about technology and helping the community.",
    "interests": "coding,volunteering,cooking",
    "coordinates": "34.052235,-118.243683"
  }')

echo "Response for Jennifer Nguyen profile:"
echo "$response_jennifer_profile"

# Fill profile for Roberto
echo "Filling profile for Roberto..."
response_roberto_profile=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $PROFILE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "username": "roberto",
    "gender": "Male",
    "sexuality": "Straight",
    "biography": "An explorer at heart, always seeking new adventures.",
    "interests": "traveling,hiking,cooking",
    "coordinates": "41.902782,12.496366"
  }')

echo "Response for Roberto profile:"
echo "$response_roberto_profile"

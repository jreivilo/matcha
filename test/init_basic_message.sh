echo "Bob sends a message to Patrick..."
response_message_1=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST http://localhost:3000/chat/add \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "bob",
    "receiver": "patrickstar",
    "message": "Hello, Patrick! How are you?"
  }')

echo "Response for Bob's message:"
echo "$response_message_1"


echo "Patrick replies to Bob..."
response_message_2=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST http://localhost:3000/chat/add \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "patrickstar",
    "receiver": "bob",
    "message": "Hey Bob! Im good, thanks for asking."
  }')

echo "Response for Patrick's message:"
echo "$response_message_2"


echo "Bob sends another message to Patrick..."
response_message_3=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST http://localhost:3000/chat/add \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "bob",
    "receiver": "patrickstar",
    "message": "Great to hear! Want to meet up later?"
  }')

echo "Response for Bob's second message:"
echo "$response_message_3"



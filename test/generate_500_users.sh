#!/bin/bash

# Base URLs for the APIs
USER_CREATION_URL="http://localhost:3000/user/create-user"
PROFILE_URL="http://localhost:3000/user/profile"
LIKE_URL="http://localhost:3000/like/like"

# Arrays to generate variations
first_names=("John" "Jane" "Bob" "Alice" "Charlie" "Emily" "David" "Emma" "Chris" "Olivia" "Michael" "Sophia")
last_names=("Smith" "Johnson" "Williams" "Jones" "Brown" "Davis" "Miller" "Wilson" "Moore" "Taylor" "Anderson" "Thomas")
genders=("Male" "Female" "Non-Binary")
sexualities=("Straight" "Gay" "Bisexual" "Pansexual" "Asexual")
biographies=("I love building things and helping others." 
             "I enjoy traveling and exploring new places."
             "I'm passionate about technology and innovation."
             "Nature lover, hiker, and outdoor enthusiast."
             "Creative mind, always looking for inspiration."
             "Fitness junkie and healthy living advocate.")
interests=("construction,tools,architecture" 
           "travel,photography,culture"
           "technology,programming,AI"
           "nature,hiking,camping"
           "art,design,creativity"
           "fitness,health,wellness")
coordinates=("40.712776,-74.005974" 
             "34.052235,-118.243683" 
             "51.507351,-0.127758"
             "35.689487,139.691711"
             "48.856613,2.352222"
             "55.755825,37.617298")

# Array to store created usernames for likes generation
created_usernames=()

# Loop to create 500 users and fill their profiles
for i in $(seq 1 500)
do
  # Generate unique user details
  first_name=${first_names[$RANDOM % ${#first_names[@]}]}
  last_name=${last_names[$RANDOM % ${#last_names[@]}]}
  username="user_$i"
  email="user_$i@example.com"
  password="password_$i"

  echo "Creating user $username..."

  # API call to create the user
  response_create_user=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $USER_CREATION_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"username\": \"$username\",
      \"password\": \"$password\",
      \"first_name\": \"$first_name\",
      \"last_name\": \"$last_name\"
    }")
  
  echo "Response for $username (user creation):"
  echo "$response_create_user"

  # Add the created username to the array
  created_usernames+=("$username")

  # Generate random profile details for the user
  gender=${genders[$RANDOM % ${#genders[@]}]}
  sexuality=${sexualities[$RANDOM % ${#sexualities[@]}]}
  biography=${biographies[$RANDOM % ${#biographies[@]}]}
  interest=${interests[$RANDOM % ${#interests[@]}]}
  coordinate=${coordinates[$RANDOM % ${#coordinates[@]}]}

  echo "Filling profile for $username..."

  # API call to fill the user's profile
  response_profile=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $PROFILE_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$username\",
      \"gender\": \"$gender\",
      \"sexuality\": \"$sexuality\",
      \"biography\": \"$biography\",
      \"interests\": \"$interest\",
      \"coordinates\": \"$coordinate\"
    }")

  echo "Response for $username (profile creation):"
  echo "$response_profile"

done

# Generate random "likes" between users
num_likes=1000 # You can adjust this number as needed
echo "Generating $num_likes random likes between users..."

for j in $(seq 1 $num_likes)
do
  # Select two random users from the created users list
  liker=${created_usernames[$RANDOM % ${#created_usernames[@]}]}
  liked=${created_usernames[$RANDOM % ${#created_usernames[@]}]}

  # Ensure a user can't like themselves
  while [ "$liker" == "$liked" ]
  do
    liked=${created_usernames[$RANDOM % ${#created_usernames[@]}]}
  done

  echo "$liker likes $liked"

  # API call to like a user
  response_like=$(curl -s -w "\nHTTP STATUS: %{http_code}\n" -X POST $LIKE_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$liker\",
      \"liked_username\": \"$liked\"
    }")

  echo "Response for $liker liking $liked:"
  echo "$response_like"

done

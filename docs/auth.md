# Authentication, client sessions, and JWT
Wasn't exactly sure where to fit all those topics so it will be here

## Authentication
Email and password based

## Client sessions
JWT is created on the backend, contains username, and is checked for non-tampering and non-expiration on the backend.
With the whoami route it returns the username and id of the user, so we just send requests to that with the useAuthStatus hook to check if the user should still be logged in or not.
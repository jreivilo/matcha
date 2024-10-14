# How to set up a notification feed from scratch, with WebSockets and React

I actually had a hard time doing this, moreso than learning the basics of assembly for example, so I'm write a bit about what I learned and how I designed the thing.

## design
What was I trying to build? For this 42 project we had to set up a notification system, that informs users of events concerning them in less than 10 seconds. I didn't bother to check how long my backend would take to do that, so I decided to go for websockets to have guaranted below 10 seconds speed.
I also just wanted understand websockets better.

### what are websockets?
It's a protocol that upgrades from http(s) requests to opening a socket just like a server would, but where the client can be a browser and text is sent back and forth.
There's an upgrade request (can we switch to ws?), tcp handshake, neogotiation capabilities etc, but I didn't bother to read the rfc.
I got a bit confused about how to set it up on the frontend, there's a few things to keep in mind.
- you wanna open the socket once and share it to different components, I did it with a context provider (global variable that you can access from anywhere after exporting it)
    - That provider opens the socket, has a heartbeat function to check if connection is alive (reconnects otherwise), and handles closing the connection
- on the backend I set up a connection route that does the handling, with event listeners for connection, error, incoming messages and closing. The server only responds to PING messages with PONG
- useNotifications hook on the frontend, queries the backend for notification history and also inserts new notifications in the react-query server-state when they come in through the websocket
- While implementing the above I had so many bugs and troubles that I added up refactoring a great deal of the frontend logic
    - [ ] TODO, but probably more refactoring needed for now it's still kindof slop code
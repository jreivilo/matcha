# How to set up a notification feed from scratch, with WebSockets and React

This wasn't as easy as expected so I'll share my design in hopes of helping others figure it out, and hopefully getting some feedback on the whole setup for increased correctness, reliability and safety.

## Design

What are the specifics of the notification feed I needed? 
- Must inform students of events concerning them in less than 10 seconds
- Keep a notification history to show unread notifications if events happened while logged out
- Must be able to mark notifications as read
- clear/useable UX on the frontend

How does it work?
A mix of http requests and websocket connections, one per user.

There's two http requests, one to fetch a user's notification history, another to mark a set of notifications as read

And then there's a websocket setup that involves frontend and backend

## Websockets
### the tldr on what they are / how they work
It's a protocol that upgrades from http(s) requests to opening a socket just like a server would, but where the client can be a browser and text is sent back and forth.
There's an upgrade request (can we switch to ws?), tcp handshake, neogotiation capabilities etc, but I didn't bother to read the rfc so that's all I know.

### frontend
In the browser you don't need a library to handle them (except if you want heartbeats and automatic reconnection done for you, or more features idk), because there's a built-in websocket api (ex: `const mysocket = new WebSocket()` without imports).

#### WebSocketProvider
I used a context provider to share the socket with the rest of the app, connect/deal with heartbeats and reconnection, and close the connection when the user logs out. The context exports a useWebSocket hook that you can use to send messages to the server (such as .close() to close it).

When the component mounts notification history is fetched with react-query, and then if new notifications come through a websocket the frontend version of 'notifications' is updated and re-rendered immediately. 
react-query is my library of choice for server-state it works well and I understand it. 
Basically it keeps queries accessible in cache with query keys, you can do optimistic updates (and cancel those updates if queries fail), do query invalidation when things change, and more.

### backend
On the backend setting up a handler probably shouldn't be too hard but I used fastify's **websocket** plugin to go faster.

first of all the notification table in the db is the record of truth

Then we have a websocket route handling the connection, jwt verification, ping responses, and closing

And a notification transaction, which inserts the notification in the db, and sends a websocket notification if the client is connected

And standard http routes to add, mark notifications as read and fetch history
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const adminName = "Admin";
// Setting the static folder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome the current user who joins
    // use io.emit() to emit to everyone including the user
    socket.emit(
      "message",
      formatMessage(adminName, "Welcome to the Chat Room!")
    );

    // Broadcast to everyone except the user that they have connected
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(adminName, `${user.username} has joined the Chat Room`)
      );

    // Send users and the room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Catching the message on the server side
  // sending the username along with the message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // This will run when the client disconnects
  // Statement has to be in io.on('connection') to work
  socket.on("disconnect", () => {
    // Display to everyone
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(adminName, `${user.username} has left the chat`)
      );

      // Update the list of users
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const port = 3000 || process.env.PORT;
server.listen(port, () => console.log(`Listening on port ${port}`));

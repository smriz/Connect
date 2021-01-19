const express = require("express"),
  http = require("http"),
  bodyParser = require("body-parser"),
  hashMap = require("hashmap");
const morgon = require("morgan");
const cors = require("cors");

let app = express();
app.use(morgon("dev"));

const portN = process.env.PORT || 3000;

const port = app.set("port", portN);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let server = http.createServer(app);
let io = require("socket.io")(server);

const userApi = require("./routes/api/user");
const { User } = require("./schema/user");
const roomApi = require("./routes/api/room");
const messageApi = require("./routes/api/message");
const { authenticateUser } = require("./middleware/authenticateUser");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("public_key", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,public_key"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

  // if (req.method === "OPTIONS") {
  //   return res.status(200).json("hello");
  // }
  next();
});
app.use(cors());

app.post("/user/login", userApi.login);
app.post("/user/register", userApi.register);
app.get("/user/:username", userApi.findUserName);
app.put("/user/:username", userApi.user_update);
app.get("/user", userApi.users);
app.post("/room", roomApi.createRoom);
// app.post("/room", roomApi.createRoom);
app.post("/room2/:roomId", roomApi.room_update);
app.get("/room", roomApi.getRooms);
app.get("/room/:room", roomApi.getRoom);

let clients = new hashMap(); // for store online users

io.use(async (socket, next) => {
  try {
    console.log(socket.handshake.query.public_key + " djfhk");
    //check to see if there is such a user?
    let user = await User.findOne({
      public_key: socket.handshake.query.public_key,
    });
    socket.emit("Varutha", { hello: "world" });
    if (user) {
      // exist : store user to hashmap and next()
      clients.set(socket.id, user._id.toString());
      console.log(clients);
      await User.findByIdAndUpdate(user._id, { last_seen: 0 });
      return next();
    } else {
      //not exist: don't allow user
      socket.emit("err");
      console.log("err");
    }
  } catch (e) {
    console.log(e);
  }
});

io.on("connection", function (socket) {
  console.log("[socket] connected :" + socket.id);
  console.log("socket connected");
  socket.emit("Varutha", { hello: "world" });
  //event join room
  socket.on("join", async function (room) {
    console.log("socket connected join");

    //android device pass parameter "room id " to the event and join
    socket.join(room);
  });

  socket.on("message_detection", async function (data) {
    //detect the message and send it to user
    await messageApi.sendMessage(data, io, socket);

    //notify user that have new message
    await messageApi.notifyDataSetChanged(data.room, io, clients);
  });

  socket.on("disconnect", async function () {
    console.log("[socket] disconnected :" + socket.id);
    //in this event we get user from database and set last seen to now
    await User.findByIdAndUpdate(clients.get(socket.id), {
      last_seen: new Date().getTime(),
    });
    //search in hashmap and find the related socket and delete it
    await clients.delete(socket.id);
  });
});

server.listen(app.get("port"), function () {
  console.log("[server] server listening on port " + app.get("port"));
});

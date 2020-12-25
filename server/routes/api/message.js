const { Message } = require("../../schema/message");
const response = require("../api/response");
const { Room } = require("../../schema/room");
const MAX_PAGE_SIZE = 100;

exports.sendMessage = async function (data, io) {
  let room = await Room.findById(data.room);

  if (!room) {
  }
  try {
    let message = new Message(data);

    await message.save();

    await Room.findByIdAndUpdate(room._id, { last_msg_id: message._id });

    let content = await Message.findById(message._id).populate(
      "from",
      "_id name username profile last_seen"
    );

    await io.sockets.in(room._id).emit("message", content);
  } catch (e) {
    console.log(e);
  }
};

exports.notifyDataSetChanged = async function (roomId, io, clients) {
  let room = await Room.findById(roomId);

  if (!room) {
  }
  try {
    let foundedRoom = await Room.findById(room._id)
      .populate("users", "_id name username profile last_seen ")
      .populate("last_msg_id")
      .populate({ path: "last_msg_id", populate: { path: "from" } })
      .populate("admin", "_id name username profile last_seen ");

    await foundedRoom.users.forEach(function (user) {
      let socketId = clients.search(user._id.toString());

      if (socketId) {
        io.sockets.to(socketId).emit("change", foundedRoom);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

exports.messageList = async function (req, res) {
  try {
    let room_id = req.query.room_id;
    let pageNo = parseInt(req.query.pageNo || 1);
    if (pageNo !== 0) {
      pageNo--;
    }

    let limit = parseInt(req.query.limit || MAX_PAGE_SIZE);

    let documentCount = await Message.countDocuments({ room: room_id });

    let messageFounded = await Message.find({ room: room_id })
      .skip(pageNo * limit)
      .limit(limit)
      .sort({
        date: -1,
      })
      .populate("from", "_id name username phone_number blocked profile");

    if (messageFounded.length <= 0) {
      return res
        .status(response.STATUS_OK)
        .json(response.createResponse(response.FAILED, "nothing found"));
    }
    return res
      .status(response.STATUS_OK)
      .json(
        response.createResponse(
          response.SUCCESS,
          "Success",
          messageFounded,
          documentCount,
          pageNo,
          limit
        )
      );
  } catch (e) {
    return res
      .status(response.STATUS_BAD_REQUEST)
      .json(
        response.createResponse(response.ERROR, "something went wrong " + e)
      );
  }
};

const { Room } = require("../../schema/room");
const {
  Message,
  MessageType,
  EventType,
  ReadStatus,
} = require("../../schema/message");
const response = require("../../routes/api/response");

exports.createRoom = async function (req, res) {
  let users = req.body.users;

  users.push(req.user._id);

  let uniqueList = [...new Set(users)];

  let room = new Room({ users: uniqueList, admin: req.user._id });

  let foundedRoom = await Room.findOne({
    admin: req.user._id,
    users: uniqueList,
  })
    .populate("users", "_id name username profile last_seen", {
      _id: {
        $ne: req.user._id,
      },
    })
    .populate("last_msg_id")
    .populate({
      path: "last_msg_id",
      populate: { path: "from" },
    })
    .populate("admin", "_id name username profile last_seen");

  if (!foundedRoom) {
    let createdMessage = new Message({
      room: room._id,
      content: "Room created",
      event_type: EventType.SERVER,
    });
    createdMessage.save();

    room.last_msg_id = createdMessage._id;
    await room.save(async function (err) {
      if (err) {
        return res
          .status(response.STATUS_BAD_REQUEST)
          .json(
            response.createResponse(response.FAILED, "Failed to create room")
          );
      } else {
        let roomCreated = await Room.findOne(room._id)
          .populate("users", "_id name username profile last_seen", {
            _id: {
              $ne: req.user._id,
            },
          })
          .populate("last_msg_id")
          .populate("admin", "_id name username profile last_seen");

        if (roomCreated) {
          return res.status(response.STATUS_OK).json(
            response.createResponse(response.SUCCESS, "Success", {
              room: roomCreated,
            })
          );
        } else {
          return res
            .status(response.STATUS_OK)
            .json(
              response.createResponse(
                response.SUCCESS,
                "Room created but failed to get data"
              )
            );
        }
      }
    });
  } else {
    return res.status(response.STATUS_OK).json(
      response.createResponse(response.SUCCESS, "already exist", {
        room: foundedRoom,
      })
    );
  }
};

exports.getRooms = async function (req, res) {
  try {
    let foundedRoom = await Room.find({ users: { $in: req.user._id } })
      .populate("users", "_id name username profile last_seen", {
        _id: {
          $ne: req.user._id,
        },
      })
      .populate("last_msg_id")
      .populate({
        path: "last_msg_id",
        populate: { path: "from" },
      })
      .populate("admin", "_id name username profile last_seen");
    return res
      .status(response.STATUS_OK)
      .json(
        response.createResponse(
          response.SUCCESS,
          "Success",
          { rooms: foundedRoom },
          foundedRoom.length
        )
      );
  } catch (e) {
    return res
      .status(response.SERVER_ERROR)
      .json(response.createResponse(response.ERROR, e));
  }
};

//get single room
exports.getRoom = async function (req, res) {
  try {
    let id = req.params.room;
    await Message.updateMany(
      { room: id },
      { read_status: ReadStatus.READ },
      { multi: true }
    );

    let foundedRoom = await Room.findById(id)
      .populate("users", "_id name username profile last_seen", {
        _id: {
          $ne: req.user._id,
        },
      })
      .populate("last_msg_id")
      .populate({
        path: "last_msg_id",
        populate: { path: "from" },
      })
      .populate("admin", "_id name username profile last_seen");

    let roomMessages = await Message.find({ room: foundedRoom.id }).populate(
      "from",
      "_id name username profile last_seen"
    );

    return res.status(response.STATUS_OK).json(
      response.createResponse(
        response.SUCCESS,
        "Success",
        {
          room: foundedRoom,
          messages: roomMessages,
        },
        foundedRoom.length
      )
    );
  } catch (e) {
    return res
      .status(response.SERVER_ERROR)
      .json(response.createResponse(response.ERROR, e));
  }
};

const { mongoose } = require("./../database/mongoose");
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
const shortId = require("shortid");

let ChatType = {
  PERSONAL: 0,
  GROUP: 1,
  BROADCAST: 2,
};

let RoomSchema = new Schema({
  code: { type: String, trim: true, unique: true },

  users: [{ type: ObjectId, ref: "User" }],

  last_msg_id: { type: ObjectId, ref: "Message", default: null },

  type: { type: Number, default: ChatType.PERSONAL },

  admin: { type: ObjectId, ref: "User" },

  deleted: { type: Boolean, default: false },

  updated_at: { type: Number, required: true, default: new Date().getTime() },

  created_at: { type: Number, required: true, default: new Date().getTime() },
});

RoomSchema.pre("save", async function (next) {
  this.code = await shortId.generate();
  this.updated_at = new Date().getTime();
  this.created_at = new Date().getTime();
  next();
});

RoomSchema.pre("update", function (next) {
  this.updated_at = new Date().getTime();
  next();
});

let Room = mongoose.model("Room", RoomSchema);

module.exports = { Room, ChatType };

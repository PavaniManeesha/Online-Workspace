const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
  },
  roomID: {
    type: String,
    required: true,
  },
  createdUser: { type: Schema.Types.ObjectId, ref: "User" },
  roomPassword: {
    type: String,
    required: true,
  },
  users: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      onlineTime: { type: Number, default: 0 },
      blockCount: { type: Number, default: 0 },
    },
  ],
  CreatedOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

//user document and path
const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;

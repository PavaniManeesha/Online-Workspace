const router = require("express").Router();
let Room = require("../models/roomModel");
// Update users in a room by roomID
// Multer configuration for file uploads
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
// Define the upload folder path

router.put("/update-users/:roomID", async (req, res) => {
  try {
    const { roomID } = req.params;
    const { users } = req.body; // Array of user IDs to be added/updated in the room

    // Find the room by roomID
    const room = await Room.findOne({ roomID: roomID });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found!",
        code: 0,
        data: [],
      });
    }

    // Update the users array in the room document
    room.users = users.map((user) => ({
      user: user,
      onlineTime: user.onlineTime || 0,
      blockCount: user.blockCount || 0,
    }));

    // Save the updated room document
    await room.save();

    res.json({
      msg: "Room users successfully updated!",
      code: 1,
      data: [{ roomID: roomID, users: room.users }],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "Error updating users in room", code: 0, data: [] });
  }
});
router.get("/get/:roomID", async (req, res) => {
  try {
    const { roomID } = req.params;

    // Find the room by roomID
    const room = await Room.findOne({ roomID: roomID }).populate(
      "users.user",
      "-password -__v"
    );

    if (!room) {
      return res.status(404).json({
        msg: "Room not found!",
        code: 0,
        data: [],
      });
    }

    res.json({
      msg: "Room successfully retrieved!",
      code: 1,
      data: [room],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "Error while retrieving room", code: 0, data: [] });
  }
});
// Delete Room by roomID
router.delete("/delete/:roomID", async (req, res) => {
  try {
    const { roomID } = req.params;

    // Find the room by roomID
    const room = await Room.findOne({ roomID: roomID });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found!",
        code: 0,
        data: [],
      });
    }

    // Delete the room
    await Room.deleteOne({ roomID: roomID });

    res.json({
      msg: "Room successfully deleted!",
      code: 1,
      data: [{ roomID: roomID }],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error deleting room", code: 0, data: [] });
  }
});
// Update user's online time in a room by roomID and userID
router.put("/update-online-time/:roomID/:userID", async (req, res) => {
  try {
    const { roomID, userID } = req.params;
    const { onlineTime } = req.body; // online time to be updated in minutes

    // Find the room by roomID
    const room = await Room.findOne({ roomID: roomID });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found!",
        code: 0,
        data: [],
      });
    }

    // Find the user in the room and update their online time
    const userInRoom = room.users.find(
      (user) => user.user.toString() === userID
    );

    if (!userInRoom) {
      return res.status(404).json({
        msg: "User not found in this room!",
        code: 0,
        data: [],
      });
    }

    userInRoom.onlineTime = onlineTime;

    // Save the updated room document
    await room.save();

    res.json({
      msg: "User's online time successfully updated!",
      code: 1,
      data: [
        { roomID: roomID, userID: userID, onlineTime: userInRoom.onlineTime },
      ],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "Error updating online time", code: 0, data: [] });
  }
});
// Update user's block count in a room by roomID and userID
router.put("/update-block-count/:roomID/:userID", async (req, res) => {
  try {
    const { roomID, userID } = req.params;
    const { blockCount } = req.body; // New block count to be updated

    // Find the room by roomID
    const room = await Room.findOne({ roomID: roomID });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found!",
        code: 0,
        data: [],
      });
    }

    // Find the user in the room and update their block count
    const userInRoom = room.users.find(
      (user) => user.user.toString() === userID
    );

    if (!userInRoom) {
      return res.status(404).json({
        msg: "User not found in this room!",
        code: 0,
        data: [],
      });
    }

    userInRoom.blockCount = blockCount;

    // Save the updated room document
    await room.save();

    res.json({
      msg: "User's block count successfully updated!",
      code: 1,
      data: [
        { roomID: roomID, userID: userID, blockCount: userInRoom.blockCount },
      ],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "Error updating block count", code: 0, data: [] });
  }
});
//Create room
router.post("/create", async (req, res) => {
  try {
    const { roomName, roomID, createdUser, roomPassword, users } = req.body;

    const roomRes = await Room.findOne({ roomID: roomID });

    if (roomRes) {
      res.json({
        msg: "Error Occurred While Creating Room.Please Recreate !",
        code: 0,
        data: [{ roomID: roomID }],
      });
    } else {
      const uploadFolder = path.join(__dirname, "../uploads/" + roomID);
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }
      // if (!fs.existsSync(uploadFolder + "/temp")) {
      //   fs.mkdirSync(uploadFolder + "/temp", { recursive: true });
      // }
      const response = await Room.create({
        roomName,
        roomID,
        createdUser,
        roomPassword,
        users,
      });
      const room = await Room.findOne({ roomID: roomID });
      console.log(room, "room");
      // Update the users array in the room document
      room.users =
        users.length > 0
          ? users.map((user) => ({
              user: user,
              onlineTime: user.onlineTime || 0,
              blockCount: user.blockCount || 0,
            }))
          : [{ user: createdUser, onlineTime: 0, blockCount: 0 }];

      // Save the updated room document
      await room.save();
      res
        .json({
          msg: "Successfully Created Room !",
          code: 1,
          data: [{ response }],
        })
        .send();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: err, code: 0, data: [] }).send();
  }
});
router.post("/create", async (req, res) => {
  try {
    const { roomName, roomID, createdUser, roomPassword, users } = req.body;

    const roomRes = await Room.findOne({ roomID: roomID });

    if (roomRes) {
      res.json({
        msg: "Error Occurred While Creating Rom.Please Recreate !",
        code: 0,
        data: [{ roomID: roomID }],
      });
    } else {
      const response = await Room.create({
        roomName,
        roomID,
        createdUser,
        roomPassword,
        users,
      });

      res
        .json({
          msg: "Successfully Created Room !",
          code: 1,
          data: [{ response }],
        })
        .send();
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: err, code: 0, data: [] }).send();
  }
});
//find all rooms
router.post("/search", async (req, res) => {
  try {
    const { userID } = req.body;

    // Find rooms where the user is either the creator or inside the room
    const rooms = await Room.find({
      $or: [{ createdUser: userID }, { "users.user": { $in: [userID] } }],
    }).populate("createdUser users.user", "-password -__v"); // Populating user details without sensitive information

    console.log(rooms);

    res.json({
      msg: "Successfully retrieved rooms",
      code: 1,
      data: rooms, // Send the array of rooms directly
    });
  } catch (err) {
    console.error("Error finding rooms:", err);
    res.status(500).json({
      msg: "Error retrieving rooms",
      code: 0,
      error: err.message,
    });
  }
});
module.exports = router;

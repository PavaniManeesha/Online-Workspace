const express = require("express");
//Cross Origin Reference Sharing Enable to send request using browser
const cors = require("cors");
const multer = require("multer");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { mongoose } = require("mongoose");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Configure  and enable CORS
app.use(cors());

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get the directory from the URL parameter
    const dynamicDir = req.params.dir;

    cb(null, "uploads/" + dynamicDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Array to store socket connections from each user
let connections = [];

// Function to get file names in the uploads folder
const getFileNames = (id) => {
  return new Promise((resolve, reject) => {
    fs.readdir("uploads/" + id, (err, files) => {
      if (err) {
        reject(err);
      } else {
        console.log(files);
        resolve(files);
      }
    });
  });
};
//Socket Functions
// Function to emit file names to all connected clients
const emitFileNames = async (id) => {
  try {
    const files = await getFileNames(id);
    connections.forEach((socket) => {
      socket.emit("fileList", files);
    });
  } catch (error) {
    console.error("Error getting file names:", error);
  }
};
let blocks = [];
// Socket.IO connection handling
io.on("connect", (socket) => {
  connections.push(socket);

  console.log(`${socket.id} has connected`);

  //update blocks
  socket.on("block", (block) => {
    //broadcast to all users

    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("block", block);
      }
    });
  });

  //to emit updates from notepad
  socket.on("text", (data) => {
    console.log("text", data);
    // Broadcast text data to all connected clients except the sender
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("text", data);
      }
    });
  });

  //join room
  socket.on("joinRoom", ({ username, room }) => {
    socket.username = username;
    socket.room = room;

    socket.join(room);
    emitFileNames(room);
    socket.to(socket.room).emit("message", {
      user: socket.username,
      text: `${username} has joined!`,
    });
  });

  //to emit updates from whiteboard
  socket.on("elements", (data) => {
    console.log(data);
    // Broadcast elements data to all connected clients except the sender
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("servedElements", { elements: data });
      }
    });
  });

  //mouse movement
  socket.on("down", (data) => {
    // Broadcast "down" event to all connected clients except the sender
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("ondown", { x: data.x, y: data.y, email: data.email });
      }
    });
  });

  //to emit chat messages
  socket.on("chatMessage", (message) => {
    io.to(socket.room).emit("message", {
      user: socket.username,
      text: message,
    });
  });
  //user joined message (calling option)
  // socket.on("sendingSignal", (payload) => {
  //   io.to(payload.userToSignal).emit("userJoined", {
  //     signal: payload.signal,
  //     callerID: payload.callerID,
  //   });
  // });

  // socket.on("returningSignal", (payload) => {
  //   io.to(payload.callerID).emit("receivingReturnedSignal", {
  //     signal: payload.signal,
  //     id: socket.id,
  //   });
  // });
});

//End Points

// File upload endpoint
app.post("/upload/:dir", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const dynamicDir = req.params.dir;
  // After file upload, emit updated file list to all connected clients
  emitFileNames(dynamicDir);
  res.status(200).json({ message: "File uploaded successfully" });
});

// File download endpoint
app.get("/download/:dir/", (req, res) => {
  const dir = req.params.dir;
  const fileName = req.query.fileName;
  // const fileName = req.params.fileName;
  // console.log(fileName);
  const filePath = path.join(__dirname, "uploads/" + dir + "/", fileName);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", err);
      return res.status(404).json({ message: "File not found" });
    }

    // Set the appropriate headers
    res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-type", "application/octet-stream");

    // Create a read stream from the file and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});
//Database Connection Initialize

const URI = process.env.MONGODB_URI;
try {
  mongoose.connect(URI, {
    // useCreateindex: true,
    // useNewUrlParser: true,
    // userUnifiedTopologyL: true,
    // useFindAndModify: false,
  });

  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("Mongodb Connection success!");
  });
} catch (err) {
  console.log(err);
}

//Database Interaction Endpoints

//User Model Interaction
const userController = require("./routes/userRoutes");
const roomController = require("./routes/roomRoute");

app.use("/api/user", userController);
//Room Model Interaction
app.use("/api/room", roomController);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

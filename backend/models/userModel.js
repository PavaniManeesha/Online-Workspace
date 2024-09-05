const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  tp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  category: {
    type: Number,
    required: true,
  },
  CreatedOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

//user document and path
const User = mongoose.model("User", UserSchema);
module.exports = User;

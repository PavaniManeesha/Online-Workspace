const router = require("express").Router();
let User = require("../models/userModel");

//Get All Users
router.get("/", async (req, res) => {
  try {
    await User.find()
      .then((user) => {
        res.json({
          msg: "Successful !",
          code: 1,
          data: user,
        });
        res.json(user);
      })
      .catch((err) => {
        res.json({
          msg: err,
          code: 0,
          data: [],
        });
        //console.log(err);
      });
  } catch (error) {
    // console.log(error);
  }
});

//Get All Users
// router.post("/search",get((req, res) => {
//     User.find({ fName: "kavindu" })
//       .then((user) => {
//         res.json(user);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
//Register User (Save)
router.post("/register", async (req, res) => {
  try {
    const { fName, lName, dob, tp, email, password, category } = req.body;

    const emailRes = await User.findOne({ email: email });

    if (emailRes) {
      res.json({
        msg: "Email Already Exist !",
        code: 0,
        data: [{ email: email }],
      });
    } else {
      const response = await User.create({
        fName,
        lName,
        dob,
        tp,
        email,
        password,
        category,
      });
      console.log(response);
      res
        .json({
          msg: "Successfully Registered !",
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

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailRes = await User.findOne({ email: email });
    if (emailRes) {
      if (emailRes.password == password) {
        res
          .json({
            msg: "Login Successful",
            code: 1,
            data: [{ user: emailRes }],
          })
          .send();
      } else {
        res.json({ msg: "Password is Incorrect", code: 0, data: [] }).send();
      }
    } else {
      res
        .json({
          msg: "Cannot find account connected to this email",
          code: 0,
          data: [],
        })
        .send();
    }
  } catch (err) {}
});

module.exports = router;

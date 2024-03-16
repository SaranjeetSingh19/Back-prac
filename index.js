import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const app = express();

//  ** Connecting MongoDb **
mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "6pack-db" })
  .then(() => {
    console.log("DataBase Connected!!");
  })
  .catch((e) => {
    console.log("Error is getting in connecting DB", e);
  });

// ** created Schema **
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Using MIDDLEWARES
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//   ** Authentication checker **
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "jddkvndfosfefkjddj");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};

//  ** Home route **
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

// **  Login route  **
app.get("/login", (req, res) => {
  res.render("login");
});

// ** Register route **
app.get("/register", (req, res) => {
  res.render("register");
});

//  *********** POST ROUTES FROM HERE ************

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.render("login", { message: "Password incorrect 🔑❌" });

  const token = jwt.sign({ _id: user._id }, "jddkvndfosfefkjddj");
  console.log(token); 

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 1000),
  });
  res.redirect("/");
});

//  ** Register POST route  **
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }

  let hashedPassword = await bcrypt.hash(password, 16)

  user = await User.create({
    name,
    email,
    password : hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "jddkvndfosfefkjddj");
  console.log(token);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

//  ** Pushing data from FORM in MongoDB **
// app.post("/contact", async (req, res) => {
//   const { name, email } = req.body;
//   await Message.create({ name: name, email: email });

//   res.redirect("/success");
// });

//  ** static folder **
app.get("/static", (req, res) => {
  res.sendFile("index");
});

app.listen(5000, () => {
  console.log("🛞  Server is running on port no: 5000");
});

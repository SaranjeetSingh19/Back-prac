import express, { urlencoded } from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import { LOADIPHLPAPI } from "dns";

//  ** Connecting MongoDb **
mongoose
  .connect("mongodb://127.0.0.1:27017", { dbName: "6pack-db" })
  .then(() => {
    console.log("DataBase Connected!!");
  })
  .catch((e) => {
    console.log(e);
  });

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const Message = mongoose.model("Message", messageSchema);

const app = express();
const users = [];

// Using MIDDLEWARES
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

//  ** Home route **
app.get("/", (req, res) => {
  const { token } = req.cookies;
  console.log("Value of token is:" + token);

  if (token) {
    res.render("logout");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  res.cookie("token", "Bonku", {
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

//  ** Normal Route **
app.get("/success", (req, res) => {
  res.send("Check DB!!");
});

//  ** Dynamic route **
app.get("/contact", (req, res) => {
  res.render("index", { name: "Bonkieo" });
});

//  ** Pushing data from FORM in MongoDB **
app.post("/contact", async (req, res) => {
  const { name, email } = req.body;
  await Message.create({ name: name, email: email });

  res.redirect("/success");
});

//  ** Sending Chaining Data **
app.get("/chainingData", (req, res) => {
  res.status(404).send("Apun ka khudka ERROR");
});

//  ** static folder **
app.get("/static", (req, res) => {
  res.sendFile("index");
});

//  ** Dummy data **
app.get("/data", (req, res) => {
  res.json({
    Category: "Electronic ",
    quantity: 45,
    products: [],
    availability: true,
  });
});

app.listen(5000, () => {
  console.log("🛞  Server is running on port no: 5000");
});

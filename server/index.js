const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const User = require("./model").User
const Game = require("./model").Game
const DLC = require("./model").DLC
const Review = require("./model").Review
const Transaction = require("./model").Transaction
const Promotion = require("./model").Promotion
const Group = require("./model").Group
const { Publisher } = require("./model")
const app = express()

app.use(express.static("../client/public")) //Set static floder (.css)
app.set("views", "../client/public") //Set views folder (.ejs)
app.set("view engine", "ejs") //Set view engine
app.use(bodyParser.urlencoded({ extended: true })) //Set bodyParser
app.use(
  session({
    secret: "login",
    resave: false,
    saveUninitialized: false,
  })
)

app.get("/", (request, response) => {
  var sessionUsername = request.session.username
  var sessionRole = request.session.role
  Game.find({}).exec((err, doc) => {
    response.render("index", {
      data: doc,
      username: sessionUsername,
      role: sessionRole,
    })
  })
})

app.get("/signup", (request, respone) => {
  respone.render("signup")
})

app.get("/about", (request, respone) => {
  var usernameSession = request.session.username
  respone.render("about", { username: usernameSession })
})

app.all("/login", (request, response) => {
  var username = request.body.username
  var password = request.body.password
  var role = request.body.role
  if (username && password && role) {
    if (role == "user") {
      User.find({
        $and: [
          { username: { $eq: username } },
          { password: { $eq: password } },
        ],
      }).exec((err, doc) => {
        if (doc.length > 0) {
          //username & password are in database
          request.session.username = doc[0].username
          request.session.role = "user"
          response.redirect("/")
        } else {
          response.render("login", { logined: true, success: false })
        }
      })
    } else if (role == "publisher") {
      Publisher.find({
        $and: [
          { username: { $eq: username } },
          { password: { $eq: password } },
        ],
      }).exec((err, doc) => {
        if (doc.length > 0) {
          //username & password are in database
          request.session.username = doc[0].username
          request.session.role = "publisher"
          response.redirect("/")
        } else {
          response.render("login", { logined: true, success: false })
        }
      })
    }
  } else {
    //username & password not in database
    response.render("login", { logined: false, success: false })
  }
})

app.get("/logout", (request, response) => {
  request.session.destroy((error) => {
    if (!error) {
      response.redirect("/")
    } else {
      console.log(error)
    }
  })
})

app.get("/userinfo", (request, response) => {
  var sessionUsername = request.session.username
  User.find({ username: { $eq: sessionUsername } }).exec((err, doc) => {
    response.render("userinfo", doc[0])
  })
})

app.all("/register", (request, response) => {
  response.render("register")
})

app.get("/gameinfo", (request, response) => {
  var query = request.query.name
  Game.find({ name: { $eq: query } }).exec((err, doc) => {
    response.render("gameinfo", doc[0])
  })
})

app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

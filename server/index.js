const express = require("express")
const User = require("./model").User
const Game = require("./model").Game
const DLC = require("./model").DLC
const Review = require("./model").Review
const Transaction = require("./model").Transaction
const Promotion = require("./model").Promotion
const Group = require("./model").Group
const bodyParser = require("body-parser")
const app = express()

app.use(express.static("../Client/public")) //Set static floder (.css)
app.set("views", "../Client/public") //Set views folder (.ejs)
app.set("view engine", "ejs") //Set view engine
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (request, response) => {
  response.render("index")
})

app.get("/store", (request, response) => {
  response.render("store")
})

app.get("/about", (request, response) => {
  response.render("about")
})

app.get("/signup", (request, respone) => {
  respone.render("signup")
})

app.all("/login", (request, response) => {
  var username = request.body.username
  var password = request.body.password
  if (username && password) {
    User.find({
      $and: [{ username: { $eq: username } }, { password: { $eq: password } }],
    }).exec((err, doc) => {
      if (doc.length > 0) {
        var name = doc[0].fName
        response.send(`Hello ${name}`)
      } else {
        response.send(`Incorrect username or password`)
      }
    })
  } else {
    response.render("login")
  }
})

app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

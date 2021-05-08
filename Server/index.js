const express = require("express")
const User = require("./model").User
const Game = require("./model").Game
const DLC = require("./model").DLC
const Review = require("./model").Review
const Transaction = require("./model").Transaction
const Promotion = require("./model").Promotion
const bodyParser = require("body-parser")
const app = express()

app.use(express.static("../Client/public")) //Set static floder (.css)
app.set("views", "../Client/public") //Set views folder (.ejs)
app.set("view engine", "ejs") //Set view engine
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (request, response) => {
  response.render("index.ejs")
})

app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

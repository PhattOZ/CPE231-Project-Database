const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const formidable = require("formidable")
const fs = require("fs")
const User = require("./model").User
const Game = require("./model").Game
const DLC = require("./model").DLC
const Review = require("./model").Review
const Transaction = require("./model").Transaction
const Promotion = require("./model").Promotion
const Group = require("./model").Group
const Publisher = require("./model").Publisher
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

app.get("/publisherinfo", (request, response) => {
  response.render("publisherinfo")
})

app.all("/addgame", (request, response) => {
  var role = request.session.role
  if (role != "publisher") {
    response.redirect("/login")
  } else {
    var form = new formidable.IncomingForm() //read all user input in form
    form.parse(request, (err, fields, files) => {
      if (
        fields.gamename &&
        fields.category &&
        fields.price &&
        files.imgfile &&
        !err
      ) {
        let upfile = files.imgfile //อ้างอิงถึง Tag input ที่ชื่อ imgfile ใน index.ejs
        let dir = "../client/public/img/uploads/" //ตำแหน่งที่จะเก็บไฟล์รูป
        let imgName = upfile.name
        let newPath = dir + imgName
        if (fs.existsSync(newPath)) {
          //ตรวจพบว่ามีชื่อไฟล์นี้อยู่ในคอมเราอยู่แล้ว
          let oldName = upfile.name.split(".") //แยกชื่อกับนามสกุลไฟล์
          let r = Math.floor(Math.random() * 9999)
          oldName[0] += "_" + r
          //เอาชื่อใหม่มาต่อกับนามสกุลไฟล์เดิม
          imgName = oldName.join(".")
          newPath = dir + oldName.join(".")
        }
        let oldPath = upfile.path
        let rawData = fs.readFileSync(oldPath)
        let date = new Date()
        let day = date.toLocaleDateString() //get current dd/mm/yy as string
        let data = {
          name: fields.gamename,
          description: fields.description,
          systemReq: {
            os: fields.os,
            cpu: fields.cpu,
            ram: fields.ram,
            gpu: fields.gpu,
            hdd: fields.hdd,
          },
          category: fields.category,
          publisherName: fields.publishername,
          developerName: fields.developername,
          releaseDate: day,
          price: Number(fields.price),
          downloaded: 0,
          image: imgName,
        }
        fs.writeFile(newPath, rawData, (err) => {
          if (!err) {
            Game.create(data, (err) => {
              if (!err) {
                response.send(`Add success!`)
              }
            })
          } else {
            response.send(err)
          }
        })
      } else {
        response.render("addgame_publisher")
      }
    })
  }
})

app.all("/register", (request, response) => {
  var form = request.body
  if (form.username && form.password) {
    var data = {
      username: form.username,
      password: form.password,
      fName: form.fname,
      lName: form.lname,
      gender: form.gender,
      dob: form.dob,
      email: form.email,
      tel: form.tel,
    }
    User.create(data, (err) => {
      if (!err) {
        response.send(`Success!`) //แก้เป็น ejs ที่แสดงหน้าบอกสมัครสำเร็จ และมีแท็ก a href ไปหน้า login
      }
    })
  } else {
    response.render("register")
  }
})

app.get("/gameinfo", (request, response) => {
  var query = request.query.name
  Game.find({ name: { $eq: query } }).exec((err, doc) => {
    response.render("gameinfo", doc[0])
  })
})

app.get("/userinfo-edit", (request, response) => {
  response.render("userinfo-edit")
})

app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

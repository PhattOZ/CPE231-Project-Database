const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const formidable = require("formidable")
const fs = require("fs")
const User = require("./model").User
const Game = require("./model").Game
const Review = require("./model").Review
const Transaction = require("./model").Transaction
const Promotion = require("./model").Promotion
const Group = require("./model").Group
const Publisher = require("./model").Publisher
const app = express()

app.use(express.static("../client/public")) //Set static floder (.css)
app.set("views", "../client/public") //Set views folder (.ejs)
app.set("view engine", "ejs") //Set view engine
app.use(express.urlencoded({ extended: true })) //Set bodyParser
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
  if (sessionUsername) {
    //user คลิกเข้ามาดูข้อมูลส่วนตัว โดย user คนนั้นมีการ login แล้ว
    User.find({ username: { $eq: sessionUsername } }).exec((err, doc) => {
      response.render("userinfo", doc[0]) //doc[0] เป็น object แล้ว ส่งเข้าไป ejs ได้เลย ไม่ต้องทำ {data: doc[0]}
    })
  } else {
    //path เป็น /userinfo แต่ไม่มีการ login
    response.redirect("login")
  }
})

app.get("/publisherinfo", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var query = request.query.name //publisher name (string query)
  if (query) {
    //go to publisher info from gameinfo
    Publisher.find({ publisherName: { $eq: query } }).exec((err, doc) => {
      if (usernameSession == doc[0].username) {
        //publisher role and owned game
        response.render("publisherinfo", {
          data: doc[0],
          username: usernameSession,
          role: roleSession,
          owned: true,
        })
      } else if (roleSession == "publisher") {
        //publisher role but not owned game (publisher role for navbar_publisher)
        response.render("publisherinfo", {
          data: doc[0],
          username: usernameSession,
          role: roleSession,
          owned: false,
        })
      } else {
        //user want to view publisher profile
        response.render("publisherinfo", {
          data: doc[0],
          username: usernameSession,
          role: roleSession,
          owned: false,
        })
      }
    })
  } else if (roleSession == "publisher") {
    Publisher.find({ username: { $eq: usernameSession } }).exec((err, doc) => {
      response.render("publisherinfo", {
        data: doc[0],
        username: usernameSession,
        role: roleSession,
        owned: true,
      })
    })
  } else {
    response.redirect("/login")
  }
})

app.all("/add-game", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "publisher") {
    response.redirect("/login") //role isn't publisher -> redirect to login page
  } else {
    var form = new formidable.IncomingForm() //read all user input in form
    form.parse(request, (err, fields, files) => {
      if (fields.gamename && fields.price && files.imgfile && !err) {
        let array_category = fields.category.split(",") //split "Category1,Category2,..."" to array : ["Category1", "Category2"]
        let upfile = files.imgfile //อ้างอิงถึง Tag input ที่ชื่อ imgfile ใน index.ejs
        let dir = "../client/public/img/games/" //ตำแหน่งที่จะเก็บไฟล์รูป
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
          category: array_category,
          publisherName: fields.publishername,
          developerName: fields.developername,
          releaseDate: day,
          price: Number(fields.price),
          downloaded: 0,
          image: imgName,
        }
        fs.writeFile(newPath, rawData, (err) => {
          if (!err) {
            var gamename_addDate = {
              name: fields.gamename,
              image: imgName,
              date: day,
            }
            Game.create(data, (err) => {
              if (!err) {
                Publisher.findOneAndUpdate(
                  { username: { $eq: usernameSession } },
                  { $push: { added_game: gamename_addDate } }
                ).exec((err) => {
                  if (!err) {
                    response.render("addgame_success", {
                      username: usernameSession,
                      role: roleSession,
                    })
                  }
                })
              } else {
                response.send(`This game name already exists!`) //ทำหน้า static ที่บอกว่ามีเกมนี้ในระบบแล้ว
              }
            })
          } else {
            response.send(err)
          }
        })
      } else {
        Publisher.find({ username: { $eq: usernameSession } }).exec(
          (err, doc) => {
            var publisherName = doc[0].publisherName
            response.render("addgame_publisher", {
              username: usernameSession,
              publishername: publisherName,
            })
          }
        )
      }
    })
  }
})

app.all("/add-dlc", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var query = request.query.name //game name (string query)
  if (roleSession != "publisher") {
    response.redirect("/login")
  } else {
    if (query) {
      var form = new formidable.IncomingForm()
      form.parse(request, (err, fields, files) => {
        if (fields.dlcname && fields.price && files.imgfile && !err) {
          //Publisher submit DLC data in form
          let upfile = files.imgfile //อ้างอิงถึง Tag input ที่ชื่อ imgfile ใน index.ejs
          let dir = "../client/public/img/dlc/" //ตำแหน่งที่จะเก็บไฟล์รูป
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
            //data for dlc in game schema
            dlcname: fields.dlcname,
            publisherName: fields.publishername,
            developerName: fields.developername,
            releaseDate: day,
            price: Number(fields.price),
            downloaded: 0,
            image: imgName,
          }
          fs.writeFile(newPath, rawData, (err) => {
            if (!err) {
              //Add DLC data to dlc in game schema
              Game.findOneAndUpdate(
                { name: { $eq: query } },
                { $push: { dlc: data } }
              ).exec((err) => {
                if (!err) {
                  var dlc_data_publisher = {
                    gamename: query,
                    dlcname: fields.dlcname,
                    image: imgName,
                    date: day,
                  }
                  Publisher.findOneAndUpdate(
                    { username: { $eq: usernameSession } },
                    { $push: { added_dlc: dlc_data_publisher } }
                  ).exec((err) => {
                    if (!err) {
                      response.render("add-dlc_success", {
                        username: usernameSession,
                        role: roleSession,
                      })
                    }
                  })
                } else {
                  response.send(`This DLC name already exists!`)
                }
              })
            }
          })
        } else {
          Publisher.find({ username: { $eq: usernameSession } }).exec(
            (err, doc) => {
              var publisherName = doc[0].publisherName
              response.render("add-dlc_form", {
                username: usernameSession,
                publishername: publisherName,
                gamename: query,
              })
            }
          )
        }
      })
    } else {
      Publisher.find({ username: { $eq: usernameSession } }).exec(
        (err, doc) => {
          var game_history = doc[0].added_game
          response.render("add-dlc_publisher", {
            data: game_history,
            username: usernameSession,
            role: roleSession,
          })
        }
      )
    }
  }
})

app.all("/addfriend", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var form = new formidable.IncomingForm() //read all user input in form
  form.parse(request, (err, fields) => {
    if (fields.friends && !err) {
      let array_friends = fields.friends.split(",") //split "Category1,Category2,..."" to array : ["Category1", "Category2"]
      var data = { friends: array_friends,}
      User.findOneAndUpdate(
        { username: { $eq: usernameSession } },
        { $push: { friends: data } }).exec((err) => {
        if (!err) {
          response.send("friends success", {
            username: usernameSession,
            role: roleSession,
          })
        }
        else {
          response.send(`Add error`)
        }
      })
    } 
    else {
      User.findOne({username : {$eq : usernameSession }}).exec((err,uname)=>
        User.find({username : {$nin : uname.friends}}).exec((docs) =>
        response.render("addfriend_user", {
          data: docs
        })
        )
      )
    }
  })
})

// app.get("/history-publisher", (request, respone) => {
//   var usernameSession = request.session.username
//   var roleSession = request.session.role
//   if (roleSession != "publisher") {
//     response.redirect("/login") //role isn't publisher -> redirect to login page
//   } else {
//     Publisher.find({ username: { $eq: usernameSession } }).exec((err, doc) => {
//       var data = doc[0].added_game
//       respone.render("history_publisher", {
//         data: data,
//         username: usernameSession,
//         role: roleSession,
//       })
//     })
//   }
// })

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
        response.render("Register_success")
      } else {
        response.render("register", { success: false })
      }
    })
  } else {
    response.render("register", { success: true })
  }
})

app.get("/gameinfo", (request, response) => {
  var query = request.query.name
  var usernameSession = request.session.username
  var roleSession = request.session.role
  Game.find({ name: { $eq: query } }).exec((err, doc) => {
    response.render("gameinfo", {
      data: doc[0],
      username: usernameSession,
      role: roleSession,
    })
  })
})

app.get("/dlcinfo", (request, response) => {
  var gamenamequery = request.query.gamename //game name
  var dlcnamequery = request.query.dlcname //dlc name
  Game.find({ name: { $eq: gamenamequery } }).exec((err, doc) => {
    if (!err) {
      for (data of doc[0].dlc) {
        if (data.dlcname == dlcnamequery) {
          response.render("dlcinfo", { gamename: gamenamequery, data: data })
        }
      }
    }
  })
})

app.all("/userinfo-edit", (request, response) => {
  if (request.method == "GET") {
    var sessionUsername = request.session.username
    User.findOne({ username: { $eq: sessionUsername } }).exec((err, doc) => {
      response.render("userinfo-edit", { data: doc })
    })
  } else if (request.method == "POST") {
    var sessionUsername = request.session.username
    var form = request.body
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
    console.log(data)
    User.findOneAndUpdate({ username: { $eq: sessionUsername } }, data, {
      useFindAndModify: false,
    }).exec((err) => response.redirect("userinfo"))
  }
})

app.all("/publisherinfo-edit", (request, response) => {
  if (request.method == "GET") {
    var sessionUsername = request.session.username
    console.log(sessionUsername)
    Publisher.find({ username: { $eq: sessionUsername } }).exec((err, doc) => {
      console.log(doc)
      response.render("publisherinfo-edit", { data: doc[0] })
    })
  } else if (request.method == "POST") {
    var sessionUsername = request.session.username
    var form = request.body
    var data = {
      username: form.username,
      password: form.password,
      publisherName: form.publishername,
      email: form.email,
      tel: form.tel,
    }
    console.log(data)
    Publisher.findOneAndUpdate({ username: { $eq: sessionUsername } }, data, {
      useFindAndModify: false,
    }).exec((err) => response.redirect("publisherinfo"))
  }
})

app.all("/buygame", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "user") {
    response.redirect("login") //if role isn't 'user' role -> can't buy game -> redirect to login page
  } else {
    var gamename_query = request.query.gamename
    if (request.method == "GET") {
      Game.find({ name: { $eq: gamename_query } }).exec((err, doc) => {
        response.render("buygame", { data: doc[0] })
      })
    } else if (request.method == "POST") {
      response.send(`BUY`)
    }
  }
})

app.all("/search",(request,response)=>{
  var gamename = request.body.searchGame 
  console.log(gamename)
  Game.find({
    Name: {$regex: gamename,$options:"i"}
  }).exec((err,doc) => response.render("search"),{data : doc})
})



app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

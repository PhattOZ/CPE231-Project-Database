const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const formidable = require("formidable")
const fs = require("fs")
const User = require("./model").User
const Game = require("./model").Game
const Transaction = require("./model").Transaction
const Group = require("./model").Group
const Publisher = require("./model").Publisher
const AccountRole = require("./model").AccountRole
const support = require("./model").support
const Admin = require("./model").Admin
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

app.get("/about", (request, respone) => {
  var usernameSession = request.session.username
  var sessionRole = request.session.role
  respone.render("about", { username: usernameSession,role: sessionRole, })
})

async function findRoleAccount(username) {
  try {
    var account = await AccountRole.findOne({ username: { $eq: username } })
    var role = account.role
    return role
  } catch (err) {
    //handle promise error (this username not in AccountRole schema)
    return undefined
  }
}

app.all("/login", (request, response) => {
  var username = request.body.username
  var password = request.body.password
  if (username && password) {
    const checkLogin = async () => {
      var role = await findRoleAccount(username)
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
            response.render("login", { logined: true, success: false }) //this username & password not in database
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
            response.render("login", { logined: true, success: false }) //this username & password not in database
          }
        })
      } else if (role == "admin") {
        Admin.find({
          $and: [
            { username: { $eq: username } },
            { password: { $eq: password } },
          ],
        }).exec((err, doc) => {
          if (doc.length > 0) {
            //username & password are in database
            request.session.username = doc[0].username
            request.session.role = "admin"
            response.redirect("/")
          } else {
            response.render("login", { logined: true, success: false }) //this username & password not in database
          }
        })
      } else if (!role) {
        //role is undefined -> this username not in AccountRole collection
        response.render("login", { logined: true, success: false }) //this username & password not in database
      }
    }
    checkLogin()
  } else {
    //first time to /login -> render login page
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
    response.render("login", { user: true })
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
    response.render("login", { publisher: true })
  }
})

app.all("/add-game", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "publisher") {
    response.render("login", { publisher: true }) //role isn't publisher -> redirect to login page
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
            respone.render("Error_General", { username: usernameSession,role: sessionRole, })
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
    response.render("login", { publisher: true })
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
            dlcdescription: fields.dlcdescription,
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
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't user -> redirect to login page
  } else {
    form.parse(request, (err, fields) => {
      if (fields.friends && !err) {
        let array_friends = fields.friends.split(",") //split "friend1,friend2,..."" to array : ["friend1", "friend2"]
        //Update in User
        User.findOneAndUpdate(
          { username: { $eq: usernameSession } },
          { $addToSet: { friends: array_friends } }
        ).exec((err) => {
          if (!err) {
            //Update in Friend
            User.updateMany(
              { username: { $in: array_friends } /*{ $in: array_friends }*/ },
              { $addToSet: { friends: usernameSession } }
            ).exec((err) => {
              if (!err) {
                response.render("addfriend_success", {
                  username: usernameSession,
                  role: roleSession,
                })
              } else {
                respone.render("Error_General", { username: usernameSession,role: sessionRole, })
              }
            })
          } else {
            respone.render("Error_General", { username: usernameSession,role: sessionRole, })
          }
        })
      } else {
        User.findOne({ username: { $eq: usernameSession } }).exec(
          (err, uname) => {
            var friendname = []
            User.find({
              $and: [
                { username: { $nin: uname.friends } },
                { username: { $ne: uname.username } },
              ],
            }).exec((err, docs) => {
              for (d of docs) {
                friendname.push(d.username)
              }
              response.render("addfriend_user", {
                data: docs,
                username: usernameSession,
                role: roleSession,
              })
            })
          }
        )
      }
    })
  }
})

app.all("/deletefriend", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var form = new formidable.IncomingForm() //read all user input in form
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't user -> redirect to login page
  } else {
    form.parse(request, (err, fields) => {
      if (fields.friends && !err) {
        let array_friends = fields.friends.split(",") //split "friend1,friend2,..."" to array : ["friend1", "friend2"]
        //Update in User
        User.updateOne(
          { username: { $eq: usernameSession } },
          { $pull: { friends: { $in: array_friends } } }
        ).exec((err) => {
          if (!err) {
            //Update in Friend
            User.updateMany(
              { username: { $in: array_friends } /*{ $in: array_friends }*/ },
              { $pull: { friends: usernameSession } }
            ).exec((err) => {
              if (!err) {
                response.render("deletefriend_success", {
                  username: usernameSession,
                  role: roleSession,
                })
              } else {
                respone.render("Error_General", { username: usernameSession,role: sessionRole, })
              }
            })
          } else {
            respone.render("Error_General", { username: usernameSession,role: sessionRole, })
          }
        })
      } else {
        User.findOne({ username: { $eq: usernameSession } }).exec(
          (err, uname) => {
            var friendname = []
            User.find({
              $and: [
                { username: { $in: uname.friends } },
                { username: { $ne: uname.username } },
              ],
            }).exec((err, docs) => {
              for (d of docs) {
                friendname.push(d.username)
              }
              response.render("deletefriend_user", {
                data: docs,
                username: usernameSession,
                role: roleSession,
              })
            })
          }
        )
      }
    })
  }
})

app.all("/CreateGroup", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var form = new formidable.IncomingForm() //read all user input in form
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't publisher -> redirect to login page
  } else {
    form.parse(request, (err, fields) => {
      if (fields.name && fields.member && !err) {
        let array_member = fields.member.split(",")
        array_member.push(usernameSession)
        let groupname = fields.name
        var data = {
          name: groupname,
          member: array_member,
        }
        //Update in User
        Group.create(data, (err) => {
          if (!err) {
            //Update in member
            User.updateMany(
              { username: { $in: array_member } },
              { $addToSet: { group: groupname } }
            ).exec((err) => {
              if (!err) {
                response.render("creategroup_success", {
                  username: usernameSession,
                  role: roleSession,
                })
              } else {
                respone.render("Error_General", { username: usernameSession,role: sessionRole, })
              }
            })
          } else {
            respone.render("Error_General", { username: usernameSession,role: sessionRole, })
          }
        })
      } else {
        User.findOne({ username: { $eq: usernameSession } }).exec(
          (err, uname) => {
            var friendname = []
            User.find({
              $and: [
                { username: { $in: uname.friends } },
                { username: { $ne: uname.username } },
              ],
            }).exec((err, docs) => {
              for (d of docs) {
                friendname.push(d.username)
              }
              response.render("CreateGroup", {
                data: docs,
                username: usernameSession,
                role: roleSession,
              })
            })
          }
        )
      }
    })
  }
})

app.all("/DeleteGroup", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var form = new formidable.IncomingForm() //read all user input in form
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't publisher -> redirect to login page
  } else {
    form.parse(request, (err, fields) => {
      if (fields.groupname && !err) {
        let array_group = fields.groupname.split(",")
        var membername = []
        Group.find({ name: { $in: array_group } }).exec((err, docs) => {
          if (!err) {
            //find all member of the groups
            for (d of docs) {
              for (m of d.member) {
                membername.push(m)
              }
            }
            User.updateMany(
              { username: { $in: membername } },
              { $pull: { group: { $in: array_group } } }
            ).exec((err) => {
              if (!err) {
                Group.deleteMany({ name: { $in: array_group } }).exec((err) => {
                  if (!err) {
                    response.render("deletegroup_success", {
                      username: usernameSession,
                      role: roleSession,
                    })
                  } else {
                    respone.render("Error_General", { username: usernameSession,role: sessionRole, })
                  }
                })
              } else {
                respone.render("Error_General", { username: usernameSession,role: sessionRole, })
              }
            })
          } else {
            respone.render("Error_General", { username: usernameSession,role: sessionRole, })
          }
        })
      } else {
        User.findOne({ username: { $eq: usernameSession } }).exec(
          (err, docs) => {
            response.render("DeleteGroup", {
              data: docs,
              username: usernameSession,
              role: roleSession,
            })
          }
        )
      }
    })
  }
})

app.all("/UserGroup", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't publisher -> redirect to login page
  } else {
    User.findOne({ username: { $eq: usernameSession } }).exec((err, doc) => {
      var grouplist = []
      for (g of doc.group) {
        grouplist.push(g)
      }
      Group.find({ name: { $in: grouplist } }).exec((err, docs) => {
        response.render("Group_info", {
          data: docs,
          username: usernameSession,
          role: roleSession,
        })
      })
    })
  }
})

app.all("/support", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "user") {
    response.render("login", { user: true }) //role isn't publisher -> redirect to login page
  } else {
    if (request.method == "GET") {
      User.findOne({ username: { $eq: usernameSession } }).exec((err, doc) => {
        response.render("support", {
          data: doc,
          username: usernameSession,
          role: roleSession,
        })
      })
    } else if (request.method == "POST") {
      var form = request.body
      var data = {
        username: form.username,
        email: form.email,
        tel: form.tel,
        comment: form.comment,
      }
      support.create(data, (err) => {
        if (!err) {
          response.render("support_success", {
            username: usernameSession,
            role: roleSession,
          })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      })
    }
  }
})

app.all("/support_view", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "admin") {
    response.render("login", { admin: true }) //role isn't admin -> redirect to login page
  } else {
    support.find({}).exec((err, docs) => {
      response.render("support_view", {
        data: docs,
        username: usernameSession,
        role: roleSession,
      })
    })
  }
})

//analysis report 1 (publisher role)
app.all("/DeveloperSales", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "publisher") {
    response.render("login", { publisher: true }) //role isn't publisher -> redirect to login page
  } else {
    Publisher.findOne({ username: { $eq: usernameSession } }).exec(
      (err, doc) => {
        if (!err) {
          Game.find({ publisherName: { $eq: doc.publisherName } })
            .sort({ developerName: 1, name: 1 })
            .exec((err, docs) => {
              response.render("analysisReport_DeveloperSales", {
                data: docs,
                username: usernameSession,
                role: roleSession,
              })
            })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      }
    )
  }
})

//analysis report 2 (admin role)
app.all("/GameSales", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "admin") {
    response.render("login", { admin: true }) //role isn't admin -> redirect to login page
  } else {
    Game.find({})
      .sort({ publisherName: 1, developerName: 1, name: 1 })
      .exec((err, docs) => {
        if (!err) {
          response.render("analysisReport_GameSales", {
            data: docs,
            username: usernameSession,
            role: roleSession,
          })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      })
  }
})

//analysis report 3 (publisher role)
app.all("/PublisherGameSales", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "publisher") {
    response.render("login", { publisher: true }) //role isn't publisher -> redirect to login page
  } else {
    Publisher.findOne({ username: { $eq: usernameSession } }).exec(
      (err, doc) => {
        if (!err) {
          Game.find({ publisherName: { $eq: doc.publisherName } })
            .sort({ developerName: 1, name: 1 })
            .exec((err, docs) => {
              response.render("analysisReport_PublisherGameSales", {
                data: docs,
                username: usernameSession,
                role: roleSession,
              })
            })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      }
    )
  }
})

//analysis report 4 (admin role)
app.all("/PublisherSales", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "admin") {
    response.render("login", { admin: true }) //role isn't admin -> redirect to login page
  } else {
    Game.find({})
      .sort({ publisherName: 1 })
      .exec((err, docs) => {
        if (!err) {
          response.render("analysisReport_PublisherSales", {
            data: docs,
            username: usernameSession,
            role: roleSession,
          })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      })
  }
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
        var accountData = {
          username: form.username,
          role: "user",
        }
        AccountRole.create(accountData, (err) => {
          if (!err) {
            response.render("Register_success")
          }
        })
      } else {
        response.render("register", { success: false }) //This username already exists
      }
    })
  } else {
    response.render("register", { success: true })
  }
})

async function checkUserOwnedGame(username, gamename) {
  try {
    var doc = await User.find({
      username: { $eq: username },
      "ownedItem.gamename": { $eq: gamename },
    })
    if (doc.length > 0) {
      //username already buy this game
      return true
    } else {
      return false
    }
  } catch (err) {}
}

app.get("/gameinfo", (request, response) => {
  const checkOwned = async () => {
    var query = request.query.name
    var usernameSession = request.session.username
    var roleSession = request.session.role
    var result = await checkUserOwnedGame(usernameSession, query)
    Game.find({ name: { $eq: query } }).exec((err, doc) => {
      response.render("gameinfo", {
        data: doc[0],
        username: usernameSession,
        role: roleSession,
        owned: result,
      })
    })
  } //end of checkOwned()
  checkOwned()
})

async function checkUserOwnedDLC(username, gamename, dlcname) {
  try {
    var doc = await User.find({
      username: { $eq: username },
      "ownedItem.gamename": { $eq: gamename },
      "ownedItem.dlcname": { $in: dlcname },
    })
    if (doc.length > 0) {
      //username already buy this dlc
      return true
    } else {
      return false
    }
  } catch (err) {}
}

app.get("/dlcinfo", (request, response) => {
  const checkOwned = async () => {
    var usernameSession = request.session.username
    var roleSession = request.session.role
    var gamenamequery = request.query.gamename //game name
    var dlcnamequery = request.query.dlcname //dlc name
    var result = await checkUserOwnedDLC(
      usernameSession,
      gamenamequery,
      dlcnamequery
    )
    Game.find({ name: { $eq: gamenamequery } }).exec((err, doc) => {
      if (!err) {
        for (data of doc[0].dlc) {
          if (data.dlcname == dlcnamequery) {
            response.render("dlcinfo", {
              gamename: gamenamequery,
              data: data,
              owned: result,
              username: usernameSession,
              role: roleSession,
            })
          }
        }
      }
    })
  } //end of checkOwned()
  checkOwned()
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
    User.findOneAndUpdate({ username: { $eq: sessionUsername } }, data, {
      useFindAndModify: false,
    }).exec((err) => response.redirect("userinfo"))
  }
})

app.all("/publisherinfo-edit", (request, response) => {
  if (request.method == "GET") {
    var sessionUsername = request.session.username

    Publisher.find({ username: { $eq: sessionUsername } }).exec((err, doc) => {
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
    Publisher.findOneAndUpdate({ username: { $eq: sessionUsername } }, data, {
      useFindAndModify: false,
    }).exec((err) => response.redirect("publisherinfo"))
  }
})

app.get("/store", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  var sort_order = request.query.order //sort order (ascending || descending)
  var sort_query = request.query.sort //sort by (name || downloaded || price)
  if (sort_order == "ascending") {
    Game.find({})
      .sort(sort_query)
      .exec((err, doc) => {
        if (!err) {
          response.render("store", {
            data: doc,
            sort: sort_query,
            username: usernameSession,
            role: roleSession,
          })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      })
  } else if (sort_order == "descending") {
    Game.find({})
      .sort("-" + sort_query)
      .exec((err, doc) => {
        if (!err) {
          response.render("store", {
            data: doc,
            sort: sort_query,
            username: usernameSession,
            role: roleSession,
          })
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, })
        }
      })
  }
})

async function gamePrice(gamename) {
  try {
    var gamePrice = await Game.findOne({ name: { $eq: gamename } })
    return gamePrice.price
  } catch {
    return undefined
  }
}

app.all("/buygame", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "user") {
    response.render("login", { user: true }) //if role isn't 'user' role -> can't buy game -> redirect to login page
  } else {
    var gamename_query = request.query.gamename
    if (request.method == "GET") {
      Game.find({ name: { $eq: gamename_query } }).exec((err, doc) => {
        response.render("buygame", { data: doc[0] })
      })
    } else if (request.method == "POST") {
      var dlc_select = request.body.dlcname //get all user's checked dlc in checkbox (type : Object, separator w/ ,)
      dlc_select = String(dlc_select) //cast to String : (dlc1,dlc2,...)
      var dlc_select_list = dlc_select.split(",")
      Game.aggregate([
        { $match: { name: { $eq: gamename_query } } }, //filter document
        {
          $project: {
            dlc: {
              $filter: {
                input: "$dlc",
                as: "dlc",
                cond: { $in: ["$$dlc.dlcname", dlc_select_list] },
              },
            },
          },
        },
      ]).exec((err, doc) => {
        if (!err) {
          const confirm = async () => {
            var gamename = gamename_query
            var gameprice = await gamePrice(gamename)
            var gameData = {
              name: gamename,
              price: gameprice,
            }
            var totalPrice = 0
            var dlc_and_price = []
            for (var i = 0; i < doc[0].dlc.length; i++) {
              var data = {
                name: doc[0].dlc[i].dlcname,
                price: doc[0].dlc[i].price,
              }
              dlc_and_price.push(data)
              totalPrice += doc[0].dlc[i].price
            }
            totalPrice += gameprice
            response.render("buygame_confirm", {
              username: usernameSession,
              gamedata: gameData,
              dlcdata: dlc_and_price,
              totalprice: totalPrice,
              dlcstring: dlc_select,
            })
          } //end of confirm function
          confirm() //confirm page (summary total price)
        } else {
          respone.render("Error_General", { username: usernameSession,role: sessionRole, }) //static error page
        }
      })
    }
  }
})

async function buyGameAndDLC(username, gamedata, dlcdata) {
  try {
    if (!dlcdata) {
      //dlcdata is undefined
      var data = {
        gamename: gamedata,
      }
    } else {
      var data = {
        gamename: gamedata,
        dlcname: dlcdata,
      }
    }
    //Add user ownedItem
    await User.findOneAndUpdate(
      { username: { $eq: username } },
      { $push: { ownedItem: data } }
    )
    //Increase game downloaded number (+1)
    await Game.findOneAndUpdate(
      { name: { $eq: gamedata } },
      { $inc: { downloaded: 1 } }
    )
    //Increase downloaded dlc number (+1) at specfic dlcname where dlcname in dlcdata
    if (dlcdata) {
      for (dlcname of dlcdata) {
        await Game.findOneAndUpdate(
          {
            name: { $eq: gamedata },
            "dlc.dlcname": { $eq: dlcname },
          },
          { $inc: { "dlc.$.downloaded": 1 } }
        )
      }
    }
    return "success"
  } catch (err) {
    return "error"
  }
}

app.post("/buygame_success", (request, response) => {
  const update_collection = async () => {
    var username = request.query.username
    var gamename = request.query.gamename
    var dlcname = request.query.dlcname
    dlcname = dlcname.split(",")
    var total = request.query.total
    var status1 = await buyGameAndDLC(username, gamename, dlcname)
    var status2 = await update_transcation(username, gamename, dlcname, total)
    if (status1 == "success" && status2 == "success") {
      response.render("buygame_success")
    } else if (status1 == "error" || status2 == "error") {
      response.send("error buygame")
    }
  }
  update_collection()
})

async function update_transcation(username, gamename, dlcdata, total) {
  try {
    var date = new Date()
    var day = date.toLocaleDateString()
    var time = date.toLocaleTimeString()
    var data = {
      username: username,
      buydate: day,
      buytime: time,
      game: gamename,
      dlc: dlcdata,
      total: total,
    }
    await Transaction.create(data)
    return "success"
  } catch (err) {
    return "fail"
  }
}

async function dlcPrice(gamename, dlcname) {
  try {
    var doc = await Game.aggregate([
      { $match: { name: { $eq: gamename } } },
      {
        $project: {
          dlc: {
            $filter: {
              input: "$dlc",
              as: "dlc",
              cond: { $eq: ["$$dlc.dlcname", dlcname] },
            },
          },
        },
      },
    ])
    var dlcprice = doc[0].dlc[0].price
    return dlcprice
  } catch (err) {
    console.log(err)
  }
}

app.all("/buydlc", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  const checkBuyDLC = async () => {
    try {
      if (roleSession != "user") {
        response.render("login", { user: true })
      } else {
        //role is user
        var gamename = request.query.gamename
        var dlcname = request.query.dlcname
        var gameOwned = await checkUserOwnedGame(usernameSession, gamename)
        if (!gameOwned) {
          //user not owned this game but user click to buy dlc of that game
          Game.find({ name: { $eq: gamename } }).exec((err, doc) => {
            response.render("buygame", { data: doc[0], buyFirst: true })
          })
        } else {
          //user already buy this game's dlc
          var dlcprice = await dlcPrice(gamename, dlcname)
          if (request.method == "GET") {
            response.render("buydlc_confirm", {
              username: usernameSession,
              gamename: gamename,
              dlcname: dlcname,
              dlcprice: dlcprice,
            })
          } else if (request.method == "POST") {
            await User.findOneAndUpdate(
              { username: { $eq: usernameSession } },
              { $push: { "ownedItem.$[inner].dlcname": dlcname } },
              {
                arrayFilters: [{ "inner.gamename": { $eq: gamename } }],
                new: true,
              }
            )
            await Game.findOneAndUpdate(
              {
                name: { $eq: gamename },
                "dlc.dlcname": { $eq: dlcname },
              },
              { $inc: { "dlc.$.downloaded": 1 } }
            )
            await update_transcation(
              usernameSession,
              gamename,
              dlcname,
              dlcprice
            )
            response.send("Buy DLC success!")
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  checkBuyDLC()
})

//analysis report 5 (user role)
app.get("/history", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (roleSession != "user") {
    //this role not user role -> can't view
    response.render("login", { user: true })
  } else {
    const userBuyHistory = async () => {
      try {
        var total = await Transaction.aggregate([
          { $match: { username: usernameSession } },
          {
            $group: {
              _id: "$username",
              sumtotal: { $sum: "$total" },
            },
          },
        ])
        total = total[0].sumtotal //total price that user spend for this website
        var doc = await Transaction.find({ username: usernameSession }) //data is array of data in Transaction schema that eq w/ usernameSession
        response.render("history_user", {
          data: doc,
          sumtotal: total,
          username: usernameSession,
        })
      } catch (err) {
        console.log(err)
      }
    }
    userBuyHistory()
  }
})

app.all("/search", (request, response) => {
  var usernameSession = request.session.username
  var roleSession = request.session.role
  if (request.method == "GET") {
    response.render("search", { username: usernameSession, role: roleSession })
  } else if (request.method == "POST") {
    var gamename = request.body.searchGame
    Game.find({
      name: { $regex: gamename, $options: "i" },
    }).exec((err, doc) => {
      var count = doc.length
      response.render("search", {
        data: doc,
        username: usernameSession,
        role: roleSession,
        keyword: gamename,
        count: count,
      })
    })
  }
})

app.all("/admin-manage", (request, response) => {
  var roleSession = request.session.role
  if (roleSession != "admin") {
    response.render("login", { admin: true })
  } else {
    const getAllAccount = async () => {
      var allUserAccount = await User.find({}) //array of user account data
      var allPublisherAccount = await Publisher.find({}) //array of publisher data
      console.log("1305")
      console.log(allUserAccount)
      console.log("1307")
      console.log(allPublisherAccount)
    } //end of getAllAccount
    getAllAccount()
  }
})

app.listen(3000, () => {
  console.log("Server started at : http://localhost:3000")
})

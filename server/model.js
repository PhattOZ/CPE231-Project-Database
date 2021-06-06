const mongoose = require("mongoose")
mongoose
  .connect(
    "mongodb+srv://62070501070:Sorawong1@projectdb.kaxvb.mongodb.net/project?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch((err) => console.log(err))
  .then(() => console.log("Connected to MongoDB..."))

const userSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  fName: { type: String, require: true },
  lName: { type: String, require: true },
  gender: String,
  dob: String,
  email: String,
  tel: String,
  ownedItem: [
    {
      gamename: String,
      dlcname: [String],
    },
  ],
  friends: Array,
  group: Array,
})
const User = mongoose.model("User", userSchema)

const supportSchema = new mongoose.Schema({
  username: { type: String, require: true },
  email: String,
  tel: String,
  comment: String,
  timestamp: { type: Date, default: Date.now },
})
const support = mongoose.model("support", supportSchema)

const publisherSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  publisherName: { type: String, require: true },
  email: String,
  tel: String,
  added_game: [
    {
      name: String,
      image: String,
      date: String,
    },
  ],
  added_dlc: [
    {
      gamename: String,
      dlcname: String,
      image: String,
      date: String,
    },
  ],
})
const Publisher = mongoose.model("Publisher", publisherSchema)

// var data = {
//   username: "publisher8",
//   password: "1234",
//   publisherName: "Erom Inc.",
//   email: "Eromo@hotmail.com",
//   tel: "09040896278",
// }
// Publisher.create(data)

const adminSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
})
const Admin = mongoose.model("Admin", adminSchema)

// var data = {
//   username: "admin1",
//   password: "1234",
// }
// Admin.create(data)

const accountRoleSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  role: String,
})
const AccountRole = mongoose.model("AccountRole", accountRoleSchema)

// var roleData = {
//   username: "publisher8",
//   role: "publisher",
// }
// AccountRole.create(roleData)

const gameSchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  description: String,
  systemReq: {
    os: String,
    cpu: String,
    ram: String,
    gpu: String,
    hdd: String,
  },
  category: Array,
  publisherName: String,
  developerName: String,
  releaseDate: String,
  price: { type: Number, require: true },
  downloaded: Number,
  image: String,
  dlc: [
    {
      dlcname: String,
      dlcdescription: String,
      publisherName: String,
      developerName: String,
      releaseDate: String,
      price: { type: Number, require: true },
      downloaded: Number,
      image: String,
    },
  ],
})
const Game = mongoose.model("Game", gameSchema)

const transactionSchema = mongoose.Schema({
  username: String,
  buydate: String,
  buytime: String,
  game: String,
  dlc: [String],
  total: Number,
})
const Transaction = mongoose.model("Transaction", transactionSchema)

const groupSchema = new mongoose.Schema({
  name: { type: String, require: true },
  member: Array,
})
const Group = mongoose.model("Group", groupSchema)

module.exports = {
  User,
  Publisher,
  AccountRole,
  Game,
  Transaction,
  Group,
  support,
  Admin,
}

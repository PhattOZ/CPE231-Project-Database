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
  gender: { type: String, require: true },
  dob: String,
  email: String,
  tel: String,
  useritem: {
    game: Array,
    dlc: Array,
  },
  transaction: Array,
  friends: Array,
  group: Array,
})
const User = mongoose.model("User", userSchema)

const publisherSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  publisherName: { type: String, require: true },
  email: String,
  tel: String,
  added_game: [
    {
      name: String,
      date: String,
    },
  ],
  added_dlc: Array,
})
const Publisher = mongoose.model("Publisher", publisherSchema)

// var data = {
//   username: "publisher1",
//   password: "1234",
//   publisherName: "Sorawong Inc.",
//   email: "Sorawong1@hotmail.com",
//   tel: "0954975790",
// }
// Publisher.create(data)

const gameSchema = new mongoose.Schema({
  name: { type: String, require: true },
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
})
const Game = mongoose.model("Game", gameSchema)

const dlcSchema = mongoose.Schema({
  name: { type: String, require: true },
  gameName: { type: String, require: true },
  publisherName: String,
  developerName: String,
  releaseDate: Date,
  price: { type: Number, require: true },
  sales: { type: Number, require: true },
  downloaded: { type: Number, require: true },
})
const DLC = mongoose.model("DLC", dlcSchema)

const reviewSchema = mongoose.Schema({
  username: { type: String, require: true },
  gameName: { type: String, require: true },
  rating: { type: Number, require: true },
  description: String,
})
const Review = mongoose.model("Review", reviewSchema)

const transactionSchema = mongoose.Schema({
  transactionNo: { type: String, require: true },
  username: { type: String, require: true },
  fName: { type: String, require: true },
  lName: { type: String, require: true },
  timestamp: Date,
  address: String,
  fullPrice: Number,
  discount: Number,
  total: Number,
})
const Transaction = mongoose.model("Transaction", transactionSchema)

const promotionSchema = mongoose.Schema({
  code: { type: String, require: true },
  name: String,
  startTime: Date,
  endTime: Date,
  discount: { type: Number, require: true },
})
const Promotion = mongoose.model("Promotion", promotionSchema)

const groupSchema = new mongoose.Schema({
  name: { type: String, require: true },
  member: Array,
})
const Group = mongoose.model("Group", groupSchema)

// var data = {
//   username: "user1",
//   password: "1234",
//   fName: "Sorawong",
//   lName: "Leardmongkonrut",
//   gender: "Male",
//   dob: new Date(2000, 7, 25),
//   email: "Sorawong1@hotmail.com",
//   tel: "0954975790",
// }
// User.create(data)

// var date = new Date()
// var day = date.toLocaleDateString() //get current dd/mm/yy as string
// var data = {
//   name: "Street Fighter V",
//   description:
//     'Street Fighter V carries on the 2D fighting gameplay of its predecessors, in which two fighters use a variety of attacks and special abilities to knock out their opponent. The game features the EX gauge introduced in Street Fighter III, which builds as the player lands attacks and can be used to either power up special moves or perform super combos known as Critical Arts, although the Focus Attacks from the previous game have been removed. New to this game is the "V-Gauge", which builds as the player receives attacks and adds four new techniques: V-Skills, V-Reversals, V-Triggers, and V-Shifts. V-Skills are special attacks unique to each fighter',
//   systemReq: `OS: Windows 7 64-bit.
//   CPU: Intel Core i3-4160 @ 3.60GHz.
//   RAM: 6GB
//   GPU: NVIDIA® GeForce® GTX 480, GTX 570, GTX 670, or better.
//   HARD DRIVE: 40GB
//   `,
//   category: "Action",
//   publisherName: "Capcom",
//   developerName: "Capcom",
//   releaseDate: day,
//   price: 270,
//   downloaded: 5854,
//   image: "street fighter v.jpg",
// }
// Game.create(data)

module.exports = {
  User,
  Publisher,
  Game,
  DLC,
  Review,
  Transaction,
  Promotion,
  Group,
}

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
//   username: "publisher3",
//   password: "1234",
//   publisherName: "AZ Inc.",
//   email: "AAA@hotmail.com",
//   tel: "0123456789",
// }
// Publisher.create(data)

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

module.exports = {
  User,
  Publisher,
  Game,
  Review,
  Transaction,
  Promotion,
  Group,
}

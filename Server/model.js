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
  username: { type: String, require: true },
  password: { type: String, require: true },
  fName: { type: String, require: true },
  lName: { type: String, require: true },
  gender: { type: String, require: true },
  dob: Date,
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

const gameSchema = new mongoose.Schema({
  name: { type: String, require: true },
  description: String,
  systemReq: String,
  category: String,
  dlc: Array,
  publisherName: String,
  developerName: String,
  releaseDate: Date,
  price: { type: Number, require: true },
  sales: { type: Number, require: true },
  downloaded: { type: Number, require: true },
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

module.exports = User

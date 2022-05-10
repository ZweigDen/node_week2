const mongoose = require("mongoose");
// schema 開始
const roomSchema = new mongoose.Schema(
    {
      name: String,
      price: {
        type: Number,
        required: [true, "價格必填"],
      },
      rating: Number,
      create: {
          type:Date,
          default: Date.now,
          select:false
      }
    },
    {
        versionKey: false,
    }
  );
  
  const Room = mongoose.model("room", roomSchema);
  // schema 結束

  module.exports = Room;
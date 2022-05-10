const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Room = require("./models/room");
const errorHandle = require("./errorHandle");
const validatePost = require("./validatePost");

dotenv.config({path:"./config.env"});
const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
)

// 連結資料庫
mongoose
  .connect(DB)
  .then(() => {
    console.log("連線成功");
  })
  .catch((err) => {
    console.log(err);
  });

// const testRoom = new Room({
//   name: "貓貓房",
//   price: 888,
// });
// testRoom
//   .save()
//   .then(() => {
//     console.log("成功嚕");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const requireListen = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url == "/rooms" && req.method == "GET") {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms,
      })
    );
    res.end();
  } else if (req.url == "/rooms" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            room: newRoom,
          })
        );
        res.end();
      } catch {
        errorHandle(res)
      }
    });
  } else if (req.url == "/rooms" && req.method == "DELETE") {
    const rooms = await Room.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms,
      })
    );
    res.end();
  } else if (req.url.startsWith("/rooms/") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    const index = (await Room.find()).findIndex(
      (elements) => elements._id == id
    );
    if (index !== -1) {
      await Room.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
      }));
      res.end();
    } else {
        errorHandle(res)
    }
  } else if (req.url.startsWith("/rooms/") && req.method == "PATCH") {
      req.on("end", async()=> {
          try{
            const id = req.url.split('/').pop();
            const data = JSON.parse(body);
            const validateResult = validatePost(data);
            if(!validateResult) {
                const updateRoom = await Room.findByIdAndUpdate(id, data);
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "room":updateRoom
                }));
                res.end();
            } else {
                errorHandle(res);
            }
          } catch {
            errorHandle(res);
          }
      })
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網路路由",
      })
    );
    res.end();
  }
};

const server = http.createServer(requireListen);
server.listen(process.env.PORT);

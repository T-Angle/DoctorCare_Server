const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api.json");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(fileUpload());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/uploads/doctor/profiles", express.static("uploads/doctor/profiles/"));
app.use(
  "/uploads/patient/profiles",
  express.static("uploads/patient/profiles/")
);

// Main Routes
const authRoute = require("./api/routes/auth");
const doctorRoute = require("./api/routes/doctor");
const patientRoute = require("./api/routes/patient");
const chatRoute = require("./api/routes/chat");
const adminRoute = require("./api/routes/admin");
const clientRoute = require("./api/routes/client");

// const uploadRouter = require('./routes/cloudinary-upload');

// app.use('/uploads', uploadRouter);

// API URL's
app.use("/api/v1/auth", authRoute); //
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/patient", patientRoute);
// app.use('/api/v1/chat', chatRoute)
app.use("/api/v1/admin", adminRoute); //
app.use("/api/v1/client", clientRoute);

app.get("/", (req, res) => {
  res.send("Hello I am node.js application");
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection : " + err);
    }
  }
);
// App Port
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on ${port} port`);
});

const io = require("socket.io")(server, {
  cors: {
    orgin: "*",
    methods: ["GET", "POST"],
  },
});

//  <doctorId, session> map hang doi benh nhan cua cac bac si
// <appointment id, socket> danh sach cac client benh nhan connect toi socket server

const sessionMap = new Map();
const clientMap = new Map();

const onConnection = (socket) => {
  console.log(`new user connected, new socket id = ${socket.id}`);

  socket.on("enter_pool", (appId) => {
    clientMap.set(appId, socket.id);
    console.log("updated client map now: ", clientMap);
  });
};

io.on("connection", onConnection);



const appSocket = require('./api/routes/socket')
app.use('/api/v1/appointment-app', appSocket)


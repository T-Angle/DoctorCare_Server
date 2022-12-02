const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


const app = express()
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({origin: '*'}))
app.use(fileUpload())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use('/uploads/doctor/profiles', express.static('uploads/doctor/profiles/'))
app.use('/uploads/patient/profiles', express.static('uploads/patient/profiles/'))

// Main Routes
const authRoute = require('./api/routes/auth')
const doctorRoute = require('./api/routes/doctor')
const patientRoute = require('./api/routes/patient')
const chatRoute = require('./api/routes/chat')
const adminRoute = require('./api/routes/admin')
const clientRoute = require('./api/routes/client')


// API URL's
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/doctor', doctorRoute)
app.use('/api/v1/patient', patientRoute)
app.use('/api/v1/chat', chatRoute)
app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/client', clientRoute)


// ------------chat server-------------------//
// config chat server
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    orgin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

//  listen to client for msg
io.on('connection', (socket) => {
  console.log(`new user connected, new socket id = ${socket.id}`)

  socket.on('send_message', (data) => {
    console.log(data)
    socket.broadcast.emit('receive_message', data)
  })
})



// -------------api goi appointment data ---------------//
const path = require('path');
// import { Blob } from 'buffer'

const Appointment = require('./models/Appointment')
const Doctor = require('./models/Doctor')

// lay thong in cuoc hen
app.get('/api/v1/appointment-app/:id', (req, res) => {
  const appId = req.params.id
  console.log(appId)
  Appointment.findById(appId, (err, app) => {
    if (err) console.error(err);
    res.send(app)
  })
})

// lay thong tin bac si cua cuoc hen
app.get('/api/v1/appointment-app/:id/doctor', (req, res) => {
  const appId = req.params.id
  console.log(appId)
  Appointment.findById(appId, async (err, app) => {
    if (err) console.error(err);
    console.log(app.doctor)
    const doctorId = app.doctor
    const doctor = await Doctor.findById(doctorId, { name: 1, role: 1, college: 1, image: 1 })
    res.send(doctor)
  })
})
// lay hinh avatar cua bac si
app.get('/api/v1/appointment-app/doctor/:doctorid/img', async (req, res) => {
  const doctorId = req.params.doctorid
  console.log(doctorId)
  const data = await Doctor.findById(doctorId, { image: 1 })
  const imgURL = data.image
  console.log(imgURL)
  // const imgFile = new Blob(path.resolve(imgURL), {type: 'image/png'})
  res.sendFile(path.resolve('uploads/doctor/profiles/' + imgURL))
})

app.get('/', (req, res) => {
    res.send("Hello I am node.js application")
})


mongoose.connect(
 "mongodb+srv://PomanJr:PomanJr@cluster0.cwqxjni.mongodb.net/DoctorApp",
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
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`App running on ${port} port`)
})

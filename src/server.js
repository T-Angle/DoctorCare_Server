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
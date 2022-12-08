const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')
const dotenv  = require ("dotenv");

dotenv.config();


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./api.json');


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
// const chatRoute = require('./api/routes/chat')
const adminRoute = require('./api/routes/admin')
const clientRoute = require('./api/routes/client')

// API URL's
app.use('/api/v1/auth', authRoute) //
app.use('/api/v1/doctor', doctorRoute)
app.use('/api/v1/patient', patientRoute)
// app.use('/api/v1/chat', chatRoute)
app.use('/api/v1/admin', adminRoute) //
app.use('/api/v1/client', clientRoute)



app.get('/', (req, res) => {
    res.send("Hello I am node.js application")
})


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
const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  console.log(`App running on ${port} port`)
})

// #region app dem so
// -----------------------------App dem so thu tu gap bac si
const io = require('socket.io')(server, {
  cors: {
    orgin: '*',
    methods: ['GET', 'POST']
  }
})

//  <doctorId, session> map hang doi benh nhan cua cac bac si
const sessionMap = new Map()
// <appointment id, socket> danh sach cac client benh nhan connect toi socket server
const clientMap = new Map()


const onConnection = (socket) => {
  console.log(`new user connected, new socket id = ${socket.id}`)

  socket.on('enter_pool', (appId) => {
    clientMap.set(appId, socket.id)
    console.log('updated client map now: ', clientMap)
  })
}

io.on('connection', onConnection)

// api lay ra queue cua 1 bac si
app.get('/api/v1/appointment-app/:doctorid/queue', (req, res) => {
  const doctorId = req.params.doctorid
  console.log(doctorId)
  const session = sessionMap.get(doctorId)
  console.log(session)
  res.send(JSON.stringify(session))
})



// -------------api goi appointment data ---------------//

const patientSessionMap = new Map() // k=appid, v=sessoin obj

const patientRecordMap = new Map() // k=appid, v=record obj

const addTestContent = (appId, doctorId, content) => {
  console.log('received appid', Number(appId))
  console.log( typeof (Number(appId)))
  console.log(patientRecordMap)
  console.log(patientRecordMap.has(Number(appId)))
  const record = patientRecordMap.get(Number(appId))
  console.log(record)
  const testList = record.testList
  const targeTest = testList.find(test => test.doctorid === doctorId)
  console.log(targeTest)
  if (!targeTest) {
    console.log('not found test')
    return false
  }
  if (targeTest.finish == true) {
    console.log('test finished')

    return false
  }
  targeTest.content = content
  targeTest.finsh = true
  console.log('record map now', patientRecordMap)
  return true
}
const createPatientRecord = (appId, testList) => {
  if (!patientRecordMap.has(appId)) {
    console.log(appId, ' create new patient record')
    const newRecord = {
      total: testList.length,
      testList: testList,
      drugList: []
    }
    patientRecordMap.set(appId, newRecord)
    console.log('record map now ', patientRecordMap)
    return true
  }
  console.log(appId, ' already has record')
  return false
}


const createPatientSession = (appId, order, currOrder) => {
  if (!patientSessionMap.has(appId)) {
    console.log(appId, ' create new patient session')
    const newSession = {
      step: 1,
      order: order,
      currOrder: currOrder,
      isQueue: false
    }
    patientSessionMap.set(appId, newSession)
    // const patientSession = patientSessionMap.get(appId)
    console.log(patientSessionMap)
    return
  }
  const patientSession = patientSessionMap.get(appId)
  patientSession.order = order
  patientSession.currOrder = currOrder
  patientSessionMap.set(appId, patientSession)
  console.log(patientSessionMap)

}

const updatePatientSession = (appId, newCurrOrder) => {
  const patientSession = patientSessionMap.get(appId)
  patientSession.currOrder = newCurrOrder
  patientSessionMap.set(appId, patientSession)
  console.log(patientSessionMap)
}

const enqueuePatient = (appId, doctorId, sessionMap, clientMap, io) => {
  // test dang ky event
  console.log('received event argument for enqueue: ', appId, doctorId)
  if (!appId || !doctorId) { console.log('either event argument not found'); return false }
  // test Map truyen dung
  if (!sessionMap || !clientMap) { console.log('either map not found'); return false}
  // lay ra socketId cua app
  const patientSocketId = clientMap.get(appId)
  // kiem tra appId co trong pool
  if (!patientSocketId) { console.log(`appId ${appId} not connected`); return false }
  // lay ra session cua doctor
  const doctorSession = sessionMap.get(doctorId)

  // kiem tra ton tai session
  // session da tao
  if (doctorSession) {

    // p1
    // tao stt moi cho benh nhan
    const sessionQueue = doctorSession.queue
    // kiem tra appId da co trong queue
    let flag = true
    sessionQueue.map((patient) => {

      if (patient.appId === appId) { flag = false; return false }
    })
    if (!flag) { console.log(`appId ${appId} already in queue`); return false }
    const lastApp = sessionQueue[sessionQueue.length - 1]
    const lastOrder = lastApp ? lastApp.order : false
    const newOrder = lastOrder ? lastOrder + 1 : doctorSession.currOrder + 1
    // them ma cuoc hen & stt cua benh nhan moi vao queue
    sessionQueue.push({ appId: appId, order: newOrder })
    doctorSession.total++
    console.log(`enqueue app ${appId} , order# = ${newOrder}`)
    console.log('Session map now is ', sessionMap)

    // p2
    // gui tin update stt moi va stt hien tai cho benh nhan
    // notifyNewPatient(patientSocketId, newOrder, doctorSession.currOrder, io)
    return {currOrder: doctorSession.currOrder, order: newOrder}
  }
  // session chua tao
  // p1
  // tao session moi cho bac si
  const newSession = {
    total: 1,
    currOrder: 0,
    currAppID: '',
    queue: [{ appId: appId, order: 1 }]
  }
  sessionMap.set(doctorId, newSession)
  console.log(`enqueue app ${appId} , order# = 1`)
  console.log('Session map now is ', sessionMap)
  // p2
  // gui tin update stt moi va stt hien tai cho benh nhan
  // notifyNewPatient(patientSocketId, 1, 0, io)
  return { currOrder: 0, order: 1 }
}



const dequeuePatient = (doctorId, sessionMap, clientMap, io) => {
  // -------------------------------Check--------------------------------------
  // test dang ky event
  console.log('received event argument for next order: ', doctorId)
  if (!doctorId) { console.log('either event argument not found'); return false}
  // test Map truyen dung
  if (!sessionMap || !clientMap) { console.log('either map not found'); return false}
  // lay ra session cua doctor
  const doctorSession = sessionMap.get(doctorId)
  // kiem tra ton tai session
  // session chua tao
  if (!doctorSession) { console.log(`session of ${doctorId} not created yet`); return false}
  // lay ra queue
  const doctorQueue = doctorSession.queue
  // kiem tra queue ro~ng
  if (doctorQueue.length === 0) { console.log('empty queue!'); return false}
  // ------------------------------MAIN----------------------------------
  doctorSession.total--
  // doctorSession.currOrder++

  // pop 1 benh nhan ra khoi queue
  const removedPatient = doctorSession.queue.shift()
  // them benh nhan vao field currAppID
  doctorSession.currAppID = removedPatient.appId
  // // xoa appId cua benh nhan ra khoi clientMap
  // clientMap.delete(removedPatient.appId)
  console.log(`dequeue app ${removedPatient.appId} , current order# = ${doctorSession.currOrder}`)
  console.log('Session map now is ', sessionMap)
  // // thong bao benh nhan da hoan thanh queue
  // const patientSocketId = clientMap.get(removedPatient.appId)
  // io.to(patientSocketId).emit('queue_finished', true)
  return doctorSession.currOrder
}


// them bn vao queue cua session
app.post('/api/v1/appointment-app/doctor/enqueue', (req, res) => {
  const data = req.body
  console.log(`enqueue ${data.appid} from ${data.doctorid}`)
  const sessionOrders = enqueuePatient(data.appid, data.doctorid, sessionMap, clientMap, io)
  if (!sessionOrders) {
    console.log(`appId ${data.appid} already in queue`)
    res.sendStatus(404)
    return }
  createPatientSession(data.appid, sessionOrders.order, sessionOrders.currOrder)
  // update patient sesstion status
  const patientSession = patientSessionMap.get(data.appid)
  patientSession.isQueue = true
  const patientSocketId = clientMap.get(data.appid)
  io.to(patientSocketId).emit('update_session')
  res.send(data)
})

app.post('/api/v1/appointment-app/doctor/next', (req, res) => {
  const data = req.body
  console.log(`next patient in queue of ${data.doctorid}`)
  // nextOrder(data.doctorid, sessionMap, clientMap, io)
  const doctorSession = sessionMap.get(data.doctorid)
  const doctorQueue = doctorSession.queue
  if (doctorSession.currOrder !== doctorQueue[0].order) {
    doctorSession.currOrder = doctorQueue[0].order
  }
  if (doctorQueue.length === 0) {
    console.log('empty queue')
    res.sendStatus(404)
    return
  }
  doctorQueue.map((patient) => {
    updatePatientSession(patient.appId, doctorQueue[0].order)
    const patientSocketId = clientMap.get(patient.appId)
    io.to(patientSocketId).emit('update_session')
  })
  res.sendStatus(200)
})

app.post('/api/v1/appointment-app/doctor/dequeue', (req, res) => {
  const data = req.body
  console.log(`dequeue patient in queue of ${data.doctorid}`)
  const currOrder = dequeuePatient(data.doctorid, sessionMap, clientMap, io)
  if (!currOrder) {
    console.log('queue empty')
    res.sendStatus(404)
    return }
  console.log('curr odrder', currOrder)
  const doctorSession = sessionMap.get(data.doctorid)
  // update session cua benh nhan bi kick
  const currProcessingAppId = doctorSession.currAppID
  const currProcessingSocketId = clientMap.get(currProcessingAppId)
  // update patient sesstion status
  const patientSession = patientSessionMap.get(currProcessingAppId)
  patientSession.isQueue = false
  // updatePatientSession(currProcessingAppId, currOrder)
  io.to(currProcessingSocketId).emit('update_session')
  // update session cac benh nhan con lai
  const doctorQueue = doctorSession.queue
  doctorQueue.map((patient) => {
    updatePatientSession(patient.appId, currOrder)
    const patientSocketId = clientMap.get(patient.appId)
    io.to(patientSocketId).emit('update_session')
  })
  res.send(data)
})

// lay thong tin session cua benh nhan
app.get('/api/v1/appointment-app/:appid/session', (req, res) => {
  const appId = req.params.appid
  console.log('get status of ', appId)
  const patientSession = patientSessionMap.get(appId)
  if (patientSession) res.send(patientSession)
  else res.sendStatus(404)
})
// lay thong tin session cua bac si
app.get('/api/v1/appointment-app/doctor/:doctorid/session', (req, res) => {
  const doctorId = req.params.doctorid
  console.log('get session of ', doctorId)
  const doctorSession = sessionMap.get(doctorId)
  if (doctorSession) res.send(doctorSession)
  else res.sendStatus(404)
})
// them danh sach xet nghiem vao record cua benh nhan
app.post('/api/v1/appointment-app/doctor/create-record', (req, res) => {
  const data = req.body
  console.log('create record from data ', data)
  const appId = data.appid
  const testList = data.testlist

  if (createPatientRecord(appId, testList)) {
    console.log('record created')
    res.sendStatus(200)
    const patientSocketId = clientMap.get(appId)
    io.to(patientSocketId).emit('update_record')
    return
  }
  res.sendStatus(404)
})

app.post('/api/v1/appointment-app/doctor/finish-test', (req, res) => {
  const data = req.body
  console.log('create test from data ', data)
  const appId = data.appid
  const doctorId = data.doctorid
  const content = data.content
  if (addTestContent(appId, doctorId, content))
  {
    console.log('add content ok')
    res.sendStatus(200)
    const patientSocketId = clientMap.get(appId)
    io.to(patientSocketId).emit('finish_test')
    return
  }
  res.sendStatus(404)
})
// #endregion

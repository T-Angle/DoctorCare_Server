// const Session = {
//   total: Number,
//   currOrder: Number,
//   queue: []
// }
// const sessionMap = new Map() //key = doctorID, value = session
// const Test = {
//   name: String,
//   doctorId: String,
//   room: String,
//   order: Number,
//   content: String,
//   status: "waiting" | "doing" | "finish"
// }
// const TestList = {
//   total: Number,
//   status: "doing" | "finish",
//   queue: [Test]
// }
// const testMap = new Map() //key = appId, value = testLỉst

const notifyNewPatient = (patientSocketId, newOrder, currOrder, io) => {
  io.to(patientSocketId).emit('update_patient_order', newOrder)
  // gui tin update stt hien tai (dang xu li)
  io.to(patientSocketId).emit('update_current_order', currOrder)
}

const enqueuePatient = (appId, doctorId, sessionMap, clientMap, io) => {
  // test dang ky event
  console.log('received event argument for enqueue: ', appId, doctorId)
  if (!appId || !doctorId) { console.log('either event argument not found'); return }
  // test Map truyen dung
  if (!sessionMap || !clientMap) { console.log('either map not found'); return }
  // lay ra socketId cua app
  const patientSocketId = clientMap.get(appId)
  // kiem tra appId co trong pool
  if (!patientSocketId) { console.log(`appId ${appId} not connected`); return }
  // lay ra session cua doctor
  const doctorSession = sessionMap.get(doctorId)
  // kiem tra ton tai session
  // session da tao
  if (doctorSession) {
    // p1
    // tao stt moi cho benh nhan
    const sessionQueue = doctorSession.queue
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
    notifyNewPatient(patientSocketId, newOrder, doctorSession.currOrder, io)
    return newOrder
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
  notifyNewPatient(patientSocketId, 1, 0, io)
  return 1
}

const nextOrder = (doctorId, sessionMap, clientMap, io) => {
  // -------------------------------Check--------------------------------------
  // test dang ky event
  console.log('received event argument for next order: ', doctorId)
  if (!doctorId) { console.log('either event argument not found'); return }
  // test Map truyen dung
  if (!sessionMap || !clientMap) { console.log('either map not found'); return }
  // lay ra session cua doctor
  const doctorSession = sessionMap.get(doctorId)
  // kiem tra ton tai session
  // session chua tao
  if (!doctorSession) { console.log(`session of ${doctorId} not created yet`); return }
  // lay ra queue
  const doctorQueue = doctorSession.queue
  // kiem tra queue ro~ng
  if (doctorQueue.length === 0) { console.log('empty queue!'); return }

  // ------------------------------MAIN----------------------------------
  // gui tin update stt hien tai cho tat cac client benh nhan trong session queue (bao gom benh nhan bi kick)
  doctorQueue.map((patient) => {
    const patientSocketId = clientMap.get(patient.appId)
    console.log('emitting update msg to client id: ', patientSocketId)
    io.to(patientSocketId).emit('update_current_order', doctorQueue[0].order)
  })
}

const dequeuePatient = (doctorId, sessionMap, clientMap, io) => {
  // -------------------------------Check--------------------------------------
  // test dang ky event
  console.log('received event argument for next order: ', doctorId)
  if (!doctorId) { console.log('either event argument not found'); return }
  // test Map truyen dung
  if (!sessionMap || !clientMap) { console.log('either map not found'); return }
  // lay ra session cua doctor
  const doctorSession = sessionMap.get(doctorId)
  // kiem tra ton tai session
  // session chua tao
  if (!doctorSession) { console.log(`session of ${doctorId} not created yet`); return }
  // lay ra queue
  const doctorQueue = doctorSession.queue
  // kiem tra queue ro~ng
  if (doctorQueue.length === 0) { console.log('empty queue!'); return }
  // ------------------------------MAIN----------------------------------
  doctorSession.total--
  doctorSession.currOrder++

  // pop 1 benh nhan ra khoi queue
  const removedPatient = doctorSession.queue.shift()
  // them benh nhan vao field currAppID
  doctorSession.currAppID = removedPatient.appId
  // // xoa appId cua benh nhan ra khoi clientMap
  // clientMap.delete(removedPatient.appId)
  console.log(`dequeue app ${removedPatient.appId} , current order# = ${doctorSession.currOrder}`)
  console.log('Session map now is ', sessionMap)
  // thong bao benh nhan da hoan thanh queue
  const patientSocketId = clientMap.get(removedPatient.appId)
  io.to(patientSocketId).emit('queue_finished', true)
}

const addPatientClient = (appId, socket, clientMap) => {
  clientMap.set(appId, socket.id)
  console.log('updated client map now: ', clientMap)
}

module.exports = (io, socket, sessionMap, clientMap) => {

  // dang ky nhan event tu client bac si
  socket.on('enqueue_app', (appId, doctorId) => { enqueuePatient(appId, doctorId, sessionMap, clientMap, io) })
  socket.on('next_app', (doctorId) => { nextOrder(doctorId, sessionMap, clientMap, io) })
  socket.on('dequeue_app', (doctorId) => { dequeuePatient(doctorId, sessionMap, clientMap, io) })
  socket.on('enter_pool', (appId) => { addPatientClient(appId, socket, clientMap) })
}

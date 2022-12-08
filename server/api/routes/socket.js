// // #region app dem so
// // -----------------------------App dem so thu tu gap bac si
//
// const express = require('express')
// const router = express.Router()
// const io = require('../../app')
// 
//
// const sessionMap = new Map();
// const clientMap = new Map();
//
// // api lay ra queue cua 1 bac si
// router.get('/:doctorid/queue', (req, res) => {
//   const doctorId = req.params.doctorid
//   console.log(doctorId)
//   const session = sessionMap.get(doctorId)
//   console.log(session)
//   res.send(JSON.stringify(session))
// })
//
//
//
//
// // -------------api goi appointment data ---------------//
//
// const patientSessionMap = new Map() // k=appid, v=sessoin obj
//
// const patientRecordMap = new Map() // k=appid, v=record obj
//
// const addTestContent = (appId, doctorId, content) => {
//   console.log('received appid', Number(appId))
//   console.log( typeof (Number(appId)))
//   console.log(patientRecordMap)
//   console.log(patientRecordMap.has(Number(appId)))
//   const record = patientRecordMap.get(Number(appId))
//   console.log(record)
//   const testList = record.testList
//   const targeTest = testList.find(test => test.doctorid === doctorId)
//   console.log(targeTest)
//   if (!targeTest) {
//     console.log('not found test')
//     return false
//   }
//   if (targeTest.finish == true) {
//     console.log('test finished')
//
//     return false
//   }
//   targeTest.content = content
//   targeTest.finsh = true
//   console.log('record map now', patientRecordMap)
//   return true
// }
// const createPatientRecord = (appId, testList) => {
//   if (!patientRecordMap.has(appId)) {
//     console.log(appId, ' create new patient record')
//     const newRecord = {
//       total: testList.length,
//       testList: testList,
//       drugList: []
//     }
//     patientRecordMap.set(appId, newRecord)
//     console.log('record map now ', patientRecordMap)
//     return true
//   }
//   console.log(appId, ' already has record')
//   return false
// }
//
//
// const createPatientSession = (appId, order, currOrder) => {
//   if (!patientSessionMap.has(appId)) {
//     console.log(appId, ' create new patient session')
//     const newSession = {
//       step: 1,
//       order: order,
//       currOrder: currOrder,
//       isQueue: false
//     }
//     patientSessionMap.set(appId, newSession)
//     // const patientSession = patientSessionMap.get(appId)
//     console.log(patientSessionMap)
//     return
//   }
//   const patientSession = patientSessionMap.get(appId)
//   patientSession.order = order
//   patientSession.currOrder = currOrder
//   patientSessionMap.set(appId, patientSession)
//   console.log(patientSessionMap)
//
// }
//
// const updatePatientSession = (appId, newCurrOrder) => {
//   const patientSession = patientSessionMap.get(appId)
//   patientSession.currOrder = newCurrOrder
//   patientSessionMap.set(appId, patientSession)
//   console.log(patientSessionMap)
// }
//
// const enqueuePatient = (appId, doctorId, sessionMap, clientMap, io) => {
//   // test dang ky event
//   console.log('received event argument for enqueue: ', appId, doctorId)
//   if (!appId || !doctorId) { console.log('either event argument not found'); return false }
//   // test Map truyen dung
//   if (!sessionMap || !clientMap) { console.log('either map not found'); return false}
//   // lay ra socketId cua app
//   const patientSocketId = clientMap.get(appId)
//   // kiem tra appId co trong pool
//   if (!patientSocketId) { console.log(`appId ${appId} not connected`); return false }
//   // lay ra session cua doctor
//   const doctorSession = sessionMap.get(doctorId)
//
//   // kiem tra ton tai session
//   // session da tao
//   if (doctorSession) {
//
//     // p1
//     // tao stt moi cho benh nhan
//     const sessionQueue = doctorSession.queue
//     // kiem tra appId da co trong queue
//     let flag = true
//     sessionQueue.map((patient) => {
//
//       if (patient.appId === appId) { flag = false; return false }
//     })
//     if (!flag) { console.log(`appId ${appId} already in queue`); return false }
//     const lastApp = sessionQueue[sessionQueue.length - 1]
//     const lastOrder = lastApp ? lastApp.order : false
//     const newOrder = lastOrder ? lastOrder + 1 : doctorSession.currOrder + 1
//     // them ma cuoc hen & stt cua benh nhan moi vao queue
//     sessionQueue.push({ appId: appId, order: newOrder })
//     doctorSession.total++
//     console.log(`enqueue app ${appId} , order# = ${newOrder}`)
//     console.log('Session map now is ', sessionMap)
//
//     // p2
//     // gui tin update stt moi va stt hien tai cho benh nhan
//     // notifyNewPatient(patientSocketId, newOrder, doctorSession.currOrder, io)
//     return {currOrder: doctorSession.currOrder, order: newOrder}
//   }
//   // session chua tao
//   // p1
//   // tao session moi cho bac si
//   const newSession = {
//     total: 1,
//     currOrder: 0,
//     currAppID: '',
//     queue: [{ appId: appId, order: 1 }]
//   }
//   sessionMap.set(doctorId, newSession)
//   console.log(`enqueue app ${appId} , order# = 1`)
//   console.log('Session map now is ', sessionMap)
//   // p2
//   // gui tin update stt moi va stt hien tai cho benh nhan
//   // notifyNewPatient(patientSocketId, 1, 0, io)
//   return { currOrder: 0, order: 1 }
// }
//
//
//
// const dequeuePatient = (doctorId, sessionMap, clientMap, io) => {
//   // -------------------------------Check--------------------------------------
//   // test dang ky event
//   console.log('received event argument for next order: ', doctorId)
//   if (!doctorId) { console.log('either event argument not found'); return false}
//   // test Map truyen dung
//   if (!sessionMap || !clientMap) { console.log('either map not found'); return false}
//   // lay ra session cua doctor
//   const doctorSession = sessionMap.get(doctorId)
//   // kiem tra ton tai session
//   // session chua tao
//   if (!doctorSession) { console.log(`session of ${doctorId} not created yet`); return false}
//   // lay ra queue
//   const doctorQueue = doctorSession.queue
//   // kiem tra queue ro~ng
//   if (doctorQueue.length === 0) { console.log('empty queue!'); return false}
//   // ------------------------------MAIN----------------------------------
//   doctorSession.total--
//   // doctorSession.currOrder++
//
//   // pop 1 benh nhan ra khoi queue
//   const removedPatient = doctorSession.queue.shift()
//   // them benh nhan vao field currAppID
//   doctorSession.currAppID = removedPatient.appId
//   // // xoa appId cua benh nhan ra khoi clientMap
//   // clientMap.delete(removedPatient.appId)
//   console.log(`dequeue app ${removedPatient.appId} , current order# = ${doctorSession.currOrder}`)
//   console.log('Session map now is ', sessionMap)
//   // // thong bao benh nhan da hoan thanh queue
//   // const patientSocketId = clientMap.get(removedPatient.appId)
//   // io.to(patientSocketId).emit('queue_finished', true)
//   return doctorSession.currOrder
// }
//
//
// // them bn vao queue cua session
// router.post('/doctor/enqueue', (req, res) => {
//   const data = req.body
//   console.log(`enqueue ${data.appid} from ${data.doctorid}`)
//   const sessionOrders = enqueuePatient(data.appid, data.doctorid, sessionMap, clientMap, io)
//   if (!sessionOrders) {
//     console.log(`appId ${data.appid} already in queue`)
//     res.sendStatus(404)
//     return }
//   createPatientSession(data.appid, sessionOrders.order, sessionOrders.currOrder)
//   // update patient sesstion status
//   const patientSession = patientSessionMap.get(data.appid)
//   patientSession.isQueue = true
//   console.log('patient session after enqueue', patientSession)
//   const patientSocketId = clientMap.get(data.appid)
//   io.to(patientSocketId).emit('update_session')
//   res.send(data)
// })
//
// router.post('/doctor/next', (req, res) => {
//   const data = req.body
//   console.log(`next patient in queue of ${data.doctorid}`)
//   // nextOrder(data.doctorid, sessionMap, clientMap, io)
//   const doctorSession = sessionMap.get(data.doctorid)
//   const doctorQueue = doctorSession.queue
//   if (doctorSession.currOrder !== doctorQueue[0].order) {
//     doctorSession.currOrder = doctorQueue[0].order
//   }
//   if (doctorQueue.length === 0) {
//     console.log('empty queue')
//     res.sendStatus(404)
//     return
//   }
//   doctorQueue.map((patient) => {
//     updatePatientSession(patient.appId, doctorQueue[0].order)
//     const patientSocketId = clientMap.get(patient.appId)
//     io.to(patientSocketId).emit('update_session')
//   })
//   res.sendStatus(200)
// })
//
// router.post('/doctor/dequeue', (req, res) => {
//   const data = req.body
//   console.log(`dequeue patient in queue of ${data.doctorid}`)
//   const currOrder = dequeuePatient(data.doctorid, sessionMap, clientMap, io)
//   if (!currOrder) {
//     console.log('queue empty')
//     res.sendStatus(404)
//     return }
//   console.log('curr odrder', currOrder)
//   const doctorSession = sessionMap.get(data.doctorid)
//   // update session cua benh nhan bi kick
//   const currProcessingAppId = doctorSession.currAppID
//   const currProcessingSocketId = clientMap.get(currProcessingAppId)
//   // update patient sesstion status
//   const patientSession = patientSessionMap.get(currProcessingAppId)
//   patientSession.isQueue = false
//   // updatePatientSession(currProcessingAppId, currOrder)
//   io.to(currProcessingSocketId).emit('update_session')
//   // update session cac benh nhan con lai
//   const doctorQueue = doctorSession.queue
//   doctorQueue.map((patient) => {
//     updatePatientSession(patient.appId, currOrder)
//     const patientSocketId = clientMap.get(patient.appId)
//     io.to(patientSocketId).emit('update_session')
//   })
//   res.send(data)
// })
//
// // lay thong tin session cua benh nhan
// router.get('/:appid/session', (req, res) => {
//   const appId = req.params.appid
//   console.log('get status of ', appId)
//   const patientSession = patientSessionMap.get(appId)
//   if (patientSession) res.send(patientSession)
//   else res.sendStatus(404)
// })
// // lay thong tin session cua bac si
// router.get('/doctor/:doctorid/session', (req, res) => {
//   const doctorId = req.params.doctorid
//   console.log('get session of ', doctorId)
//   const doctorSession = sessionMap.get(doctorId)
//   if (doctorSession) res.send(doctorSession)
//   else res.sendStatus(404)
// })
// // them danh sach xet nghiem vao record cua benh nhan
// router.post('/doctor/create-record', (req, res) => {
//   const data = req.body
//   console.log('create record from data ', data)
//   const appId = data.appid
//   const testList = data.testlist
//
//   if (createPatientRecord(appId, testList)) {
//     console.log('record created')
//     res.sendStatus(200)
//     const patientSocketId = clientMap.get(appId)
//     io.to(patientSocketId).emit('update_record')
//     return
//   }
//   res.sendStatus(404)
// })
//
// router.post('/doctor/finish-test', (req, res) => {
//   const data = req.body
//   console.log('create test from data ', data)
//   const appId = data.appid
//   const doctorId = data.doctorid
//   const content = data.content
//   if (addTestContent(appId, doctorId, content))
//   {
//     console.log('add content ok')
//     res.sendStatus(200)
//     const patientSocketId = clientMap.get(appId)
//     io.to(patientSocketId).emit('finish_test')
//     return
//   }
//   res.sendStatus(404)
// })
// // #endregion
//
// module.exports = router

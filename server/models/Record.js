const { Schema, model } = require('mongoose')

const recordSchema = new Schema({
  currentOrder: Number,
  totalOrder: Number,
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  timestamps: true,
  queue: [
    {
      appointmentId: String,
      order: Number
    }
  ]
})
const Record = model('Record', recordSchema);

module.exports = Record;

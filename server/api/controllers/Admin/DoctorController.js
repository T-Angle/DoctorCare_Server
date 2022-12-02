const Doctor = require('../../../models/Doctor')
const Admin = require('../../../models/Admin')
const hostURL = require('../../utils/url')
const checkId = require('../../middleware/CheckId')

// Index of doctors
const Index = async (req, res, next) => {
    try {
        let doctors = await Doctor.find({}, { name: 1, specialist: 1, image: 1, isApproved: 1 }).exec()

        if (!doctors.length)
            return res.status(404).json({ status: false, message: 'Doctors not found' })

        // Modifiy image path
        await doctors.map(doctor => {
            if (doctor.image) {
                doctor.image = hostURL(req) + 'uploads/doctor/profiles/' + doctor.image
            } else {
                doctor.image = null
            }
        })

        // res.status(200).json({
        //     status: true,
        //     doctors
        // })
        res.status(200).json(doctors)

    } catch (error) {
        if (error) next(error)
    }
}


const DeleteAdmin  = async (req, res, next) => {
    const id = req.params.id
    try {
        let admin = await Admin.findByIdAndRemove(id).exec()
        res.status(200).json({success: true})

    } catch (error) {
        if (error) next(error)
    }
}

const UpdateInfoAdmin = async (req, res, next) => {
    try {
        const id =  req.params.id;
        const updateObject  =  req.body;
        await Admin.updateOne(
            { _id: id },
            { $set: updateObject },
        )
            .exec()

        res.status(201).json({ status: true, message: `Successfully` })

    } catch (error) {
        if (error) next(error)
    }
}

const DeleteDoctor  = async (req, res, next) => {
    const id = req.params.id
    try {
        let doctor = await Doctor.findByIdAndRemove(id).exec()
        res.status(200).json({success: true})

    } catch (error) {
        if (error) next(error)
    }
}

const UpdateInfoDoctor = async (req, res, next) => {
    try {
        const id =  req.params.id;
        const updateObject  =  req.body;
        await Doctor.updateOne(
            { _id: id },
            { $set: updateObject },
        )
            .exec()

        res.status(201).json({ status: true, message: `Successfully` })

    } catch (error) {
        if (error) next(error)
    }
}
// Show individual doctor
const Show = async (req, res, next) => {
    try {
        const { id } = req.params
        await checkId(id)

        // Find doctor
        let doctor = await Doctor.findById({ _id: id }, { access_token: 0, password: 0, role: 0 })
            .populate('councilHour', 'schedule')
            .exec()

        if (!doctor) return res.status(404).json({ status: false, message: 'Doctor not found' })

        for (const property in doctor) {
            if (property === "image")
                doctor[property] = hostURL(req) + 'uploads/doctor/profiles/' + doctor[property]
        }
        return res.status(200).json({ status: true, doctor })

    } catch (error) {
        if (error) {
            console.log(error);
            next(error)
        }
    }
}


// Update account status
const UpdateStatus = async (req, res, next) => {
    try {
        const { id, status } = req.params
        await checkId(id)

        await Doctor.findByIdAndUpdate(
            { _id: id },
            { $set: { isApproved: status } },
            { new: true }
        )
            .exec()

        res.status(201).json({ status: true, message: `Successfully ${status}` })

    } catch (error) {
        if (error) next(error)
    }
}


module.exports = {
    Index,
    Show,
    UpdateStatus,
    DeleteAdmin,
    UpdateInfoAdmin,
    DeleteDoctor,
    UpdateInfoDoctor
}
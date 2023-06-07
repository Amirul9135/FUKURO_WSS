const express = require('express')
const router = express.Router()
const CPUReading = require("../../Model/CPUReading")

router.post("/cpu", function (req, res) {
    CPUReading.saveReadings(1,req.body).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

module.exports = router
const express = require('express')
const router = express.Router()
const CPUReading = require("../../Model/CPUReading") 
const oneSignal = require("../OneSignal")

router.post("/cpu", function (req, res) {
    CPUReading.saveReadings(1,req.body).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.get("/noti",async function(req,res){ 

    oneSignal.sendNotification(["1","2"],"hello from nodejs");
    return res.status(200);
})

module.exports = router
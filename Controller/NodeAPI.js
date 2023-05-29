const express = require('express')
const router = express.Router()
const Validator = require("./Middleware/Validator")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const Auth = require("./Middleware/Authenticate")
const Node_ = require("../Model/Node_")
const NodeDir = require("../Model/NodeDir")

router.post("/", [
    Auth.verifyJWT(),
    Validator.checkString("name"),
    Validator.checkString("description"),
    Validator.checkString("ipAddress"),
    Validator.checkString("passKey"),
    Validator.validate()
], async function (req, res) {
    var newNode = new Node_(req.body)
    var salt = await bcrypt.genSalt(10)
    var hashedKey = await bcrypt.hash(newNode.getPassKey(), salt)
    newNode.setPassKey(hashedKey)
    newNode.register().then(function (result) {
        var newDir = new NodeDir({
            nodeId: result.id,
            path: "/",
            label: "root"
        })
        newDir.register().then(function (result) {
            NodeDir.grantAccess(result.id, req.user.id).then(function (result) {
                return res.status(200).send({ message: "registered" })
            }).catch(function (err) {
                return res.status(500).send({ message: err.message })
            })

        }).catch(function (err) {
            return res.status(500).send({ message: err.message })

        })
    }).catch(function (err) {
        return res.status(500).send({ message: err.message })
    })
})

module.exports = router
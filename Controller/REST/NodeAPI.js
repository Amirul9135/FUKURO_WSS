const express = require('express')
const router = express.Router()
const Validator = require("../Middleware/Validator")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const Auth = require("../Middleware/Authenticate")
const Node_ = require("../../Model/Node_")
const NodeDir = require("../../Model/NodeDir")
const CPUReading = require('../../Model/CPUReading')


router.get("/access",[ 
    Auth.verifyJWT(),
    Validator.checkNumber("nodeId",{min:1}),
    Validator.checkString("passKey"),
    Validator.validate()
], function(req,res){
    console.log("here")
    Node_.findNode(req.body.nodeId, req.user.id).then(async function(result){
        
        var isMatch = await bcrypt.compare(req.body.passKey, result.passKey)
        result.passKey = null
        if(isMatch)
            return res.status(200).send(result)
        else
            return res.status(401).send({message:"no access"})

    }).catch(function(err){
        console.log(err)
        return res.status(500).send({message:err.message})
    })
}
)
router.post("/access",[ 
    (req,res,next)=> {
        console.log(req)
        console.log(req.body)
        next()
    },
    Auth.verifyJWT(),
    Validator.checkNumber("nodeId",{min:1}),
    Validator.checkString("passKey"),
    Validator.validate()
], function(req,res){
    console.log("here")
    Node_.findNode(req.body.nodeId, req.user.id).then(async function(result){
        
        var isMatch = await bcrypt.compare(req.body.passKey, result.passKey)
        result.passKey = null
        if(isMatch)
            return res.status(200).send(result)
        else
            return res.status(401).send({message:"no access"})

    }).catch(function(err){
        console.log(err)
        return res.status(500).send({message:err.message})
    })
}
)

router.post("/", [
    Auth.verifyJWT(),
    Validator.checkString("name"),
    Validator.checkString("description"),
    Validator.checkString("ipAddress"),
    Validator.checkString("passKey"),
    Validator.validate()
], async function (req, res) {
    var newNode = new Node_(req.body)
    var error
    newNode.setPassKey(await bcrypt.hash(newNode.getPassKey(), await bcrypt.genSalt(10)))
    newNode.setNodeId(await newNode.register().catch(function (err) {
        error = err
    }))
    if (!newNode.getNodeId())
        return res.status(500).send({ message: "failed to register node", details: error })

    var newDir = new NodeDir({
        nodeId: newNode.getNodeId(),
        path: "/",
        label: "root"
    })
    newDir.setPathId(await newDir.register().catch(function (err) {
        error = err
    }))
    if (!newDir.getPathId())
        return res.status(500).send({ message: "failed to register node default root directory", details: error })

    NodeDir.grantAccess(newDir.getPathId(), req.user.id).then(function (result) {
        return res.status(200).send({ message: "registered" })
    }).catch(function (err) {
        return res.status(500).send({ message: "failed to grant user access to default directory root" })
    })
})

router.get("/",
    Auth.verifyJWT(),
    function (req, res) {
        Node_.findUserAccessibleNodes(req.user.id).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send({ message: err.message })
        })
    }
)

router.get("/:nodeId",
    Auth.verifyJWT(),
    function (req, res) {
        Node_.findNode(req.params.nodeId, req.user.id).then(function (result) {
            result.passKey = null;
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send({ message: err.message })
        })

    })

/*metrics api*/
router.get("/cpu/:nodeId",[
    Auth.verifyJWT()
],
function(req,res){
    //must have path variable which is the nodeId
    if(!req.params.nodeId){
        return res.status(400).send({message: "invalid request"});
    } 
    var nodeId = parseInt(req.params.nodeId);
    if(isNaN(nodeId)){
        return res.status(400).send({message: "invalid request"})
    }
    CPUReading.getReadings(req.user.id,nodeId,req.query.p).then(function(result){
        console.log(result.length)
        return res.status(200).send(result)
    }).catch(function(err){
        return res.status(400).send({message: err.message})
    })



})

module.exports = router
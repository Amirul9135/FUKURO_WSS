const express = require("express");
const router = express.Router();
const Validator = require("../Middleware/Validator"); 
const Auth = require("../Middleware/Authenticate");
const UserConfig = require("../../Model/UserConfig")
const NodeConfig = require("../../Model/NodeConfig")
const FUKURO = require("../../FUKURO")

router.post("/noti/cpu/:nodeId",
Auth.verifyJWT()
,function(req,res){ 
    var nodeId = req.params.nodeId
    if(!nodeId){
        return res.status(400).send({ message: "invalid node id" })
    } 
    UserConfig.registerNotification(req.user.id,nodeId,FUKURO.CPU.ResourceId).then(function(result){
        return res.status(200).send()
    }).catch(function(err){
        return res.status(500).send({ message: err.message });
    }) 
})

router.delete("/noti/cpu/:nodeId",
Auth.verifyJWT()
,function(req,res){ 
    var nodeId = req.params.nodeId
    if(!nodeId){
        return res.status(400).send({ message: "invalid node id" })
    } 
    UserConfig.removeNotification(req.user.id,nodeId,FUKURO.CPU.ResourceId).then(function(result){
        return res.status(200).send()
    }).catch(function(err){
        return res.status(500).send({ message: err.message });
    }) 
})


router.post("/node/cpu/EI/:nodeId",
Auth.verifyJWT(),
function(req,res){
    var nodeId = req.params.nodeId
    if(!nodeId){
        return res.status(400).send({ message: "invalid node id" })
    } 
    var interval = 10;
    if (req.query.value) {
        interval = parseInt(req.query.value);
    }


    NodeConfig.updateConfig(nodeId,FUKURO.CPU.CONFIG.ExtractInterval,interval).then(function(result){
        return res.status(200).send();
    }).catch(function(err){
        return res.status(500).send({ message: err.message });
    })


})

router.post("/node/cpu/TH/:nodeId",
Auth.verifyJWT(),
function(req,res){
    var nodeId = req.params.nodeId
    if(!nodeId){
        return res.status(400).send({ message: "invalid node id" })
    } 
    var threshold = 100;
    if (req.query.value) {
        threshold = parseInt(req.query.value);
    }


    NodeConfig.updateConfig(nodeId,FUKURO.CPU.CONFIG.Threshold,threshold).then(function(result){
        return res.status(200).send();
    }).catch(function(err){
        return res.status(500).send({ message: err.message });
    })


})


router.post("/node/cpu/THCD/:nodeId",
Auth.verifyJWT(),
function(req,res){
    var nodeId = req.params.nodeId
    if(!nodeId){
        return res.status(400).send({ message: "invalid node id" })
    } 
    var tresholdCd = 300; // 5 minute
    if (req.query.value) {
        tresholdCd = parseInt(req.query.value);
    }


    NodeConfig.updateConfig(nodeId,FUKURO.CPU.CONFIG.ThresholdCooldown,tresholdCd).then(function(result){
        return res.status(200).send();
    }).catch(function(err){
        return res.status(500).send({ message: err.message });
    })


})

module.exports = router
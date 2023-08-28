//this class handles the request to manage resource related to node configurations
const RESTController = require("./RESTController") // rest controller base class
const CONFIG = require("../../FUKURO") //static class for config id reference
const NodeConfig = require("../../Model/NodeConfig")

class ConfigAPI extends RESTController {
    constructor() {
        super()
        //push metric config
        this._router.post("/interval/push/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.NODE.INTERVAL.push)])
        this._router.delete("/interval/push/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.INTERVAL.push)])

        this._router.post("/toggle/push/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.NODE.TOGGLE.push)])
        this._router.delete("/toggle/push/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.TOGGLE.push)])


        /**** CPU metric configuration routes ****/
        //alerts
        this._router.post("/alert/cpu/:nodeId", [this.#checkParam(), this.#enableNotification(CONFIG.NODE.ALERT.cpu)])
        this._router.delete("/alert/cpu/:nodeId", [this.#checkParam(), this.#disableNotification(CONFIG.NODE.ALERT.cpu)])

        //alerts values
        this._router.post("/alert/threshold/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.NODE.ALERT.THRESHOLD.cpu)])
        this._router.delete("/alert/threshold/cpu/:nodeId", [this.#checkParam(), this.#removeConfiguration(CONFIG.NODE.ALERT.THRESHOLD.cpu)])
        this._router.post("/alert/tick/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.NODE.ALERT.TICK.cpu)])
        this._router.delete("/alert/tick/cpu/:nodeId", [this.#checkParam(), this.#removeConfiguration(CONFIG.NODE.ALERT.TICK.cpu)])
        this._router.post("/alert/cooldown/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.NODE.ALERT.COOLDOWN.cpu)])
        this._router.delete("/alert/cooldown/cpu/:nodeId", [this.#checkParam(), this.#removeConfiguration(CONFIG.NODE.ALERT.COOLDOWN.cpu)])
 
 
        //interval
        this._router.post("/interval/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.NODE.INTERVAL.cpu)])
        this._router.delete("/interval/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.INTERVAL.cpu)])
        this._router.post("/interval/realtime/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.NODE.INTERVAL.REALTIME.cpu)])
        this._router.delete("/interval/realtime/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.INTERVAL.REALTIME.cpu)])

        //toggles
        this._router.post("/toggle/cpu/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.NODE.TOGGLE.cpu)])
        this._router.delete("/toggle/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.TOGGLE.cpu)])
        this._router.post("/toggle/realtime/cpu/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.NODE.TOGGLE.REALTIME.cpu)])
        this._router.delete("/toggle/realtime/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.NODE.TOGGLE.REALTIME.cpu)])
        /**** END CPU metric configuration routes END ****/
    }
    #updateConfiguration(configId){
        return (req,res)=>{
            NodeConfig.updateConfig(req.nodeId,configId,req.value,req.user.id).then(function(result){
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to  update configuration", error: "Node doesn't exist or user have no access"})
                } 
                return res.status(200).send()

            }).catch(function(error){
                
                return res.status(500).send({message:"Failed to update configuration", error: error.message})
            })

        }
    }
    #removeConfiguration(configId){
        return (req,res)=>{
            NodeConfig.removeConfig(req.nodeId,configId,req.user.id).then(function(result){
                
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to remove configuration", error: "Node doesn't exist or user have no access"})
                } 
                return res.status(200).send()
            }).catch(function(err){
                return res.status(500).send({message:"Failed to remove configuration", error: err.message})
            })

        }

    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #enableNotification(notId) {
        return (req, res) => {
            NodeConfig.enableNotification(req.nodeId,notId,req.user.id).then(function(result){
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to enable notification", error: "Node doesn't exist or user have no access"})
                } 
                return res.status(200).send()
            }).catch(function(err){
                if(err && err.errno == 1062){
                    return res.status(400).send({message:"Notification already enabled"})
                }
                return res.status(500).send({message:"Failed to enable notification", error: err.message})
            })
        }
    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #disableNotification(notId) {
        return (req, res) => {
            NodeConfig.disableNotification(req.nodeId,notId,req.user.id).then(function(result){
                return res.status(200).send()
            }).catch(function(err){
                return res.status(500).send({message:"Failed to disable notification", error: err.message})
            })

        }
    }

    #checkParam(checkValue = false) {
        return [
            this._auth.authRequest(),
            (req, res, next) => {
                if (req.params.nodeId) {
                    try {
                        req.nodeId = parseInt(req.params.nodeId)
                        if(checkValue){
                            if(!req.query.val){
                                return res.status(400).send({ message: "invalid value" });
                            }
                            req.value = req.query.val
                        }
                        return next()
                    } catch (error) {

                    }
                }
                return res.status(400).send({ message: "invalid node id in parameter" });
            }
        ]
    }


}
module.exports = ConfigAPI
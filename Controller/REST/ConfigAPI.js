//this class handles the request to manage resource related to node configurations
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const CONFIG = FUKURO.MONITORING
const DEFAULT = FUKURO.AGENT.DEFAULT
const NodeConfig = require("../../Model/NodeConfig")
const WsCache = require("../WebSocket/WsClientCache")

class ConfigAPI extends RESTController {
    #cache
    constructor() {
        super()
        this.#cache = WsCache
        //push metric config
        this._router.post("/interval/push/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.PUSH.Interval)])
        this._router.delete("/interval/push/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.PUSH.Interval)])

        this._router.post("/toggle/push/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.PUSH.Toggle)])
        this._router.delete("/toggle/push/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.PUSH.Toggle)])


        /**** CPU metric configuration routes ****/
        //alerts
        this._router.post("/alert/cpu/:nodeId", [this.#checkParam(true), this.#enableNotification(CONFIG.CPU.ALERT.Threshold)])
        this._router.delete("/alert/cpu/:nodeId", [this.#checkParam(), this.#disableNotification(CONFIG.CPU.ALERT.Threshold)])

        //alerts conditional values
        this._router.post("/alert/tick/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.CPU.ALERT.Tick)])
        this._router.delete("/alert/tick/cpu/:nodeId", [this.#checkParam(), this.#removeConfiguration(CONFIG.CPU.ALERT.Tick)])
        this._router.post("/alert/cooldown/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.CPU.ALERT.Cooldown)])
        this._router.delete("/alert/cooldown/cpu/:nodeId", [this.#checkParam(), this.#removeConfiguration(CONFIG.CPU.ALERT.Cooldown)])
 
 
        //interval
        this._router.post("/interval/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.CPU.INTERVAL.Extract)])
        this._router.delete("/interval/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.CPU.INTERVAL.Extract)])
        this._router.post("/interval/realtime/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.CPU.INTERVAL.Realtime)])
        this._router.delete("/interval/realtime/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.CPU.INTERVAL.Realtime)])

        //toggles
        this._router.post("/toggle/cpu/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.CPU.TOGGLE.Extract)])
        this._router.delete("/toggle/cpu/:nodeId",[this.#checkParam(),this.#removeConfiguration(CONFIG.CPU.TOGGLE.Extract)]) 
        /**** END CPU metric configuration routes END ****/
    }
    #updateConfiguration(configId){
        return (req,res)=>{
            NodeConfig.updateConfig(req.nodeId,configId,req.value,req.user.id).then((result)=>{
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to  update configuration", error: "Node doesn't exist or user have no access"})
                }   
                this.#notifyAgent(req.nodeId,configId,req.value) 
                return res.status(200).send()

            }).catch((error)=>{
                
                return res.status(500).send({message:"Failed to update configuration", error: error.message})
            })

        }
    }

    //back to default values or disable for toggles
    #removeConfiguration(configId){
        return (req,res)=>{
            NodeConfig.removeConfig(req.nodeId,configId,req.user.id).then((result)=>{
                
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to remove configuration", error: "Node doesn't exist or user have no access"})
                } 
                if(DEFAULT.getValue(configId)){ //if config with default
                    this.#notifyAgent(req.nodeId,configId,DEFAULT.getValue(configId))
                }
                return res.status(200).send()
            }).catch((err)=>{
                return res.status(500).send({message:"Failed to remove configuration", error: err.message})
            })

        }

    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #enableNotification(notId) {
        return (req, res) => {
            NodeConfig.enableNotification(req.nodeId,notId,req.user.id,req.value).then((result)=>{
                if(result && !result.affectedRows){
                    return res.status(400).send({message:"Failed to enable notification", error: "Node doesn't exist or user have no access"})
                } 
                return res.status(200).send()
            }).catch((err)=>{ 
                return res.status(500).send({message:"Failed to enable notification", error: err.message})
            })
        }
    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #disableNotification(notId) {
        return (req, res) => {
            NodeConfig.disableNotification(req.nodeId,notId,req.user.id).then((result)=>{
                return res.status(200).send()
            }).catch((err)=>{
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

    #notifyAgent(nodeId,configId,value){ 
        let agent =  this.#cache.findAgent(nodeId)
        if(agent){//if agent in cahce (online)
            agent.changeConfig(configId,value)
        }
    }


}
module.exports = ConfigAPI
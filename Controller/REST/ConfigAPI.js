//this class handles the request to manage resource related to node configurations
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const CONFIG = FUKURO.MONITORING
const DEFAULT = FUKURO.AGENT.DEFAULT
const MIN = FUKURO.AGENT.MIN
const NodeConfig = require("../../Model/NodeConfig")
const WsCache = require("../WebSocket/WsClientCache")

class ConfigAPI extends RESTController {
    #cache
    constructor() {
        super()
        this.#cache = WsCache

        /****  notification configs  ****/
        //cpu
        this._router.post("/alert/cpu/:nodeId", [this.#checkParam(true), this.#enableNotification(CONFIG.CPU.ALERT.Threshold)])
        this._router.delete("/alert/cpu/:nodeId", [this.#checkParam(), this.#disableNotification(CONFIG.CPU.ALERT.Threshold)])
        /**** END  notification configs END ****/



        //push metric config 
        this._router.post("/interval/push/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.PUSH.Interval)]) 

        this._router.post("/toggle/push/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.PUSH.Toggle)]) 


        /**** CPU metric configuration routes ****/
        //alerts
        this._router.post("/:nodeId/monitoring/cpu",[this.#checkParam(),this.#updateConfigurations([
            CONFIG.CPU.INTERVAL.Extract,
            CONFIG.CPU.INTERVAL.Realtime,
            CONFIG.CPU.ALERT.Tick,
            CONFIG.CPU.ALERT.Cooldown
        ])])

        //alerts conditional values
        this._router.post("/alert/tick/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.CPU.ALERT.Tick)]) 
        this._router.post("/alert/cooldown/cpu/:nodeId", [this.#checkParam(true), this.#updateConfiguration(CONFIG.CPU.ALERT.Cooldown)]) 
 
 
        //interval
        this._router.post("/interval/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.CPU.INTERVAL.Extract)]) 
        this._router.post("/interval/realtime/cpu/:nodeId",[this.#checkParam(true),this.#updateConfiguration(CONFIG.CPU.INTERVAL.Realtime)]) 

        //toggles
        this._router.post("/toggle/cpu/:nodeId",[this.#checkParam(),this.#updateConfiguration(CONFIG.CPU.TOGGLE.Extract)]) 
        /**** END CPU metric configuration routes END ****/
    } 
    
    //configs must be array of the configuration ids [1,2]
    #updateConfigurations(configs){
        return async (req,res)=>{
            if(!req.body){
                return res.status(400).send({message:"no data"})
            }
            // validation and determine wether to update or remove(if same with default)
            let updateConf = []
            let defaultConf = []
            configs.forEach(conf => { 
                let configName = CONFIG.getName(conf)
                if(!req.body[configName]){
                    return res.status(400).send({message:"incomplete data for " + configName})
                }
                else if(req.body[configName] < MIN.getMin(conf)){
                    return res.status(400).send({message:"Error in: "+ configName +", value="+req.body[configName]
                        +" less than minimum " + MIN.getMin(conf)})
                }
                else if(req.body[configName] == DEFAULT.getValue(conf)){
                    // add to list to remove if same with default value
                    defaultConf.push(conf)
                }
                else{
                    updateConf.push({
                        configId:conf,
                        val:req.body[configName]
                    })
                }
            });  
            let errorMessage = ""
            let toAgent = []
            let update = NodeConfig.updateConfigs(req.nodeId,req.user.id,updateConf).then((result)=>{
                console.log('update success') 
                updateConf.forEach(u=>{
                    toAgent.push({id:u.configId,val:u.val})
                })
            }).catch((err)=>{ 
                updateConf.forEach(e=>{
                    errorMessage += "Failed to Update " + CONFIG.getName(e.configId) + ";" 
                })
            })
            let del = NodeConfig.removeConfigs(req.nodeId,req.user.id,defaultConf).then((result)=>{
                console.log('del success')
                defaultConf.forEach(d=>{
                    toAgent.push({id:d,val:DEFAULT.getValue(d)})
                })
            }).catch((err)=>{ 
                defaultConf.forEach(e=>{
                    errorMessage += "Failed to Update " + CONFIG.getName(e) + ";" 
                })
            })
            await Promise.all([update,del])
            console.log('to agent',toAgent)
            if(errorMessage.length == 0){//no error
                return res.status(200).send()
            }else{
                return res.status(500).send({message:errorMessage})
            } 
        }
    }

    #updateConfiguration(configId){
        return (req,res)=>{
            if(DEFAULT.getValue(configId) == req.value){
                //if equals to default then remove the configuration
                console.log('to default')
                NodeConfig.removeConfig(req.nodeId,configId,req.user.id).then((result)=>{
                    
                    this.#notifyAgent(req.nodeId,configId,req.value) 
                    return res.status(200).send()
                }).catch((error)=>{
                    return res.status(500).send({message:error.message})
                })
            }
            else{
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
    #notifyAgentMultiVal(nodeId,configs){
        let agent =  this.#cache.findAgent(nodeId)
        if(agent){//if agent in cahce (online)
            agent.changeConfigs(configs)
        }

    }


}
module.exports = ConfigAPI
//this class handles the request to manage resource related to node configurations
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const CONFIG = FUKURO.MONITORING
const NodeConfig = require("../../Model/NodeConfig")
const WsCache = require("../WebSocket/WsClientCache")
const Node_ = require("../../Model/Node_")

class ConfigAPI extends RESTController {
    #cache
    constructor() {
        super()
        this.#cache = WsCache
        /*
            All configs with value uses post routes
                If value is same with default then record in the database will be automatically removed (optimize db usage)
            Toggle config require no value
                post to enable  
                delete to disable  
        */



        /**** PUSH metric configuration routes ****/
        this._router.get("/:nodeId/push", [this.#checkParam(), this.#fetchConfig([
            CONFIG.PUSH.Interval,
            CONFIG.PUSH.Toggle
        ])])
        this._router.post("/:nodeId/push", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.PUSH.Interval
        ], "Push")])

        this._router.post("/:nodeId/push/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.PUSH.Toggle, true,"Push Metric")])
        this._router.delete("/:nodeId/push/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.PUSH.Toggle, false,"Push Metric")])
        /**** END PUSH metric configuration routes END ****/


        /**** CPU metric configuration routes ****/

        this._router.get("/:nodeId/cpu", [this.#checkParam(), this.#fetchConfig([
            CONFIG.CPU.INTERVAL.Extract,
            CONFIG.CPU.INTERVAL.Realtime,
            CONFIG.CPU.ALERT.Tick,
            CONFIG.CPU.ALERT.Cooldown,
            CONFIG.CPU.TOGGLE.Extract,
        ], [
            CONFIG.CPU.ALERT.Threshold
        ])])

        this._router.post("/:nodeId/monitoring/cpu", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.CPU.INTERVAL.Extract,
            CONFIG.CPU.INTERVAL.Realtime,
            CONFIG.CPU.ALERT.Tick,
            CONFIG.CPU.ALERT.Cooldown
        ],"CPU Monitoring")])

        //toggle
        this._router.post("/:nodeId/monitoring/cpu/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.CPU.TOGGLE.Extract, true,"CPU Monitoring")])
        this._router.delete("/:nodeId/monitoring/cpu/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.CPU.TOGGLE.Extract, false,"CPU Monitoring")])

        //notification
        this._router.post("/:nodeId/alert/cpu", [this.#checkParam(true), this.#enableNotification(CONFIG.CPU.ALERT.Threshold)])
        this._router.delete("/:nodeId/alert/cpu", [this.#checkParam(), this.#disableNotification(CONFIG.CPU.ALERT.Threshold)])

        /**** END CPU metric configuration routes END ****/


        /**** Memory metric configuration routes ****/

        this._router.get("/:nodeId/mem", [this.#checkParam(), this.#fetchConfig([
            CONFIG.MEM.INTERVAL.Extract,
            CONFIG.MEM.INTERVAL.Realtime,
            CONFIG.MEM.ALERT.Tick,
            CONFIG.MEM.ALERT.Cooldown,
            CONFIG.MEM.TOGGLE.Extract,
        ], [
            CONFIG.MEM.ALERT.Threshold
        ])])

        this._router.post("/:nodeId/monitoring/mem", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.MEM.INTERVAL.Extract,
            CONFIG.MEM.INTERVAL.Realtime,
            CONFIG.MEM.ALERT.Tick,
            CONFIG.MEM.ALERT.Cooldown
        ],"Memory Monitoring")])

        //toggle
        this._router.post("/:nodeId/monitoring/mem/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.MEM.TOGGLE.Extract, true,"Memory Monitoring")])
        this._router.delete("/:nodeId/monitoring/mem/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.MEM.TOGGLE.Extract, false,"Memory Monitoring")])

        //notification
        this._router.post("/:nodeId/alert/mem", [this.#checkParam(true), this.#enableNotification(CONFIG.MEM.ALERT.Threshold)])
        this._router.delete("/:nodeId/alert/mem", [this.#checkParam(), this.#disableNotification(CONFIG.MEM.ALERT.Threshold)])

        /**** END Memory metric configuration routes END ****/

        /**** Net metric configuration routes ****/

        this._router.get("/:nodeId/net", [this.#checkParam(), this.#fetchConfig([
            CONFIG.NET.INTERVAL.Extract,
            CONFIG.NET.INTERVAL.Realtime,
            CONFIG.NET.ALERT.Tick,
            CONFIG.NET.ALERT.Cooldown,
            CONFIG.NET.TOGGLE.Extract,
        ], [
            CONFIG.NET.ALERT.Threshold
        ])])

        this._router.post("/:nodeId/monitoring/net", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.NET.INTERVAL.Extract,
            CONFIG.NET.INTERVAL.Realtime,
            CONFIG.NET.ALERT.Tick,
            CONFIG.NET.ALERT.Cooldown
        ],"Network Monitoring")])

        //toggle
        this._router.post("/:nodeId/monitoring/net/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.NET.TOGGLE.Extract, true,"Network Monitoring")])
        this._router.delete("/:nodeId/monitoring/net/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.NET.TOGGLE.Extract, false,"Network Monitoring")])

        //notification
        this._router.post("/:nodeId/alert/net", [this.#checkParam(true), this.#enableNotification(CONFIG.NET.ALERT.Threshold)])
        this._router.delete("/:nodeId/alert/net", [this.#checkParam(), this.#disableNotification(CONFIG.NET.ALERT.Threshold)])

        /**** Net  metric configuration routes END ****/

        /**** Disk metric configuration routes ****/

        this._router.get("/:nodeId/disk", [this.#checkParam(), this.#fetchConfig([
            CONFIG.DSK.INTERVAL.Extract,
            CONFIG.DSK.INTERVAL.Realtime,
            CONFIG.DSK.ALERT.Tick,
            CONFIG.DSK.ALERT.Cooldown,
            CONFIG.DSK.TOGGLE.Extract,
        ], [
            CONFIG.DSK.ALERT.Threshold
        ])])

        this._router.post("/:nodeId/monitoring/disk", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.DSK.INTERVAL.Extract,
            CONFIG.DSK.INTERVAL.Realtime,
            CONFIG.DSK.ALERT.Tick,
            CONFIG.DSK.ALERT.Cooldown
        ],"Disk Monitoring")])

        //toggle
        this._router.post("/:nodeId/monitoring/disk/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.DSK.TOGGLE.Extract, true,"Disk Monitoring")])
        this._router.delete("/:nodeId/monitoring/disk/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.DSK.TOGGLE.Extract, false,"Disk Monitoring")])

        //notification
        this._router.post("/:nodeId/alert/disk", [this.#checkParam(true), this.#enableNotification(CONFIG.DSK.ALERT.Threshold)])
        this._router.delete("/:nodeId/alert/disk", [this.#checkParam(), this.#disableNotification(CONFIG.DSK.ALERT.Threshold)])

        //additional routes only for disk
        this._router.get("/:nodeId/disk/list", [this.#checkParam(), this.#fetchDiskList()])

        //toggle disk monitoring by name
        this._router.post("/:nodeId/disk/:diskname", [this.#checkParam(), this.#updateDiskStat(true)])
        this._router.delete("/:nodeId/disk/:diskname", [this.#checkParam(), this.#updateDiskStat(false)])

        /**** Disk  metric configuration routes END ****/
 
    }
 
    #updateDiskStat(enable) {
        return (req, res) => {
            if (!req.params.diskname) {
                return res.status(400).send({ message: 'invalid disk name' })
            }
            NodeConfig.updateDiskStat(req.nodeId, req.params.diskname, enable).then((result) => { 
                if (!result.affectedRows) {
                    return res.status(400).send({ message: "disk name doesn't exist" })
                }
                else {

                    let agent = this.#cache.findAgent(req.nodeId)
                    if (agent) {//if agent in cahce (online)
                        agent.refreshDiskMonitor()
                    }
                    Node_.logActivity(req.nodeId,"Disk Monitoring Configuration Changed",req.user.id)
                    return res.status(200).send()
                }
            }).catch((err) => {
                return res.status(500).send({ message: err.message })
            })
        }

    }

    #fetchDiskList() {
        return (req, res) => {
            NodeConfig.fetchAllDisk(req.nodeId).then((result) => {
                return res.status(200).send(result)
            }).catch((err) => {
                return res.status(500).send({ message: err.message })
            })
        }
    }

    // configs must be array of configuration id and notifications is id of notification configuration
    #fetchConfig(configs = [], notifications = []) {
        return (req, res) => {
            // placeholder promises
            let config = new Promise((resolve, reject) => {
                resolve([])
            })
            let notification = new Promise((resolve, reject) => {
                resolve([])
            })
            if (configs.length > 0) {
                config = NodeConfig.getConfigs(req.nodeId, req.user.id, configs)
            }
            if (notifications.length > 0) {
                notification = NodeConfig.getNotificationConfigs(req.nodeId, req.user.id, notifications)
            }
            Promise.all([config, notification]).then((result) => {

                console.log(result)
                let parsed = {}
                configs.forEach(e => {
                    let value = result[0].filter(obj => obj.configId === e)
                    if (value.length > 0) {
                        value = value[0].value
                    }
                    else {
                        // if not from db then default
                        value = FUKURO.getDefaultValue(e)
                    }
                    if (!value) {
                        value = false
                    }
                    parsed[FUKURO.getName(e)] = value
                })
                notifications.forEach(e => {
                    let value = result[1].filter(obj => obj.notId === e)
                    if (value.length > 0) {
                        value = value[0].value
                    }
                    else {
                        // if not from db then default
                        value = FUKURO.getDefaultValue(e)
                    }
                    if (!value) {
                        value = false
                    }
                    parsed[FUKURO.getName(e)] = value
                })
                return res.status(200).send(parsed)
            }).catch((error) => {
                return res.status(500).send({ message: error.message })
            })
        }
    }

    //configs must be array of the configuration ids [1,2]
    #updateConfigurations(configs,configName) {
        return async (req, res) => {
            if (!req.body) {
                return res.status(400).send({ message: "no data" })
            }
            
            let admin = await Node_.isAdmin(req.user.id,req.nodeId).catch((error)=>{
                return res.status(500).send({message : "Unable to verify access"})
            })
            if(!admin){
                return res.status(401).send({message : "Unauthorized to change configureation"})
            }
            
            // validation and determine wether to update or remove(if same with default)
            let updateConf = []
            let defaultConf = [] 
            configs.forEach(conf => {
                let configName = FUKURO.getName(conf)
                if (!req.body[configName]) {
                    return res.status(400).send({ message: "incomplete data for " + configName })
                }
                else if (req.body[configName] < FUKURO.getMin(conf)) {
                    return res.status(400).send({
                        message: "Error in: " + configName + ", value=" + req.body[configName]
                            + " less than minimum " + FUKURO.getMin(conf)
                    })
                }
                else if (req.body[configName] == FUKURO.getDefaultValue(conf)) {
                    // add to list to remove if same with default value
                    defaultConf.push(conf)
                }
                else {
                    updateConf.push({
                        configId: conf,
                        val: req.body[configName]
                    })
                }
            });
            let errorMessage = ""
            let toAgent = []
            let update = NodeConfig.updateConfigs(req.nodeId, updateConf).then((result) => {
                console.log('update success')
                updateConf.forEach(u => {
                    toAgent.push({ id: u.configId, val: u.val })
                })
            }).catch((err) => {
                updateConf.forEach(e => {
                    errorMessage += "Failed to Update " + FUKURO.getName(e.configId) + ";"
                })
            })
            let del = NodeConfig.removeConfigs(req.nodeId,defaultConf).then((result) => {
                console.log('del success')
                defaultConf.forEach(d => {
                    toAgent.push({ id: d, val: FUKURO.getDefaultValue(d) })
                })
            }).catch((err) => {
                defaultConf.forEach(e => {
                    errorMessage += "Failed to Update " + FUKURO.getName(e) + ";"
                })
            })
            await Promise.all([update, del])
            console.log('to agent', toAgent)
            if (toAgent.length > 0) {
                this.#applyChanges(req.nodeId, toAgent)
            }
            if (errorMessage.length == 0) {//no error
                await Node_.logActivity(req.nodeId,configName + " Configuration Changed",req.user.id)
                return res.status(200).send()
            } else {
                return res.status(500).send({ message: errorMessage })
            }
        }
    }

    // toggle configs
    #toggleConfig(configId, enable,configName) {
        return async (req, res) => { 

            let admin = await Node_.isAdmin(req.user.id,req.nodeId).catch((error)=>{
                return res.status(500).send({message:"Unable to verify access"})
            })
            if(!admin){
                return res.status(401).send({message:"Unauthorized to change configureation"})
            }
            let msg = (enable) ? "Enable" : "Disable"
            // record of toggle in database indicates that the config is disabled
            // thus, insert = disable, remove = enable
            let operation = (enable) ? NodeConfig.removeConfig(req.nodeId, configId) :
            NodeConfig.updateConfig(req.nodeId, configId, null, req.user.id)
            operation.then(async(result) => {
                this.#applyChanges(req.nodeId, [{ id: configId, val: enable }])
                await Node_.logActivity(req.nodeId, configName +" " + msg + "d",req.user.id)
                return res.status(200).send()
            }).catch((error) => {
                return res.status(500).send({ message: "Failed to " + msg, error: error.message })
            })

        }
    }
     

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #enableNotification(notId) {
        return async (req, res) => {
            if (req.value < FUKURO.getMin(notId)) {
                return res.status(400).send({
                    message: "Error :  value=" + req.value
                        + " less than minimum " + FUKURO.getMin(notId)
                })
            }
            var nodeDetail = await Node_.findNode(req.nodeId, req.user.id).catch(function (err) {
                return res.status(401).send({message:"Cannot enable notification please ensure you have access"}) 
            })
            if(!nodeDetail){
                return res.status(401).send({message:"Cannot enable notification please ensure you have access"}) 
            }

            NodeConfig.enableNotification(req.nodeId, notId, req.user.id, req.value).then(async (result) => {
                if (result && !result.affectedRows) {
                    return res.status(400).send({ message: "Failed to enable notification", error: "Node doesn't exist or user have no access" })
                }
                await this.#refreshThreshold(req.nodeId, notId)
                return res.status(200).send()
            }).catch((err) => {
                return res.status(500).send({ message: "Failed to enable notification", error: err.message })
            })
        }
    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #disableNotification(notId) {
        return (req, res) => {
            NodeConfig.disableNotification(req.nodeId, notId, req.user.id).then(async (result) => {
                await this.#refreshThreshold(req.nodeId, notId)
                return res.status(200).send()
            }).catch((err) => {
                return res.status(500).send({ message: "Failed to disable notification", error: err.message })
            })

        }
    }

    async #refreshThreshold(nodeId, notId) {
        let agent = this.#cache.findAgent(nodeId)
        if (agent) {//if agent in cahce (online)
            await agent.refreshThreshold([notId])
        }
    }

    #checkParam(checkValue = false) {
        return [
            this._auth.authRequest(),
            (req, res, next) => {
                if (req.params.nodeId) {
                    try {
                        req.nodeId = parseInt(req.params.nodeId)
                        if (checkValue) {
                            if (!req.query.val) {
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

    #applyChanges(nodeId, configs) {
        let agent = this.#cache.findAgent(nodeId)
        if (agent) {//if agent in cahce (online)
            agent.changeConfigs(configs)
        }

    }
}


module.exports = ConfigAPI
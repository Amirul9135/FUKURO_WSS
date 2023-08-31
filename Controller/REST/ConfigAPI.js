//this class handles the request to manage resource related to node configurations
const RESTController = require("./RESTController") // rest controller base class
const FUKURO = require("../../FUKURO") //static class for config id reference
const CONFIG = FUKURO.MONITORING
const NodeConfig = require("../../Model/NodeConfig")
const WsCache = require("../WebSocket/WsClientCache")

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
        ])])

        this._router.post("/:nodeId/push/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.PUSH.Toggle, true)])
        this._router.delete("/:nodeId/push/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.PUSH.Toggle, false)])
        /**** END PUSH metric configuration routes END ****/


        /**** CPU metric configuration routes ****/

        this._router.get("/:nodeId/cpu", [this.#checkParam(), this.#fetchConfig([
            CONFIG.CPU.INTERVAL.Extract,
            CONFIG.CPU.INTERVAL.Realtime,
            CONFIG.CPU.ALERT.Tick,
            CONFIG.CPU.ALERT.Cooldown,
            CONFIG.CPU.TOGGLE.Extract,
        ],[
            CONFIG.CPU.ALERT.Threshold
        ])])

        this._router.post("/:nodeId/monitoring/cpu", [this.#checkParam(), this.#updateConfigurations([
            CONFIG.CPU.INTERVAL.Extract,
            CONFIG.CPU.INTERVAL.Realtime,
            CONFIG.CPU.ALERT.Tick,
            CONFIG.CPU.ALERT.Cooldown
        ])])

        //toggle
        this._router.post("/:nodeId/monitoring/cpu/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.CPU.TOGGLE.Extract, true)])
        this._router.delete("/:nodeId/monitoring/cpu/toggle", [this.#checkParam(), this.#toggleConfig(CONFIG.CPU.TOGGLE.Extract, false)])

        //notification
        this._router.post("/:nodeId/alert/cpu", [this.#checkParam(true), this.#enableNotification(CONFIG.CPU.ALERT.Threshold)])
        this._router.delete("/:nodeId/alert/cpu", [this.#checkParam(), this.#disableNotification(CONFIG.CPU.ALERT.Threshold)])

        /**** END CPU metric configuration routes END ****/
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
                notification = NodeConfig.getNotificationConfigs(req.nodeId, req.user.id,notifications )
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
    #updateConfigurations(configs) {
        return async (req, res) => {
            if (!req.body) {
                return res.status(400).send({ message: "no data" })
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
            let update = NodeConfig.updateConfigs(req.nodeId, req.user.id, updateConf).then((result) => {
                console.log('update success')
                updateConf.forEach(u => {
                    toAgent.push({ id: u.configId, val: u.val })
                })
            }).catch((err) => {
                updateConf.forEach(e => {
                    errorMessage += "Failed to Update " + FUKURO.getName(e.configId) + ";"
                })
            })
            let del = NodeConfig.removeConfigs(req.nodeId, req.user.id, defaultConf).then((result) => {
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

                return res.status(200).send()
            } else {
                return res.status(500).send({ message: errorMessage })
            }
        }
    }

    // toggle configs
    #toggleConfig(configId, enable) {
        return async (req, res) => {
            let msg = (enable) ? "Enable" : "Disable"
            // record of toggle in database indicates that the config is disabled
            // thus, insert = disable, remove = enable
            let operation = (enable) ? NodeConfig.removeConfig(req.nodeId, configId, req.user.id) :
                NodeConfig.updateConfig(req.nodeId, configId, null, req.user.id)
            operation.then((result) => { 
                this.#applyChanges(req.nodeId,[{id:configId,val:enable}])
                return res.status(200).send()
            }).catch((error) => {
                return res.status(500).send({ message: "Failed to " + msg, error: error.message })
            })

        }
    }

    //config id parametized so that method can be resused for multiple path (value and node from request object)
    #enableNotification(notId) {
        return (req, res) => {
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
        let threshold = await NodeConfig.getThreshold(nodeId, notId)
        threshold = (threshold) ? threshold : 0
        this.#applyChanges(nodeId,[{id:nodeId,val:threshold}]) 
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
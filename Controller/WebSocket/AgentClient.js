//this class is to store web socket client connecting from FUKURO agent application
const WsClient = require("./WsClient")
const { FUKURO_OS } = require("../OneSignal")
const MetricController = require("../MetricController")
const FUKURO = require("../../FUKURO")
const NodeConfig = require("../../Model/NodeConfig")
const Node_ = require("../../Model/Node_")
const AGENT = FUKURO.AGENT 


class AgentClient extends WsClient {
    #node //node object reference
    #connectedApps = [] //list of connected AppClient
    #oneSignal
    #cmd

    constructor(wsc, node, cache) {
        super(wsc, cache)
        this.#node = node
        this.#oneSignal = FUKURO_OS
        this._cache.addAgent(this)
        this.#cmd = {}
        console.log('agent connected', node)
        

        Node_.logActivity(this.#node.nodeId,"Agent Connected to server")
        Node_.findAllAssociatedUser(this.#node.nodeId).then((result)=>{ 
            if(result.length > 0){
                let ids = [];
                result.forEach((i)=>{
                    ids.push(i["userId"].toString())
                });
                this.#oneSignal.sendNotification(ids,"Agent " + this.#node.name
                 + " Online","Agent application connected with FUKURO server",
                 {dateTime:new Date().toISOString()})
            }
        }).catch((err)=>{
            console.log("agent client handler error "  +err)
        })

        // send noti via onesignal
        this.#connectedApps.forEach(app => {
            app.send({ error: 'agent offline' })
            app.close()
        })
    }

     getNode() {
        return this.#node
    }

    async addAppClient(app) {
        this.#connectedApps.push(app)
    }

    async removeAppClient(userId) {
        this.#connectedApps = this.#connectedApps.filter((app) => { app.getUser().userId !== userId })
        //remove app from cache also
        this._cache.removeApp(userId)
        this.toggleRealtime()
    }

    // configs must be array of object {id:,val:}
    async changeConfigs(configs) {
        let msg = []
        configs.forEach(e => {
            msg.push(AGENT.config(e.id, e.val))
        });
        this.send(JSON.stringify(msg))
    }

    async _onOpen() {
        console.log("Agent on " + this.#node.name + " connected")
        // logging information here
    }

    async _onClose() {

        // logging onformation

        // get list of user for down notification
        Node_.logActivity(this.#node.nodeId,"Agent Disconnected from server")
        Node_.findAllAssociatedUser(this.#node.nodeId).then((result)=>{ 
            if(result.length > 0){
                let ids = [];
                result.forEach((i)=>{
                    ids.push(i["userId"].toString())
                });
                this.#oneSignal.sendNotification(ids,"Agent " + this.#node.name
                 + " Offline","Agent application lost connection with FUKURO server",
                 {dateTime:new Date().toISOString()})
            }
        }).catch((err)=>{
            console.log("agent client handler error "  +err)
        })

        // send noti via onesignal
        this.#connectedApps.forEach(app => {
            app.send({ error: 'agent offline' })
            app.close()
        })
        this._cache.removeAgent(this.#node.nodeId)
        console.log("Agent on node " + this.#node.name + " closed connection")
    }

    async _handleMessage(message) {
        try {
            message = JSON.parse(message)
        } catch (e) {
            console.log("received non json " + message)
            return
        }
        //  console.log("(agent)received",message)
        if (!message.path) {
            console.log('unknown instruction')
            return
        }
        else if (message.path.startsWith("config")) {
            this.#loadNodeConfigs()
        }
        if (message.path.startsWith("realtime")) {
            this.#broadcastReading(message)
        }
        else if (message.path.startsWith('alert')) {
            this.#generateAlert(message)
        }
        else if (message.path.startsWith("reading")) {
            this.#saveReading(message.data)
        }
        else if (message.path.startsWith("get/spec")) {
            this.#fetchSpec(message)
        }
        else if (message.path.startsWith("post/spec")) {
            this.#saveSpec(message)
        }
        else if (message.path.startsWith("command/")) {
            this.#cmdCallBack(message)
        }

    }

    async  #loadNodeConfigs() {
        //db operation and send to agent
        this.send("some config objects")
        let allconfigId = AGENT.ALL()

        // exclude threshold as threshold is processed differently
        allconfigId = allconfigId.filter(e => !FUKURO.MONITORING.Thresholds.includes(e))

        let dbval = await NodeConfig.getConfigsDirect(this.#node.nodeId, allconfigId).catch((error) => {
            console.log(error.message)
        })
        let configurations = []
        allconfigId.forEach(id => {
            let val = dbval.filter(v => v.configId == id)
            if (val[0]) {
                val = val[0].value
            }
            else {
                val = FUKURO.getDefaultValue(id)
            }
            if (!val) {
                val = false
            }
            configurations.push(AGENT.config(id, val))
        })
        this.send(configurations)
        this.refreshThreshold()
    }

    async toggleRealtime() {
        //turn on off etc
        //check current realtime state, loop through apps, check what metric being monitored
        let res = {}
        res[String(FUKURO.MONITORING.CPU.TOGGLE.Realtime)] = false
        res[String(FUKURO.MONITORING.MEM.TOGGLE.Realtime)] = false
        res[String(FUKURO.MONITORING.NET.TOGGLE.Realtime)] = false
        res[String(FUKURO.MONITORING.DSK.TOGGLE.Realtime)] = false
        this.#connectedApps.forEach(app => {
            app.getMetric().forEach(m => {
                res[String(m)] = true
            })
        })
        let msg = []
        Object.keys(res).forEach(k => {
            msg.push(AGENT.config(k, res[k]))
        })
        this.send(JSON.stringify(msg))

    }

    async    #saveReading(readings) {
        if (readings['cpu']) {
            MetricController.saveReadings(FUKURO.RESOURCE.cpu, this.#node.nodeId, readings['cpu'])
        }
        if (readings['mem']) {
            MetricController.saveReadings(FUKURO.RESOURCE.mem, this.#node.nodeId, readings['mem'])   
        }
        if (readings['dsk']) {
            MetricController.saveReadings(FUKURO.RESOURCE.dsk, this.#node.nodeId, readings['dsk'])
        }
        if (readings['net']) {
            MetricController.saveReadings(FUKURO.RESOURCE.net, this.#node.nodeId, readings['net'])
        }
    }

    async   #broadcastReading(reading) {
        // loop through apps, send to one that are monitoring
        let id = 0
        if (reading.path == 'realtime/cpu') {
            id = FUKURO.MONITORING.CPU.TOGGLE.Realtime
        }
        if (reading.path == 'realtime/mem') {
            id = FUKURO.MONITORING.MEM.TOGGLE.Realtime
        }
        if (reading.path == 'realtime/net') {
            id = FUKURO.MONITORING.NET.TOGGLE.Realtime
        }
        if (reading.path == 'realtime/dsk') {
            id = FUKURO.MONITORING.DSK.TOGGLE.Realtime
        }
        this.#connectedApps.forEach(app => {
            if (app.getMetric().includes(id)) {
                console.log("sending");
                app.send(reading)
            }
        })
    }

    async  #generateAlert(reading) {
        // determine metric
        // determine intrested user
        // use one signal send 
        console.log('alert', reading)
        let title = ""
        let msg = ""
        let id = 0;
        let val = -1;
        if (reading.path == 'alert/cpu') {
            id = FUKURO.MONITORING.CPU.ALERT.Threshold
            val = reading.data.total
            title = this.#node.name + " CPU Usage reaches " + val.toFixed(2) + " (%)"
            msg = "CPU usage reaches treshold " 
        }
        if (reading.path == 'alert/mem') {
            id = FUKURO.MONITORING.MEM.ALERT.Threshold
            val = reading.data.used
            title = this.#node.name + " Memory Usage reaches " + val.toFixed(2) + " (%)"
            msg = "Memory usage reaches treshold "
        }
        if (reading.path == 'alert/net') {
            id = FUKURO.MONITORING.NET.ALERT.Threshold
            val = reading.data.rkByte
            title = this.#node.name + " Received Network Usage reaches " + val.toFixed(2) + " KB"
            msg = "Received Network Usage reaches treshold " 
        }
        if (reading.path == 'alert/dsk') {
            id = FUKURO.MONITORING.DSK.ALERT.Threshold
            val = reading.data.utilization
            title = this.#node.name + " Disk Utilization reaches " + val.toFixed(2) + " (%)"
            msg = "Disk Utilization reaches treshold " 
        }
        Node_.findUserByThreshold(this.#node.nodeId,id,val).then((result)=>{
            if(result.length > 0){
                let ids = [];
                result.forEach((i)=>{
                    ids.push(i["userId"].toString())
                });
                this.#oneSignal.sendNotification(ids,title,msg,reading.data)
            }

        }).catch((error)=>{
            console.log("agent error ", error)
        })
    }

    async #fetchSpec(msg) {
        if (msg.path == 'get/spec/disk') {
            this.refreshDiskMonitor()
        }
    }

    async refreshDiskMonitor() {
        console.log('refresh disk')
        let diskName = await NodeConfig.fetchDisksToMonitor(this.#node.nodeId).catch(err => {
            console.log(err)
        })
        if (diskName) {
            let names = []
            diskName.forEach(name => {
                names.push(name.name)
            })
            this.send(JSON.stringify({
                path: "spec/disk",
                data: names
            }))

        }

    }

    async #saveSpec(msg) {
        console.log(msg)
        if (msg.path == 'post/spec/disk') {
            await NodeConfig.updateDisk(this.#node.nodeId, msg.data)
        }
        else if (msg.path == 'post/spec/cpu') {
            let cpu = msg.data
            let arr = [
                {specId:FUKURO.SPEC.cpuName ,value:cpu.name},
                {specId: FUKURO.SPEC.cpuFreq,value: cpu.freq},
                {specId:FUKURO.SPEC.cpuCore ,value: cpu.cores},
                {specId:  FUKURO.SPEC.cpuCache,value:cpu.cache},
            ]
            await NodeConfig.updateSpecs(this.#node.nodeId, arr) 
        }
        else if (msg.path == 'post/spec/ip') {
            await NodeConfig.updateSpecs(this.#node.nodeId,  [{specId:  FUKURO.SPEC.ipAddress,value:msg.data}] )
        }
        else if (msg.path == 'post/spec/mem') {
            await NodeConfig.updateSpecs(this.#node.nodeId,  [{specId:  FUKURO.SPEC.totalMemory,value:msg.data}] )
        }

    }
    async refreshThreshold(ids = FUKURO.MONITORING.Thresholds) {
        let threshold = await NodeConfig.getThreshold(this.#node.nodeId, ids).catch((error) => {
            console.log('error loading threshold' + error.message)
        })
        let msg = []
        console.log(threshold)
        ids.forEach(e => {
            let val = []
            threshold.forEach(th => {
                if (th.notId == e) {
                    val.push(th.value)
                }
            })

            msg.push(AGENT.config(e, val))
        });
        console.log('msg')
        console.log(msg)
        this.send(JSON.stringify(msg))
    }

     executeCommand(cmd, dir, isTool,uid) {
        let id = AgentClient.genCMDID()
        while (id in this.#cmd) {
            id = AgentClient.genCMDID()
        }
        let msg = {
            path: 'command',
            data: {
                dir: dir,
                id: id,
                cmd: cmd.trim()
            }
        }
        if (isTool) {
            msg.data['isTool'] = true
        }
        this.send(JSON.stringify(msg))
        Node_.logActivity(this.#node.nodeId,"Execute Command : " + cmd.trim(),uid)
        return new Promise((resolve, reject) => {
            this.#cmd[id] = resolve
        })

    }

    // this method will redirect the message data to resolve command promises if exist
    async  #cmdCallBack(msg) {
        let id = msg.path.slice(msg.path.lastIndexOf('/') + 1);
        console.log(msg)
        if (this.#cmd[id]) {
            this.#cmd[id](msg.data)

            delete this.#cmd[id]
        }

    }

    async refreshDiskVolume() {
        this.send(JSON.stringify({
            path: 'refresh/disk'
        }))
    }
    static genCMDID(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let uniqueID = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            uniqueID += characters.charAt(randomIndex);
        }

        return uniqueID;
    }

}

module.exports = AgentClient
//this class is to store web socket client connecting from FUKURO mobile application
const WsClient = require("./WsClient")
const FUKURO = require("../../FUKURO")

class AppClient extends WsClient {
    //attributes
    #user //object of user
    #connectedAgent // object of AgentClient 
    #metric
    #directory

    constructor(wsc, agent, user, cache) {
        super(wsc, cache)
        this.#connectedAgent = agent
        this.#user = user
        this._cache.addApp(this)
        this.#metric = []
        this.#directory = '/'
        this.#connectedAgent.refreshDiskVolume()
        console.log("app connected ", user)
    }
     getMetric() {
        return this.#metric
    }
     getUser() {
        return this.#user
    }

     getConnectedAgent() {
        return this.#connectedAgent
    }

    async _onOpen() {
        console.log("user " + this.#user.id + " connected")
    }

    async _onClose() {
        //remove closed client from monitored agent *action is in the agent itself
        this.#connectedAgent.removeAppClient(this.#user.id)
        console.log("user " + this.#user + " closed connection")

    }

    async _handleMessage(message) {
        try {
            message = JSON.parse(message)
        } catch (e) {
            console.log("received non json " + message)
            return
        }
        if (!message.path) {
            console.log('unknown instruction')
        }
        else if (message.path.startsWith("metric")) {
            this.#toggleMetric(message)
        }
        else if (message.path.startsWith("command")) {
            this.#processCommand(message)
        }
    }

    async  #toggleMetric(msg) {
        console.log('msg', msg)
        let id = 0
        if (msg.path == "metric/cpu") {
            id = FUKURO.MONITORING.CPU.TOGGLE.Realtime
        }
        else if (msg.path == "metric/mem") {
            id = FUKURO.MONITORING.MEM.TOGGLE.Realtime
        }
        else if (msg.path == "metric/dsk") {
            id = FUKURO.MONITORING.DSK.TOGGLE.Realtime
        }
        else if (msg.path == "metric/net") {
            id = FUKURO.MONITORING.NET.TOGGLE.Realtime
        }
        if (id) {
            if (msg.data == 1) {
                this.#metric.push(id)
            } else {
                console.log('dalam', this.#metric, id)
                this.#metric = this.#metric.filter(e => e !== id)
            }
            console.log('cur', this.#metric)
            this.#connectedAgent.toggleRealtime()
        }

    }

    async  #processCommand(cmd) {
        console.log('start cmd', cmd)
        this.#connectedAgent.executeCommand(cmd.data, this.#directory, cmd.isTool,this.#user.id).then((result) => {
            console.log('command result', result)
            if (result && result.startsWith('Changed directory to: ')) {
                console.log('ubah', result)
                this.#directory = result.slice(result.lastIndexOf(':') + 1).trim()
            }
            this.send({
                path: 'command/result',
                dir: this.#directory,
                data: result
            })
        }).catch((err) => {
            console.log('command error', err)
        })

    }
}

module.exports = AppClient
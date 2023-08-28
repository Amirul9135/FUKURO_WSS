//this class is to store web socket client connecting from FUKURO agent application
const WsClient = require("./WsClient")
const {FUKURO_OS} = require("../OneSignal")


class AgentClient extends WsClient {
    #node //node object reference
    #connectedApps = [] //list of connected AppClient
    #oneSignal

    constructor(wsc,node,cache){
        super(wsc,cache)
        this.#node = node 
        this.#oneSignal = FUKURO_OS
        this._cache.addAgent(this)
        this.send({
            "path":"connected"
        })
        console.log('agent connected',node)
    }

    getNode(){
        return this.#node
    }

    addAppClient(app){
        this.#connectedApps.push(app)
    }

    removeAppClient(userId){
        this.#connectedApps = this.#connectedApps.filter((app)=>{app.getUser().userId !== userId})
        //remove app from cache also
        this._cache.removeApp(userId)
    } 

    _onOpen(){
        console.log("Agent on " + this.#node.name +" connected")
        // logging information here
    }

    _onClose(){
        
        // logging onformation

        // get list of user for down notification

        // send noti via onesignal

        this._cache.removeAgent(this.#node.nodeId)
        console.log("Agent on node " + this.#node.name +" closed connection")
    }

    _handleMessage(message){
        try {
            message = JSON.parse(message)
        } catch (e) { 
            console.log("received non json " + message)
            return
        }
        console.log("(agent)received",message)

    }

    #updateNodeConfig(){
        //db operation and send to agent
        this.send("some config objects")
    }

    #toggleRealtime(){
        //turn on off etc
        //check current realtime state, loop through apps, check what metric being monitored
    }

    #saveReading(readings){

    }

    #broadcastReading(reading){
        // loop through apps, send to one that are monitoring
    }

    #generateAlert(reading){
        // determine metric
        // determine intrested user
        // use one signal send 
    }

}

module.exports = AgentClient
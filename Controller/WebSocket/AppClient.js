//this class is to store web socket client connecting from FUKURO mobile application
const WsClient = require("./WsClient")

class AppClient extends WsClient {
    //attributes
    #user //object of user
    #connectedAgent // object of AgentClient 

    constructor(wsc,agent,user,cache){
        super(wsc,cache)
        this.#connectedAgent = agent
        this.#user = user 
        this._cache.addApp(this)
        console.log("app connected " , user)
    }

    getUser(){
        return this.#user
    }

    getConnectedAgent(){
        return this.#connectedAgent
    }

    _onOpen(){
        console.log("user " + this.#user.userId +" connected")
    }

    _onClose(){
        //remove closed client from monitored agent *action is in the agent itself
        this.#connectedAgent.removeAppClient(this.#user.userId)
        console.log("user " + this.#user.userId +" closed connection")

    }

    _handleMessage(message){

    }
}

module.exports = AppClient
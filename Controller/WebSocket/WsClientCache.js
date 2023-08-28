//this class hold the data of client cached during runtime
class WsClientCache{
    #agents = []
    #apps = []

    addAgent(agent){
        this.#agents.push(agent)
    }

    addApp(app){
        this.#apps.push(app)
    }

    removeAgent(nodeId){
        this.#agents = this.#agents.filter((ag)=>ag.getNode().nodeId !== nodeId )
    }

    removeApp(userId){
        this.#apps = this.#apps.filter((app)=>app.getUser().userId !== userId )

    }

    findAgent(nodeId){
        return this.#agents.find((ag) => ag.getNode().nodeId == nodeId)
    }

    findApp(userId){
        return this.#apps.find((app)=>app.getUser().userId == userId )
    }
}

//instantiate before export so that all module that refer to this cache get the same instance
const cache = new WsClientCache()
module.exports = cache
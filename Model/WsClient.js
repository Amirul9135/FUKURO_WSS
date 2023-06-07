class WsClients {
    constructor() {
        this.list = {}
        this.saveClient = this.saveClient.bind(this)
    }

    saveClient(nodeData, ws) {
        ws.client = {
            type: "node",
            data: nodeData,
            app: [] //array of app web socket clients
        }
        this.list[nodeData.nodeId] = ws;
        ws.send(JSON.stringify({ info: "Node: " + nodeData.name + " connected" }))
    }

    addAppClient(nodeId, userData, ws, metric) {
        if (this.list[nodeId]) {
            ws.client = {
                type: "app",
                data: userData,
                nodeId: nodeId,
                metric: metric
                /*    "metric":{ //metric is only for app client to select what they will recieve in realtime
                        cpu: 1,
                        mem:1,
                        disk:1,
                        net:1,
                    }*/
            }
            this.list[nodeId].client.app.push(ws) 
            ws.send(JSON.stringify({ info: "Connected to node: " + this.list[nodeId].client.data.name }))
            this.list[nodeId].send("live interval")
        }
    }

    removeAppClient(ws){
        console.log('off app')
        if(this.list[ws.client.nodeId]){
            this.list[ws.client.nodeId].client.app = this.list[ws.client.nodeId].client.app.filter(appws => appws.client.data.id != ws.client.data.id)
            console.log(ws.client.data)
            console.log(this.list[ws.client.nodeId].client.app.length)
            if(this.list[ws.client.nodeId].client.app.length == 0){//empty no 1 watching
                this.list[ws.client.nodeId].send("norm interval")
            }
        }
    }

    removeAgentClient(ws){
        if(this.list[ws.client.data.nodeId]){
            ws.client.app.forEach(apws => {
                apws.send(JSON.stringify({"warning":"node offline"}))
            });
            delete this.list[ws.client.data.nodeId]
        }
    }
}
const wsClients = new WsClients()
module.exports = wsClients
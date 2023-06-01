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
                metric: metric
                /*    "metric":{ //metric is only for app client to select what they will recieve in realtime
                        cpu: 1,
                        mem:1,
                        disk:1,
                        net:1,
                    }*/
            }
            this.list[nodeId].client.app.push(ws)
            this.list[nodeId].send(JSON.stringify({ monitoring: true }))
            ws.send(JSON.stringify({ info: "Connected to node: " + this.list[nodeId].client.data.name }))
        }
    }
}
const wsClients = new WsClients()
module.exports = wsClients
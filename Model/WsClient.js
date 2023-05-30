class WsClients {
    constructor() {
        this.list = {}
        this.saveClient = this.saveClient.bind(this)
    }

    saveClient(nodeData, wsClient) {
        this.list[nodeData.nodeId] = {
            wsc: wsClient, //web socket client
            data: clientData, //details of the node
            app: [] //list of web socket client connected from application which is viewing this node
            /*example of 1 app client
            {
            wsc: websocket object,
            nodeId: nodeId,
            path: {"/":true,"/testdir":true}
            }
            */
        }
    }
}
const wsClients = new WsClients()
module.exports = wsClients
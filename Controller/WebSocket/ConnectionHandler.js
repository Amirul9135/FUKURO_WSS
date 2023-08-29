
const AgentClient = require("./AgentClient")
const AppClient = require("./AppClient")
const config = require("config");
const Authenticator = require("../Middleware/Authenticator")
const Auth  = new Authenticator()
const Node_ = require("../../Model/Node_")
const bcrypt = require("bcryptjs")

const WsClientCache = require("./WsClientCache")

class ConnectionHandler {
 
    async onConnect(ws, req, a) { 
        ws.on('message', async function parseMessage(message) { 
            try {
                message = JSON.parse(message)
            } catch (e) {
                ws.send(JSON.stringify({ error: "Unable to connect: invalid message content"  }))
                ws.close()
                return
            }



            if (!message.hasOwnProperty("path")) { 
                ws.send(JSON.stringify({ error: "Unable to connect: invalid message format"  }))
                ws.close()
                return
            }

            if (message.path == "verify/agent" || message.path == "verify/app") {

                if (!message.data) { 
                    ws.send(JSON.stringify({ error: "Unable to connect: invalid message content"  }))
                    ws.close()
                    return
                }
                let data = message.data
                if (!data.nodeId || !data.passKey || !data.jwt || !data.uid) {
                    ws.send(JSON.stringify({ error: "Unable to connect: incomplete verification details"  }))
                    ws.close()
                    return
                }
 
                var uid = data.uid
                var user = Auth.verifyJWT(uid, data.jwt)
                console.log(message) 
                if (!user) {
                    ws.send(JSON.stringify({ error: "Unable to connect: invalid token"  }))
                    ws.close()
                    return
                }
                console.log("1")
                //check user access to the node
                var nodeDetail = await Node_.findNode(data.nodeId, user.id).catch(function (err) {
                    ws.send(JSON.stringify({ error: "Unable to connect: cannot find node, please ensure you have access"  }))
                    ws.close()
                })
                if (!nodeDetail)
                    return

                    console.log("2")
                var passKeyMatch = await bcrypt.compare(data.passKey, nodeDetail.passKey)

                //verify pass key 
                if (!passKeyMatch) {
                    ws.send(JSON.stringify({ error: "Unable to connect: invalid pass key"  }))
                    ws.close()
                    return
                }

                if (message.path == "verify/agent") {
                    //agent client

                    //create handler object for the agent client
                    let agent = new AgentClient(ws, nodeDetail,WsClientCache)
                }
                else if (message.path == "verify/app") {
                    // app client

                    //check agent available or not
                    let agent = WsClientCache.findAgent(nodeDetail.nodeId)
                    if (!agent) {
                        ws.send(JSON.stringify({ error: "Unable to connect:  is offline" }))
                        ws.close()
                        return
                    }

                    //create handler object for the app client
                    let app = new AppClient(ws, agent, user, WsClientCache)
                    agent.addAppClient(app)
                }

            }
        }
        );
    } 
}

module.exports = ConnectionHandler
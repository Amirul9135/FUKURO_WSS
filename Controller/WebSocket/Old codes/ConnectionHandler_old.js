const jwt = require("jsonwebtoken");
const config = require("config");
const Node_ = require("../../../Model/Node_")
const bcrypt = require("bcryptjs")
const NodeMessageHandler = require("./Node/NodeOnMessage")
const AppMessageHandler = require("./App/AppOnMessage")
const NodeCloseHandler = require("./Node/NodeOnClose")
const AppCloseHandler = require("./App/AppOnClose")
const WsClients = require("./WsClient_old");


/*
this function evaluate the content of message on connection establishment
message should be in form of JSON
before establishing a websocket, user should first log in with their user account that have / root access and provide token in first message

example structure of first handshake message
{ 
    verify:{
        "nodeId":1,
        "passKey": "asdsdasdda"
        "jwt": "asdsadsad",
        "uid": 1,
        "client": "agent" / "app"
        "metric":{ //metric is only for app client to select what they will recieve in realtime
            cpu: 1,
            mem:1,
            disk:1,
            net:1,
        }
    }
}
client key differentiate from where the connection is being initiated

Each message sent must be in JSON with 
a main parent object that define the purpose or sender of the message such as
  -verify:{}  = sent once as handshake verification
  -agent:{}   = sent by agent  
  -app:{} = sent by app  
the messages will be redirected accordingly based on the parent json object
message that doesn't comply will be ignored
*/


module.exports = async function (ws, req, a) {
    ws.on('message', async function verifyClient(message) { 
        console.log("con")
        try {
            message = JSON.parse(message)
        } catch (e) {
            console.log("rejected: " + message)
            refuseConnection(ws, "invalid message content")
            return
        }
        //verification process
        if (message.hasOwnProperty("verify")) {
            message = message.verify
            console.log(message)
            if (message["client"]) {
                if (message.client != "agent" && message.client != "app") {
                    refuseConnection(ws, "client type invalid")
                }
            }
            else {
                refuseConnection(ws, "client type unspecified")
                return
            }
            if (!message["passKey"]) {
                refuseConnection(ws, "no pass key")
                return
            }
            var token = config.get("jwtHead") + "." + message.jwt
            var uid = message.uid
            var user

            //verif JWT and decode user info
            if (!global.jwts) {// kalau xde jwts xde sape2 penah login 
                refuseConnection(ws, "not logged in")
                return
            }
            if (!global.jwts.hasOwnProperty(uid)) {//kalau xde secret untuk id die user ni x penah login
                refuseConnection(ws, "not logged in")
                return
            }
            try {
                const decoded = jwt.verify(token, global.jwts[uid]);
                user = decoded.user;
            }
            catch (err) {
                refuseConnection(ws, "invalid token")
                return
            }

            //check user access to the node
            var nodeDetail = await Node_.findNode(message.nodeId, user.id).catch(function (err) {
                refuseConnection(ws, "cannot find node, please ensure you have access")
            })
            if (!nodeDetail)
                return

            //verify pass key 
            var passKeyMatch = await bcrypt.compare(message.passKey, nodeDetail.passKey)
            if (!passKeyMatch) {
                refuseConnection(ws, "invalid pass key")
                return
            }
            console.log("sini")
            if (message.client == "agent") {
                console.log("agent up")
                //agent client post verified action
                WsClients.saveClient(nodeDetail, ws)
                ws.on('close', () => NodeCloseHandler(ws))
                //console.log(ws)
                ws.on('message', (msg) => {NodeMessageHandler(ws,msg)})
               // ws.onmessage = NodeMessageHandler.bind(ws,message) 

                //potentially log agent up here
                //or notify users/owner

            }
            else if (message.client == "app") {
                //app client post verified action

                //check if requested node is online
                if (!WsClients.list[nodeDetail.nodeId]) {
                    refuseConnection(ws, "node is not connected to the server")
                    return
                }
                else {
                    if (!message.metric)
                        message.metric = {}
                    WsClients.addAppClient(nodeDetail.nodeId, user, ws, message.metric)
                    //notify node to switch to realtime
                    console.log('app client connected')
                    ws.on('close', () => AppCloseHandler(ws))
                    ws.on('message', (msg) => {AppMessageHandler(ws,msg)})
                    ws.send(JSON.stringify({message:"connected as app client"}))
                }
            }
        }
        else{ 

        }  
    } 
    );
}


function refuseConnection(ws, reason) {
    ws.send(JSON.stringify({ error: "Unable to connect: " + reason }))
    ws.close()
}
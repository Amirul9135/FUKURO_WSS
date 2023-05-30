const jwt = require("jsonwebtoken");
const config = require("config");
const Node_ = require("../../Model/Node_")
const bcrypt = require("bcryptjs")


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
    console.log("conn")
    /*
        var token = config.get("jwtHead") + "." + message.jwt
        var uid = message.uid;
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
        var nodeDetail = await Node_.findNode(message.nodeId, user.userId).catch(function (err) {
            refuseConnection(ws, "cannot find node, please ensure you have access")
        })
        if (!nodeDetail)
            return
    
        //verify pass key
        var passKeyMatch = await bcrypt.compare(nodeDetail.passKey, message.passKey)
        if (!passKeyMatch) {
            refuseConnection(ws, "invalid pass key")
            return
        }
    */
    // var isNode = message.client == "node"
    // var isApp = message.client == "app"
    //check connection from app/node 
    ws.on('message', message => {

        console.log(message)
        // if (isNode) {
        //      console.log("node")
        //node message action
        //   }
        //    if (isApp) {
        //     console.log("app")
        //app message action
        //  }

    });

    // onMessage(ws, message)
    ws.on('close', () => {
        // if (isNode) {

        //   }
        //  if (isApp) {

        //   }
        //  onClose(ws)
    })
}


function refuseConnection(ws, reason) {
    ws.send({ message: "Unable to connect: " + reason })
    ws.close()
}
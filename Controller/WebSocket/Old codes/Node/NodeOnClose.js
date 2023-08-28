
const WsClients = require("../WsClient_old");
module.exports = function onClose(ws) {

    //query db, notify node down 
    WsClients.removeAgentClient(ws)
    
}


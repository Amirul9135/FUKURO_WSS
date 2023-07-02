
const WsClients = require("../WsClient");
module.exports = function onClose(ws) {

    //query db, notify node down 
    WsClients.removeAgentClient(ws)
    
}


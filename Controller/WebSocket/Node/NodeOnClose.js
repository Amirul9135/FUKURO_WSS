
const WsClients = require("../../../Model/WsClient");
module.exports = function onClose(ws) {

    //query db, notify node down 
    WsClients.removeAgentClient(ws)
    
}



const WsClients = require("../../../Model/WsClient");
module.exports = function onClose(ws) {

    WsClients.removeAppClient(ws)
    
}


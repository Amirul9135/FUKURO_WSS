
const WsClients = require("../WsClient_old");
module.exports = function onClose(ws) {

    WsClients.removeAppClient(ws)
    
}


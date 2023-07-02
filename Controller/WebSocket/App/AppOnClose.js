
const WsClients = require("../WsClient");
module.exports = function onClose(ws) {

    WsClients.removeAppClient(ws)
    
}


const onMessage = require("./MessageHandler")
const onClose = require("./CloseHandler")


module.exports = function (ws, req) {
    ws.on('message', message => {
        onMessage(ws, message)
    });
    ws.on('close', () => {
        onClose(ws)
    })
}

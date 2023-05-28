


module.exports = function (ws, req) {
    ws.on('message', message => {
        ws.send("test");
    });
}

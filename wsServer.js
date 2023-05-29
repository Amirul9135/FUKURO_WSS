let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require("./server");
const jwtsCache = require('node-persist');
const verifyToken = require("./Controller/WebSocket/TokenAuth")

let wss = new WSServer({ //create web socket OVER http
    server: server
});
server.on('request', app);//mount app

wss.on('upgrade', (req, socket, head) => {
    if (verifyToken(req)) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    }
    else {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
})

wss.on('connection', require("./Controller/WebSocket/ConnectionHandler"));

server.listen(5000, async function () {
    await jwtsCache.init({
        dir: 'data/jwts',
        stringify: JSON.stringify,
        parse: JSON.parse,
    });;
    await jwtsCache.forEach(data => {
        if (!global.jwts)
            global.jwts = {};
        global.jwts[data.key] = data.value;
    });
    console.log("server Up");
})
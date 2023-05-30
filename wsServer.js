let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require("./server");
const jwtsCache = require('node-persist');

let wss = new WSServer({ //create web socket OVER http
    server: server
});
server.on('request', app);//mount app

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
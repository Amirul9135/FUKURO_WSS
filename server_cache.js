const storage = require('node-persist');
//persistant cache
module.exports = class ServerCache {
    mcache
    #path
    constructor(path) {
        this.#path = path
        this.mcache = storage;
        this.mcache.init({
            dir: this.#path,
            stringify: JSON.stringify,
            parse: JSON.parse,
        });;
    }

    async init() {
        await mcache.init({
            dir: this.#path,
            stringify: JSON.stringify,
            parse: JSON.parse,
        });;
    }

}
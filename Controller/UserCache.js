const Cache = require('node-persist');
//const ServerCache = require("../../server_cache") //class to access persistent cache
//const jwtsCache = new ServerCache('data/jwts') // instantiate cache object in data/jwts folder

class UserCache{
    #jwts = {}
    #persistentCache

    constructor(){ 
        this.#jwts = {} 
    }

    getUserToken(userId){ 
        return this.#jwts[userId]
    }

    async save(id,token){   
        this.#jwts[String(id)] = token
        await this.#persistentCache.setItem(String(id), token)  
    }

    async remove(id){
        delete this.#jwts[String(id)]
        await this.#persistentCache.removeItem(String(id)); 
    }

    async load(){ 
        console.log('load user cache')
        this.#persistentCache = Cache

        await this.#persistentCache.init({
            dir: 'data/jwts',
            stringify: JSON.stringify,
            parse: JSON.parse,
        });;   
        await this.#persistentCache.forEach(data => {  
           // console.log('cached user data',data)
            this.#jwts[data.key] = data.value;
        }); 
    }
}
 
// export an object instead of class to ensure all other code that
// require this file receive the same instance of caches
module.exports =  new UserCache()

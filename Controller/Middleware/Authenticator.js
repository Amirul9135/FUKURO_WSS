const UserCache = require("../UserCache")
const config = require("config");
const jwt = require("jsonwebtoken");

class Authenticator{
    #cache 
    constructor (){
        this.#cache = UserCache 
    }
   
    verifyJWT(uid, tokenPart){ 
        var token = config.get("jwtHead") + "." + tokenPart 
        if (!this.#cache.getUserToken(uid)) {//kalau xde secret untuk id die user ni x penah login
            console.log('user not found')
            return null
        }
        try { 
            const decoded = jwt.verify(token, this.#cache.getUserToken(uid));  
            return decoded.user;
        }
        catch (err) { 
            return null
        }
    }


    async logUser(uid,token){  
       await this.#cache.save(uid,token) 
    }
    async logoutUser(uid){
        await this.#cache.remove(uid)
    }

    authRequest(){
        return function (req, res, next) {
            if (!req.header('Authorization')) {
                return res.status(401).send("not logged in");
            }
            else {  
                var auth = new Authenticator()
                var valid = auth.verifyJWT(req.header('uid') , req.header('Authorization'))
                
                if(valid){
                    req.user = valid
                    return next();
                }
                else{
                    return res.status(401).json({ message: "Invalid Token" });
                }

            }

        }
    }
}

module.exports = Authenticator
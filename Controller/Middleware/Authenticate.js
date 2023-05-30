const config = require("config");
const jwt = require("jsonwebtoken");

class Authenticate {

    constructor() { }
    verifyJWT() {//user type integer in form of array 
        //validate previous checks from the req object and return response 
        return function (req, res, next) {
            if (!req.header('Authorization')) {
                return res.status(401).send("not logged in");
            }
            else {
                var token = config.get("jwtHead") + "." + req.header('Authorization')
                var uid = req.header('uid')
                if (!global.jwts) {// kalau xde jwts xde sape2 penah login 
                    return res.status(401).send("not logged in");
                }
                if (!global.jwts.hasOwnProperty(uid)) {//kalau xde secret untuk id die user ni x penah login
                    return res.status(401).send("not logged in");
                }
                try {
                    const decoded = jwt.verify(token, global.jwts[uid]);
                    req.user = decoded.user;
                    return next();
                }
                catch (err) {
                    console.log(err)
                    return res.status(401).json({ message: "Invalid Token" });
                }

            }

        }
    }
}
module.exports = new Authenticate;
const express = require('express')
const User = require("../../Model/User")
const router = express.Router()
const Validator = require("../Middleware/Validator")
const bcrypt = require("bcryptjs")
const ServerCache = require("../../server_cache")
const crypto = require("crypto")
const jwt = require("jsonwebtoken");
const jwtsCache = new ServerCache('data/jwts')
const Auth = require("../Middleware/Authenticate")

//mounted to /api/user

router.post("/", [
    Validator.checkString("name", "name is required"),
    Validator.checkString("username", "user name is required"),
    Validator.checkString("email", "email required"),
    Validator.checkString("password", { min: 6 }),
    Validator.checkString("phone", { min: 10, max: 11 }),
    Validator.checkString("pin", { min: 6, max: 6 }),
    Validator.validate()
], async function (req, res) {
    var reguser = new User(req.body)
    var salt = await bcrypt.genSalt(10)
    var hashed = await bcrypt.hash(reguser.getPassword(), salt)
    salt = await bcrypt.genSalt(10)
    var hashedPin = await bcrypt.hash(reguser.getPin(), salt)

    reguser.setPassword(hashed)
    reguser.setPin(hashedPin)
    reguser.register().then(function (value) {
        return res.status(200).send({ message: "registered" })
    }).catch(function (err) {
        if (err.errno == 1062) {
            return res.status(409).send({ message: "Username already in use" })
        }
        else {
            return res.status(500).send({ message: err.message })
        }
    })
})


router.post('/login',
    [
        function(req,res,next){
            console.log(req.body)
        next()},
        Validator.checkString("username", { min: 6 }, "username must be at least 6 character"),
        Validator.checkString("password", { min: 6 }, "password must be at least 6 character"),
        Validator.validate()
    ]
    , function (req, res) {
        var loginUser = new User(req.body)
        loginUser.login().then(async function (result) {
            var isMatch = await bcrypt.compare(loginUser.getPassword(), result.password)
            if (isMatch) {
                if (!global.jwts)//if no jwts yet initialize
                    global.jwts = {};
                var secret = ""
                if (global.jwts && global.jwts.hasOwnProperty(result.userId)) {
                    secret = global.jwts[result.userId] 
                }
                else{
                    secret = crypto.randomBytes(32).toString('hex');
                    global.jwts[result.userId] = secret;
                }
                console.log(secret)
                jwtsCache.mcache.setItem(String(result.userId), secret) 
                var payload = {
                    user: {
                        id: result.userId,
                        name: result.name,
                        username: result.username
                    }
                }
                jwt.sign(payload,
                    global.jwts[result.userId],
                    (err, token) => {
                        if (err) throw err
                        var fragment = token.toString().split('.');
                        return res.send({ token: fragment[1] + "." + fragment[2], uid: result.userId });
                    }
                );

            }
            else {
                return res.status(401).send({ message: "unauthorized" })
            }
        }).catch(function (err) {
            return res.status(401).send({ message: "unauthorized" })
        })

    })


router.put("/", [
    Auth.verifyJWT(),
    Validator.checkString("name", "name is required"),
    Validator.checkString("username", "user name is required"),
    Validator.checkString("email", "email required"),
    Validator.checkString("phone", { min: 10, max: 11 }),
    Validator.validate()
], async function (req, res) {
    var reguser = new User(req.body)
    reguser.setUserId(req.user.id)
    reguser.update().then(function (value) {
        return res.status(200).send({ message: "updated" })
    }).catch(function (err) {
        if (err.errno == 1062) {
            return res.status(409).send({ message: "Username already in use" })
        }
        else {
            return res.status(500).send({ message: err.message })
        }
    })
})

router.get("/", Auth.verifyJWT(), function (req, res) {
    User.findByUserId(req.user.id).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ message: err.message })
    })
})

router.get("/verify",[ (req,res,next)=>{
    console.log(req.header["Authorization"])
    next()
},Auth.verifyJWT()],function(req,res){
    console.log('verify')
    return res.status(200).send();
})

router.get("/logout",[
    Auth.verifyJWT()
], async  function(req,res){
   
    //remove the dyamic jwt secret of this user
    //all existing token will be invalid
    console.log("logout")
    await jwtsCache.mcache.removeItem(String(req.user.id)); 

    return res.status(200).send();
}
)
module.exports = router;

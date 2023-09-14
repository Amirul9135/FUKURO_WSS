const db = require("../Controller/Database")

module.exports = class User {
    userId
    name
    username
    password
    email
    phone
    pin
    deactivated

    async register() {
        let strSql = "INSERT INTO user(name,username,password,email,phone) VALUES "
            + "(:name:,:username:,:password:,:email:,:phone:)"
        let result = await db.queryParams(strSql, this)
        return result

    }

    async login() {
        let sql = "SELECT * FROM user WHERE username=:username: AND deactivated IS NULL"
        let result = await db.queryParams(sql, this)
        if (result)
            result = result[0]
        return result
    }

    async update() {
        let sql = "UPDATE user SET name=:name:, username=:username:, email=:email:, phone=:phone: "
            + " WHERE userId=:userId:"

        let result = await db.queryParams(sql, this)
        if (result)
            result = result.affectedRows
        return result
    }

    async findByUserId() {
        let strSQL = "SELECT name,username,email,phone,deactivated FROM user WHERE userId=:userId:"
        let result = await db.queryParams(strSQL, this)
        if (result)
            result = result[0]
        return result
    }

    // keys is array of string
    static findUser(nodeId, keys,access = false,userId=-1) {
        let keystring = "(";
        let first = true 
        console.log(keys)
        if(keys){
            
            keys.forEach(k => {
                console.log('k',k)
                if(first){
                    first = false;
                }
                else{
                    keystring += " AND "
                }
                keystring += "( u.name LIKE " + db.escape("%" + k + "%") 
                    + " OR u.email LIKE " + db.escape("%" + k + "%") 
                    + " OR u.phone LIKE " + db.escape("%" + k + "%") +" ) "
            });  
            keystring += ")"
        }
        console.log('keystring',keystring)
        let sql = "SELECT u.userId,u.name,u.email,u.phone FROM user u LEFT JOIN node_access a ON a.userId = u.userId AND a.nodeId=" + db.escape(nodeId)
            + " WHERE u.userId !=" + db.escape(userId)
        if(!access){
            sql += " AND a.accessId IS NULL "
        }
        else{
            sql += " AND a.accessId IS NOT NULL "
        }
        if(keys.length > 0){
            sql += " AND " +  keystring
        }
 
        return db.query(sql );

    }
    constructor(jObj = null) {
        if (jObj != null) {
            if (jObj.hasOwnProperty("userId")) {
                this.userId = jObj["userId"];
            }
            if (jObj.hasOwnProperty("name")) {
                this.name = jObj["name"];
            }
            if (jObj.hasOwnProperty("username")) {
                this.username = jObj["username"];
            }
            if (jObj.hasOwnProperty("password")) {
                this.password = jObj["password"];
            }
            if (jObj.hasOwnProperty("email")) {
                this.email = jObj["email"];
            }
            if (jObj.hasOwnProperty("phone")) {
                this.phone = jObj["phone"];
            }
            if (jObj.hasOwnProperty("pin")) {
                this.pin = jObj["pin"];
            }
            if (jObj.hasOwnProperty("deactivated")) {
                this.deactivated = jObj["deactivated"];
            }
        }
    }

}
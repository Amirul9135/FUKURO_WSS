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
        let strSql = "INSERT INTO user(name,username,password,email,phone,pin) VALUES "
            + "(:name:,:username:,:password:,:email:,:phone:,:pin:)"
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
    static findUser(nodeId, keys,access = false) {
        let keystring = "";
        let first = true
        keys.forEach(k => {
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
        let sql = "SELECT q.userId,q.name,q.email,q.phone FROM "
            + " (SELECT  u.userId,u.name,u.email,u.phone,nd.nodeId FROM user u "
            + " LEFT JOIN node_dir_access nda ON u.userId = nda.userId "
            + " LEFT JOIN node_dir nd ON nd.pathId = nda.pathId  AND nd.nodeId =" + db.escape(nodeId);
            console.log(sql)
            if (keystring.length > 0){
                sql += " WHERE " + keystring ;
            } 
            sql += " GROUP by  u.userId) q WHERE q.nodeId IS " +((access)? "NOT":"") + " NULL"
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
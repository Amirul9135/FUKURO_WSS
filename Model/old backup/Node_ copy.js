const db = require("../Controller/DBConn")

module.exports = class Node_ {
    #nodeId
    #name
    #description
    #ipAddress
    #passKey


    register() {
        var strSql = "INSERT INTO node(name,description,ipAddress,passKey) VALUES(" + db.escape(this.#name)
            + "," + db.escape(this.#description) + "," + db.escape(this.#ipAddress) + "," + db.escape(this.#passKey) + ")"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result.insertId)
                }
            })
        })
    }

    update() {
        var strSql = "UPDATE node SET name=" + db.escape(this.#name) + ",description="
            + db.escape(this.#description) + ",ipAddress=" + db.escape(this.#ipAddress) + ",passKey=" + db.escape(this.#passKey)
            + " WHERE nodeId=" + db.escape(this.#nodeId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ affected: result.affectedRows })
                }
            })
        })
    }

    static fetchConfigs(nodeId){
        var strSql = "SELECT * FROM node_config WHERE nodeId= " + db.escape(nodeId)
        console.log(strSql)

        return new Promise(function(resolve,reject){
            db.query(strSql,function(err,result){
                if(err){
                    return reject(err)
                }
                else{
                    return resolve(result)
                }
            })
        })
    }

    static findNode(nodeId, userId) {
        var strSQL = "SELECT n.nodeId,n.name,n.description,n.ipAddress,n.passKey FROM node n JOIN node_dir d ON n.nodeId=d.nodeId JOIN node_dir_access a ON a.pathId=d.pathId"
            + " WHERE n.nodeId=" + db.escape(nodeId) + " AND a.userId=" + db.escape(userId)
        return new Promise(function (resolve, reject) {
            db.query(strSQL, function (err, result) {
                if (err) {
                    return reject(err)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        return reject({ message: "no record" })
                    }
                    resolve(result[0])
                }
            })
        })
    }
    static findUserAccessibleNodes(userId) {
        var strSQL = "SELECT n.nodeId,n.name,n.description,n.ipAddress FROM node n JOIN node_dir d ON n.nodeId=d.nodeId JOIN node_dir_access a ON a.pathId=d.pathId"
            + " WHERE a.userId=" + db.escape(userId)
        return new Promise(function (resolve, reject) {
            db.query(strSQL, function (err, result) {
                if (err) {
                    return reject(err)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        return reject({ message: "no record" })
                    }
                    resolve(result)
                }
            })
        })
    }

    static findUserToNotify(userId,resourceType){
        var strSql = "SELECT userId FROM user_notification WHERE nodeId="+db.escape(userId)+" AND resourceType="+db.escape(resourceType)
        return new Promise(function(resolve,reject){
            db.query(strSql, function(err,result){
                if(err){
                    return reject(err)
                }
                else{
                    result = JSON.parse(JSON.stringify(result))
                    return resolve(result)
                }
            })
        })
    }

    constructor(jObj = null) {
        if (jObj != null) {
            if (jObj.hasOwnProperty("nodeId")) {
                this.#nodeId = jObj["nodeId"];
            }
            if (jObj.hasOwnProperty("name")) {
                this.#name = jObj["name"];
            }
            if (jObj.hasOwnProperty("description")) {
                this.#description = jObj["description"];
            }
            if (jObj.hasOwnProperty("ipAddress")) {
                this.#ipAddress = jObj["ipAddress"];
            }
            if (jObj.hasOwnProperty("passKey")) {
                this.#passKey = jObj["passKey"];
            }
        }
    }

    setNodeId(nodeId) {
        this.#nodeId = nodeId
    }
    getNodeId() {
        return this.#nodeId;
    }

    setName(name) {
        this.#name = name
    }
    getName() {
        return this.#name;
    }

    setDescription(description) {
        this.#description = description
    }
    getDescription() {
        return this.#description;
    }

    setIpAddress(ipAddress) {
        this.#ipAddress = ipAddress
    }
    getIpAddress() {
        return this.#ipAddress;
    }

    setPassKey(passKey) {
        this.#passKey = passKey
    }
    getPassKey() {
        return this.#passKey;
    }
}
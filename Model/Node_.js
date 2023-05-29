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
            db.query(strSql, function (result, err) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ id: result.insertId })
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


    constructor(jObj = null) {
        this.#nodeId = -1;
        this.#name = "";
        this.#description = "";
        this.#ipAddress = "";
        this.#passKey = "";
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
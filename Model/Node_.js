
const db = require("../Controller/Database")

module.exports = class Node_ {
    nodeId
    name
    description
    passKey
    configs


    async register() {
        let strSql = "INSERT INTO node(name,description,passKey) VALUES(:name:,:description:,:passKey:)"
        let result = await db.queryParams(strSql, this)
        if(result)
            this.nodeId = result.insertId
        return result
    }

    async update(userId) {
        let strSql = " UPDATE node n JOIN node_dir nd ON n.nodeId=nd.nodeId "
                    + " JOIN node_dir_access nda ON nda.pathId=nd.pathId "
                    + " SET name=:name:,description=:description: " 
                     + " WHERE n.nodeId=:nodeId: AND nda.userId=" + db.escape(userId)
        let result = await db.queryParams(strSql, this)
        if (result)
            result = result.affectedRows
        return result
    }

    async loadConfigs() {
        let strSql = "SELECT * FROM node_config WHERE nodeId=:nodeId:"
        this.configs = await db.queryParams(strSql, this)
    }

    //used to get node detail only if user have access 
    static async findNode(nodeId, userId) {
        var strSQL = "SELECT n.nodeId,n.name,n.description,n.passKey FROM node n JOIN node_dir d ON n.nodeId=d.nodeId JOIN node_dir_access a ON a.pathId=d.pathId"
            + " WHERE n.nodeId=" + db.escape(nodeId) + " AND a.userId=" + db.escape(userId)
        let result = await db.query(strSQL) 
        if(result.length !=0)
            return result[0]
        else
            throw new Error("User have no access to node or the node doesn't exist") 
    }
    

    static findUserAccessibleNodes(userId) {
        var strSQL = "SELECT n.nodeId,n.name,n.description FROM node n JOIN node_dir d ON n.nodeId=d.nodeId JOIN node_dir_access a ON a.pathId=d.pathId"
            + " WHERE a.userId=" + db.escape(userId) 
        return db.query(strSQL)
    }
/* not here
    static findUserToNotify(userId, resourceType) {
        var strSql = "SELECT userId FROM user_notification WHERE nodeId=" + db.escape(userId) + " AND resourceType=" + db.escape(resourceType)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    return reject(err)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    return resolve(result)
                }
            })
        })
    }*/

    constructor(jObj = null) {
        if (jObj != null) {
            if (jObj.hasOwnProperty("nodeId")) {
                this.nodeId = jObj["nodeId"];
            }
            if (jObj.hasOwnProperty("name")) {
                this.name = jObj["name"];
            }
            if (jObj.hasOwnProperty("description")) {
                this.description = jObj["description"];
            } 
            if (jObj.hasOwnProperty("passKey")) {
                this.passKey = jObj["passKey"];
            }
        }
    }
}
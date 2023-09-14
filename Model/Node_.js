
const db = require("../Controller/Database")
const NodeConfig = require("./NodeConfig")

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
        if(await Node_.isAdmin(userId,this.nodeId)){
            let sql = "UPDATE node SET  name=:name:,description=:description: "
                    +" WHERE nodeId=:nodeId:"
            let result = await db.queryParams(sql, this)
            if (result)
                result = result.affectedRows
            return result
        }
        else{
            throw Error("Unauthorized to update node details")
        }  
    }

    async loadConfigs() {
        let strSql = "SELECT * FROM node_config WHERE nodeId=:nodeId:"
        this.configs = await db.queryParams(strSql, this)
    }

    //used to get node detail only if user have access 
    static async findNode(nodeId, userId) {
        let sql = "SELECT n.*,a.accessId FROM node_access a JOIN node n ON n.nodeId=a.nodeId "
            + " WHERE n.nodeId=" + db.escape(nodeId) + " AND a.userId=" + db.escape(userId) 
        let result = await db.query(sql) 
        if(result.length !=0)
            return result[0]
        else
            throw new Error("User have no access to node or the node doesn't exist") 
    }
    
    //role  1= admin, 2-collaborator, 3-guest
    static async grantAccess(granter, userId,nodeId,role){
        if(! await Node_.isAdmin(granter,nodeId)){ 
            throw Error("Unauthorized, only admin user can manage others' access")
        } 
        return db.query("INSERT INTO node_access(nodeId,userId,accessId) VALUES(" 
        + db.escape(nodeId) + "," + db.escape(userId) + "," + db.escape(role) 
        + ")  ON DUPLICATE KEY UPDATE accessId = VALUES(accessId)")
    }
    static async grantAccessToCreator(userId,nodeId){
        return db.query("INSERT INTO node_access(nodeId,userId,accessId) VALUES(" 
        + db.escape(nodeId) + "," + db.escape(userId) + "," + db.escape(1) 
        + ")  ON DUPLICATE KEY UPDATE accessId = VALUES(accessId)")
    }

    static async getAccess(userId,nodeId){
        let sql = "SELECT accessId FROM node_access WHERE userId=" + db.escape(userId) + " AND nodeId=" + db.escape(nodeId)
        let result = await db.query(sql)
        if(result){
            result = result[0]
        }
        return result;
    }

    static async isAdmin(userId,nodeId){
        let access = await Node_.getAccess(userId,nodeId)
        console.log('isadmin',access)
        if(access && access['accessId'] == 1){
            return true;
        }else{
            return false;
        }
    } 

    static async removeAccess(granter,userId,nodeId){
        console.log('nid',nodeId)
        if(! await Node_.isAdmin(granter,nodeId)){ 
            throw Error("Unauthorized, only admin user can manage others' access")
        } 
        console.log('nid',nodeId)
        //remove dari access
        let sql = "DELETE FROM node_access WHERE userId=" + db.escape(userId) + " AND nodeId=" + db.escape(nodeId)

        let res = await db.query(sql)
        if(res){
            //clear threhold    
           await db.query("DELETE FROM notification_config WHERE nodeId="+db.escape(nodeId)+" AND userId="+db.escape(userId))
        }
        return res;
    }

    static findUserAccessibleNodes(userId) {
        let sql = "SELECT n.nodeId,n.name,n.description,a.accessId FROM node n JOIN node_access a ON a.nodeId = n.nodeId "
            + " WHERE a.userId=" + db.escape(userId)  
        return db.query(sql)
    }

    static findAllAssociatedUser(nodeId){
        let sql = "SELECT DISTINCT userId FROM node_access WHERE nodeId="+ db.escape(nodeId) 
        return db.query(sql);
    }

    static findUserByThreshold(nodeId,notId,value){
        let sql = "SELECT DISTINCT userId FROM notification_config WHERE notId = " + db.escape(notId)
            + " AND nodeId = " +db.escape(nodeId)+ " AND value <= " + db.escape(value)
        return db.query(sql);
    } 

    static logActivity(nodeId,desc,userId){
        let sql ="INSERT INTO node_log (nodeId,log,userId) VALUES "
            + " (" + db.escape(nodeId) + "," + db.escape(desc) + "," + db.escape(userId) + ") "
        return db.query(sql)
    }

    static nodeLogFrom(nodeId,dateFrom){
        let sql = "SELECT * FROM node_log WHERE nodeId=" + db.escape(nodeId) + " AND dateTime >= " + db.escape(db.toLocalSQLDateTime(dateFrom))
        return db.query(sql)
    }

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
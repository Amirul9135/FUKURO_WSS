const db = require("../Controller/Database")
const Node_ = require("./Node_")
class NodeConfig {

    static updateConfig(nodeId, configId, value, userId) {
        var strSql = "INSERT INTO node_config (nodeId, configId, value) "
            + " VALUES ("+ db.escape(nodeId) + ", " + db.escape(configId) + ", " + db.escape(value) +")"  
            + " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return db.query(strSql)
    }

    // method to update configuration in node_config table multiple value
    // @params
    // nodeId
    // userId to check user has authority
    // configurations must be array of object {configId:0,val:numericalvalue}
    static async updateConfigs(nodeId, configurations) { 

        let strSql = "INSERT INTO node_config (nodeId,configId,value) VALUES "
        configurations.forEach(conf => {
            strSql += " (" + db.escape(nodeId) + "," + db.escape(conf.configId) + "," + db.escape(conf.val) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1);
        strSql += " ON DUPLICATE KEY UPDATE value=VALUES(value) "
        return db.query(strSql)
    }

    // method to remove configuration in node_config table multiple records
    // @params
    // nodeId
    // userId to check user has authority
    // configurations must be array of id [1,1,2,3] etc
    static async removeConfigs(nodeId, configurations) {
        if (configurations.length < 1) {
            return
        }    
        let strSql = "DELETE FROM node_config WHERE nodeId=" + db.escape(nodeId) + " AND configId IN ("
        configurations.forEach(conf => {
            strSql += db.escape(conf) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)
    }

    static removeConfig(nodeId, configId) {
        let sql = "DELETE FROM node_config WHERE nodeId="+ db.escape(nodeId) +" AND configId="+ db.escape(configId) 
        return db.query(sql)
    }

    static enableNotification(nodeId, notId, userId, value) {
        let sql = "INSERT INTO notification_config (nodeId,notId,userId,value) "
            + " VALUES(" + db.escape(nodeId) + "," + db.escape(notId) + "," + db.escape(userId) + "," + db.escape(value)+ ") "
            + " ON DUPLICATE KEY UPDATE value = VALUES(value) " 
        return db.query(sql)
    }

    static disableNotification(nodeId, notId, userId) {
        var strSql = "DELETE FROM notification_config WHERE "
            + " nodeId=" + db.escape(nodeId) + " AND notId=" + db.escape(notId) + " AND userId=" + db.escape(userId)
        return db.query(strSql)
    }

    // ids is array of integers of configurable id
    static async getThreshold(nodeId, ids) {
        var strSql = "SELECT DISTINCT notId,value from notification_config WHERE nodeId="
            + db.escape(nodeId) + " AND notId IN("
        ids.forEach(id => {
            strSql += db.escape(id) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ") ";
        let result = await db.query(strSql)
        return result
    }

    //configs is array of id [1,2,3]
    static async getConfigs(nodeId, userId,configs ) {

        await Node_.findNode(nodeId, userId) // ensure user have connection with node being configured
        return NodeConfig.getConfigsDirect(nodeId,configs)
    }

       //configs is array of id [1,2,3] not secured version only for internal uses
    static async getConfigsDirect(nodeId,configs ) { 
        var strSql = "SELECT configId,value FROM node_config WHERE nodeId= " + db.escape(nodeId)
            + " AND configId IN("
        configs.forEach(conf => {
            strSql += db.escape(conf) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)
    }

    // ids is array of id
    static async getNotificationConfigs(nodeId, userId, ids) {
        let strSql = "SELECT notId,value FROM notification_config "
            + " WHERE userId=" + db.escape(userId) + " AND nodeId=" + db.escape(nodeId)
            + " AND notId IN ("
        ids.forEach(id => {
            strSql += db.escape(id) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)

    } 
 


    //specs is array of object {specId,value} where id conforms to fukuro standard
    static async updateSpecs(nodeId,specs){
        let strsql= "INSERT INTO node_spec (nodeId,specId,value) VALUES "
        specs.forEach(s=>{
            strsql += " (" + db.escape(nodeId) + "," + db.escape(s.specId) + ", " + db.escape(s.value) + "),"
        })
        strsql = strsql.substring(0, strsql.length - 1);
        strsql += " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return db.query(strsql)
    }
 
    static async getNodeSpec(nodeId){ 
        let sql = "SELECT  specId,value FROM node_spec WHERE nodeId="+db.escape(nodeId)
        return db.query(sql);
    }

    //value example { sda: 26214400, sda1: 512, sda2: 262656, sda3: 25950208 }
    static async updateDisk(nodeId,value){
        

        let strSql = "INSERT into node_disk(nodeId,name,size,used) VALUES "
        let nameString = ""
        Object.keys(value).forEach(k=>{
            strSql += "("+ db.escape(nodeId) + "," + db.escape(k) +"," + db.escape(value[k].size) +"," + db.escape(value[k].used) + "),"
            nameString += db.escape(k) + ","
        })
        if(nameString.length > 0){
            nameString = nameString.substring(0, strSql.length - 1) 
        }
        
        await db.query("DELETE FROM node_disk WHERE nodeId="+db.escape(nodeId) + " AND name NOT IN(" +nameString+ ")").catch((err)=>{
            console.log("Error flushing disk")
        }) 
        strSql = strSql.substring(0, strSql.length - 1) + " ON DUPLICATE KEY UPDATE size = VALUES(size),used =VALUES(used) "
        return db.query(strSql)

    }

    static async fetchDisksToMonitor(nodeId){
        let strSql = 'SELECT * FROM node_disk WHERE nodeId=' + db.escape(nodeId) + " AND monitor = 1"
        return db.query(strSql)
    }

    static async fetchAllDisk(nodeId){
        let strSql = 'SELECT * FROM node_disk WHERE nodeId=' + db.escape(nodeId)  
        return db.query(strSql)
    }

    static async updateDiskStat(nodeId,dname,monitor){
        let val = 0
        if(monitor)
            val =1
        let strSql = 'UPDATE node_disk SET monitor=' + db.escape(val) 
        + " WHERE nodeId="+ db.escape(nodeId)   + " AND name=" + db.escape(dname)
        return db.query(strSql)
    }

    static async clearNotification(nodeId,userId){
        let sql = "DELETE FROM notification_config WHERE nodeId="+db.escape(nodeId)+" AND userId="+db.escape(userId)
        return db.query(sql)

    }
} 
module.exports = NodeConfig
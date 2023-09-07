const db = require("../Controller/Database")
const Node_ = require("./Node_")
class NodeConfig {

    static updateConfig(nodeId, configId, value, userId) {
        var strSql = "INSERT INTO node_config (nodeId, configId, value) "
            + " SELECT  " + db.escape(nodeId) + ", " + db.escape(configId) + ", " + db.escape(value)
            + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId=" + db.escape(userId) + " LIMIT 1 "
            + " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return db.query(strSql)
    }

    // method to update configuration in node_config table multiple value
    // @params
    // nodeId
    // userId to check user has authority
    // configurations must be array of object {configId:0,val:numericalvalue}
    static async updateConfigs(nodeId, userId, configurations) {
        // check access
        await Node_.findNode(nodeId, userId) // ensure user have connection with node being configured
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
    static async removeConfigs(nodeId, userId, configurations) {
        if (configurations.length < 1) {
            return
        }
        await Node_.findNode(nodeId, userId)  // ensure user have connection with node being configured
        let strSql = "DELETE FROM node_config WHERE nodeId=" + db.escape(nodeId) + " AND configId IN ("
        configurations.forEach(conf => {
            strSql += db.escape(conf) + ","
        });
        strSql = strSql.substring(0, strSql.length - 1) + ")";
        return db.query(strSql)
    }

    static removeConfig(nodeId, configId, userId) {
        var strSQL = "DELETE nc FROM node_config nc "
            + " JOIN node_dir nd ON nd.nodeId=nc.nodeId JOIN node_dir_access nda ON nda.pathId=nd.pathId"
            + " WHERE nc.nodeId=" + db.escape(nodeId) + " AND nc.configId=" + db.escape(configId) + " AND nda.userId=" + db.escape(userId)
        return db.query(strSQL)
    }

    static enableNotification(nodeId, notId, userId, value) {
        var strSql = "INSERT INTO notification_config (nodeId, notId, userId,value) "
            + " SELECT  " + db.escape(nodeId) + ", " + db.escape(notId) + ", " + db.escape(userId) + "," + db.escape(value)
            + " FROM node_dir_access nda JOIN node_dir nd ON nda.pathId=nd.pathId WHERE nda.userId=" + db.escape(userId) + " LIMIT 1 "
            + " ON DUPLICATE KEY UPDATE value = VALUES(value) "
        return db.query(strSql)

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

    static async updateSpec(nodeId,specId,value,dateTime=null){
        if(dateTime){
            dateTime = db.escape(dateTime)
        }
        else{
            dateTime = "NOW()"
        }
        var strSql = "INSERT INTO node_spec (nodeId, specId, dateTime, value) " 
            + " SELECT  " + db.escape(nodeId) + ", " + db.escape(specId) + ", " + dateTime + ", " + db.escape(value) // value in select
            + " FROM (SELECT 1) AS dummy " //dummy row as placeholder 1 fixed row
            + " LEFT JOIN (SELECT value FROM node_spec WHERE specId="+db.escape(specId)+" ORDER BY dateTime DESC LIMIT 1) AS latest" // left join with latest config row
            + " ON latest.value = " + db.escape(value) // join condition use value equal value being inserted
            + " WHERE latest.value IS NULL "  // if latest value joined not null means it is equal if not is null insert will happen since 1 row with the data in the dummy select
        return db.query(strSql) 
    }

    static async getNodeSpec(nodeId){
        let sql = "SELECT MAX(dateTime) as dateTime, specId,value FROM node_spec WHERE nodeId="+db.escape(nodeId)+" GROUP by specId"
        return db.query(sql);
    }

    //value example { sda: 26214400, sda1: 512, sda2: 262656, sda3: 25950208 }
    static async updateDisk(nodeId,value){
        let strSql = "INSERT into node_disk(nodeId,name,size,used) VALUES "
        Object.keys(value).forEach(k=>{
            strSql += "("+ db.escape(nodeId) + "," + db.escape(k) +"," + db.escape(value[k].size) +"," + db.escape(value[k].used) + "),"
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
} 
module.exports = NodeConfig
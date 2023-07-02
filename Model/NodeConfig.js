const db = require("../Controller/DBConn") 

module.exports = class NodeConfig{
    static updateConfig(nodeId,resourceType,value){
        var strSql = "INSERT INTO node_config (nodeId, configId, value) "
        + " VALUES (" +db.escape(nodeId)+ ", " +db.escape(resourceType)+ ", " +db.escape(value)+ ") "
        + " ON DUPLICATE KEY UPDATE value = VALUES(value)"
        return new Promise(function(resolve,reject){
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve()
                }
            })
        })

    }  
}
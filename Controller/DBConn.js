
var mysql = require('mysql');
var pool = mysql.createPool({
    //untuk developement part ni kene make sure kat phpmyadmin match name
    host: "localhost",
    user: "root",
    password: "",
    database: "fukurodb" //db name
});

pool.getConnection((err, connection) => {
    if (err)
        throw err;
    console.log('Database connected successfully');
    connection.release();
});

module.exports = pool; 
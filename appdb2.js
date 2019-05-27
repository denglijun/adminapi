const mysql = require('mysql');
const async = require('async');

const pool = mysql.createPool({
    host: '172.19.229.101',
    port: '3306',
    user: 'root',
    password: 'WENhuai2158~!@',
    database: 're_dev'
});

let query = function(sql, values, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err)
            callback(err)
        } else {
            console.log('connected success');
            connection.query(sql, values, (err, rows) => {
                if (err) {
                    console.log(err)
                    callback(err)
                } else {
                    callback(err, rows)
                }
                connection.release()
            })
        }
    })

};

let execTrans = function(sqlparamsEntities, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return callback(err, null);
        }
        connection.beginTransaction(function(err) {
            if (err) {
                return callback(err, null);
            }
            console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
            var funcAry = [];
            sqlparamsEntities.forEach(function(sql_param) {
                var temp = function(cb) {
                    var sql = sql_param.sql;
                    var param = sql_param.params;
                    connection.query(sql, param, function(tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function() {
                                console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                throw tErr;
                            });
                        } else {
                            return cb(null, rows);
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function(err, result) {
                console.log("transaction error: " + err);
                if (err) {
                    connection.rollback(function(err) {
                        console.log("transaction error: " + err);
                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function(err, info) {
                        console.log("transaction info: " + JSON.stringify(info));
                        if (err) {
                            console.log("执行事务失败，" + err);
                            connection.rollback(function(err) {
                                console.log("transaction error: " + err);
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, info);
                        }
                    })
                }
            })
        });
    });
}

// let _getNewSqlParamEntity = function(sql, params, callback) {
//     if (callback) {
//         return callback(null, {
//             sql: sql,
//             params: params
//         });
//     }
//     return {
//         sql: sql,
//         params: params
//     };
// }

module.exports = {
    query,
    execTrans
}
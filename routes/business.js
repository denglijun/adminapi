const router = require('koa-router')();
const Wifi = require('../models').wifi;
const sequelize = require('../models').sequelize;
// const con = require('../appdb2'); //服务器测试库
// const con = require('../appdb4'); //服务器正式库
const con = require('../appdb3')(); //本地
const moment = require('moment');
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const crypto = require('crypto');


router.prefix('/business');

router.get('/getWifi', async(ctx, next) => {
    let uid = ctx.query.uid;
    let ssid = ctx.query.ssid;

    let re = await new Promise((resolve, reject) => {
        con.query('select user_wifi.`*`,users.tel from user_wifi inner join users on user_wifi.user_id = users.id where user_id=? and ssid=?', [uid, ssid], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result[0]
                });
            }
        });
    });
    console.log(re);
    ctx.response.body = re;


});
router.get('/wifilist', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        var re = await new Promise((resolve, reject) => {
            con.query('select count(user_id) as num from user_wifi', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select user_wifi.`*`,users.tel from user_wifi inner join users on user_wifi.user_id = users.id order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let connectnum = parseInt(result[index].ok_counter) + parseInt(result[index].fail_counter);
                                    if (connectnum > 0) {
                                        result[index].successRate = Math.round(parseFloat(result[index].ok_counter) / parseFloat(connectnum) * 10000) / 100.00 + "%";
                                    } else {
                                        result[index].successRate = '0%';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })

        })
    } else {
        var re = await new Promise((resolve, reject) => {
            con.query('select count(user_id) as num from user_wifi inner join users on user_wifi.user_id = users.id where tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select user_wifi.`*`,users.tel from user_wifi inner join users on user_wifi.user_id = users.id where tel=? order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })

        })
    }

    ctx.response.body = re;
});
router.post('/wifiAdd', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let re = await new Promise((resolve, reject) => {
        con.query(' select id from `users` where `tel`= ? ', [paramlist.tel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                if (result.length > 0) {
                    con.query('INSERT INTO `user_wifi` (`user_id`,`ssid`,`password`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?)', [result[0].id, paramlist.ssid, paramlist.password, time, time], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '操作成功',
                                data: ''
                            });
                        }
                    });
                } else {
                    resolve({
                        code: 10001,
                        msg: '用户不存在',
                        data: ''
                    })
                }
            }

        });

    });
    ctx.response.body = re;

});
router.post('/wifiUpdate', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let ver = parseInt(paramlist.version) + 1;
    let re = await new Promise((resolve, reject) => {
        con.query('update user_wifi set password = ?,version = ? where user_id = ? and ssid = ? and version = ?', [paramlist.password, ver, paramlist.user_id, paramlist.ssid, paramlist.version], function(err, result) {
            console.log(err);
            if (err) {
                resolve({
                    code: 10005,
                    msg: '更新失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '更新成功',
                    data: ''
                });
            }
        });
    })
    ctx.response.body = re;

});
router.get('/wifiDelete', async(ctx, next) => {
    let uid = ctx.query.user_id;
    let ssid = ctx.query.ssid;
    let re = await new Promise((resolve, reject) => {
        con.query('delete from user_wifi where user_id=? and ssid=?', [uid, ssid], function(err, result) {
            if (err) {
                resolve({
                    code: 10003,
                    msg: '操作失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '删除成功',
                    data: ''
                });
            }
        });
    })
    ctx.response.body = re;
});

/**
 * 客服管理  
 */

router.get('/getCustomer', async(ctx, next) => {
    let uid = ctx.query.id;
    let re = await new Promise((resolve, reject) => {
        con.query('select * from users where id=?', [uid], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                result[0].birthday = moment(result[0].birthday).format('YYYY-MM-DD');
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result[0]
                });
            }
        });
    });
    console.log(re);
    ctx.response.body = re;
});
router.get('/customerList', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        var re = await new Promise((resolve, reject) => {
            con.query('select count(id) as num from users where role=8', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select * from users where role=8 order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    result[index].birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                }
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })

        })
    } else {
        var re = await new Promise((resolve, reject) => {
            con.query('select * from users where tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        code: 200,
                        records: result,
                        total: 1
                    });
                }
            })
        })
    }

    ctx.response.body = re;
});
router.post('/customerAdd', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let pwd = paramlist.tel + paramlist.password;
    pwd = crypto.createHash('MD5').update(pwd, 'utf-8').digest('hex');
    console.log(paramlist);
    let re = await new Promise((resolve, reject) => {
        con.query(' select id from `users` where `tel`= ? ', [paramlist.tel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                if (result.length < 1) {
                    con.query('INSERT INTO `users` (`tel`,`name`,`gender`,`avatar`,`password`,`role`,`birthday`,`address`,`eyesight`,`service`,`auth`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [paramlist.tel, paramlist.name, paramlist.gender, '', pwd, 8, paramlist.birthday, paramlist.address, paramlist.eyesight, 0, 0, time, time], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '操作成功',
                                data: ''
                            });
                        }
                    });
                } else {
                    resolve({
                        code: 10007,
                        msg: '该手机号已注册',
                        data: ''
                    })
                }
            }

        });

    });
    ctx.response.body = re;

});
router.post('/customerUpdate', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let re = await new Promise((resolve, reject) => {
        con.query("select id from users where id!=? and tel=?", [paramlist.id, paramlist.tel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                if (result.length > 0) {
                    resolve({
                        code: 10007,
                        msg: '手机号已存在',
                        data: ''
                    });
                } else {
                    con.query('update users set name = ?,tel = ?,gender=?,birthday=?,address=?,eyesight=? where id = ?', [paramlist.name, paramlist.tel, paramlist.gender, paramlist.birthday, paramlist.address, paramlist.eyesight, paramlist.id], function(err, result) {
                        console.log(err);
                        if (err) {
                            resolve({
                                code: 10005,
                                msg: '更新失败',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '更新成功',
                                data: ''
                            });
                        }
                    });
                }
            }
        })
    })
    ctx.response.body = re;

});
router.get('/customerDelete', async(ctx, next) => {
    let uid = ctx.query.id;
    let re = await new Promise((resolve, reject) => {
        con.query('delete from users where id=?', [uid], function(err, result) {
            if (err) {
                resolve({
                    code: 10003,
                    msg: '操作失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '删除成功',
                    data: ''
                });
            }
        });
    });
    ctx.response.body = re;
});

router.post('/updateCustomerPwd', async(ctx, next) => {
    let id = ctx.request.body.id;
    let pwd = ctx.request.body.tel + ctx.request.body.password;
    pwd = crypto.createHash('MD5').update(pwd, 'utf-8').digest('hex');
    let re = await new Promise((resolve, reject) => {
        con.query('update users set password=? where id=?', [pwd, id], function(err, result) {
            if (err) {
                resolve({
                    code: 10003,
                    msg: '操作失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 10008,
                    msg: '密码更新成功',
                    data: ''
                });
            }
        });
    });
    ctx.response.body = re;
});

/**
 * 盲人管理 
 */
router.get("/blindList", async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        var re = await new Promise((resolve, reject) => {
            con.query('select count(id) as num from users where role=1', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select * from users where role=1 order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    result[index].birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                }
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })

        })
    } else {
        var re = await new Promise((resolve, reject) => {
            con.query('select * from users where tel=? and role=1', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        code: 200,
                        records: result,
                        total: 1
                    });
                }
            })
        })
    }

    ctx.response.body = re;
});
router.get("/getBlind", async(ctx, next) => {
    let uid = ctx.query.id;
    let re = await new Promise((resolve, reject) => {
        con.query('select * from users where id=?', [uid], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                result[0].birthday = moment(result[0].birthday).format('YYYY-MM-DD');
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result[0]
                });
            }
        });
    });
    console.log(re);
    ctx.response.body = re;
});

router.post("/updateBlind", async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let re = await new Promise((resolve, reject) => {
        con.query('update users set name = ?,gender=?,birthday=?,address=?,eyesight=? where id = ?', [paramlist.name, paramlist.gender, paramlist.birthday, paramlist.address, paramlist.eyesight, paramlist.id], function(err, result) {
            console.log(err);
            if (err) {
                resolve({
                    code: 10005,
                    msg: '更新失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '更新成功',
                    data: ''
                });
            }
        });
    });
    ctx.response.body = re;
});

router.post('/blindAdd', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let pwd = paramlist.tel + paramlist.password;
    pwd = crypto.createHash('MD5').update(pwd, 'utf-8').digest('hex');
    console.log(paramlist);
    let re = await new Promise((resolve, reject) => {
        con.query(' select id from `users` where `tel`= ? ', [paramlist.tel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                if (result.length < 1) {
                    con.query('INSERT INTO `users` (`tel`,`name`,`gender`,`avatar`,`password`,`role`,`birthday`,`address`,`eyesight`,`service`,`auth`,`test`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [paramlist.tel, paramlist.name, paramlist.gender, '', pwd, 1, paramlist.birthday, paramlist.address, paramlist.eyesight, 0, 0, 4, time, time], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '操作成功',
                                data: ''
                            });
                        }
                    });
                } else {
                    resolve({
                        code: 10007,
                        msg: '该手机号已注册',
                        data: ''
                    })
                }
            }

        });

    });
    ctx.response.body = re;
});

/**
 * 用户管理 
 */
router.get("/userList", async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        var re = await new Promise((resolve, reject) => {
            con.query('select count(id) as num from users', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select * from users order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    result[index].birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    if (result[index].role == 1) {
                                        result[index].role = '视友';
                                    }
                                    if (result[index].role == 2) {
                                        result[index].role = '亲友';
                                    }
                                    if (result[index].role == 4) {
                                        result[index].role = '志愿者';
                                    }
                                    if (result[index].role == 8) {
                                        result[index].role = '客服';
                                    }
                                    if (result[index].gender == 0) {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == 1) {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == 2) {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })

        })
    } else {
        var re = await new Promise((resolve, reject) => {
            con.query('select * from users where tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        result[index].birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        if (result[index].role == 1) {
                            result[index].role = '视友';
                        }
                        if (result[index].role == 2) {
                            result[index].role = '亲友';
                        }
                        if (result[index].role == 4) {
                            result[index].role = '志愿者';
                        }
                        if (result[index].role == 8) {
                            result[index].role = '客服';
                        }
                        if (result[index].gender == 0) {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == 1) {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == 2) {
                            result[index].gender = '女';
                        }
                    }
                    resolve({
                        code: 200,
                        records: result,
                        total: 1
                    });
                }
            })
        })
    }

    ctx.response.body = re;
});
router.get("/getUser", async(ctx, next) => {
    let uid = ctx.query.id;
    let re = await new Promise((resolve, reject) => {
        con.query('select * from users where id=?', [uid], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                result[0].birthday = moment(result[0].birthday).format('YYYY-MM-DD');
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result[0]
                });
            }
        });
    });
    console.log(re);
    ctx.response.body = re;
});

router.post("/updateUser", async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let re = await new Promise((resolve, reject) => {
        con.query('update users set name = ?,gender=?,birthday=?,address=?,eyesight=?,role=? where id = ?', [paramlist.name, paramlist.gender, paramlist.birthday, paramlist.address, paramlist.eyesight, paramlist.role, paramlist.id], function(err, result) {
            console.log(err);
            if (err) {
                resolve({
                    code: 10005,
                    msg: '更新失败',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '更新成功',
                    data: ''
                });
            }
        });
    });
    ctx.response.body = re;
});

router.post('/userAdd', async(ctx, next) => {
    let paramlist = ctx.request.body.params;
    let pwd = paramlist.tel + paramlist.password;
    pwd = crypto.createHash('MD5').update(pwd, 'utf-8').digest('hex');
    console.log(paramlist);
    let re = await new Promise((resolve, reject) => {
        con.query(' select id from `users` where `tel`= ? ', [paramlist.tel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                if (result.length < 1) {
                    con.query('INSERT INTO `users` (`tel`,`name`,`gender`,`avatar`,`password`,`role`,`birthday`,`address`,`eyesight`,`service`,`auth`,`test`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [paramlist.tel, paramlist.name, paramlist.gender, '', pwd, paramlist.role, paramlist.birthday, paramlist.address, paramlist.eyesight, 0, 0, 4, time, time], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '操作成功',
                                data: ''
                            });
                        }
                    });
                } else {
                    resolve({
                        code: 10007,
                        msg: '该手机号已注册',
                        data: ''
                    })
                }
            }

        });

    });
    ctx.response.body = re;

});

router.get('/wallets', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let re = {};
    if (key == '' || typeof(key) == 'undefined') {
        re = await new Promise((resolve, reject) => {
            con.query('select count(ba.user_id) as num from `blind_account` as ba left join `users` as u on ba.user_id=u.id where u.role=1', [], function(err, result) {
                console.log(err);
                console.log(result);
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].num > 0) {
                        let total = result[0].num;
                        con.query('select u.tel,u.name,u.role,ba.* from `blind_account` as ba left join `users` as u on ba.user_id=u.id where u.role=1 limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                resolve({
                                    code: 200,
                                    records: result,
                                    total: total
                                });
                            }
                        })
                    }
                }

            })
        });
    } else {
        re = await new Promise((resolve, reject) => {
            con.query('select u.tel,u.name,u.role,ba.* from `blind_account` as ba left join `users` as u on ba.user_id=u.id where u.role=1 and u.tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        code: 200,
                        records: result,
                        total: 1
                    });
                }
            })
        })
    }

    ctx.response.body = re;
});

router.post('/charge', async(ctx, next) => {
    let re = {};
    let chargeTel = ctx.request.body.params.tel;
    let chargeId = ctx.request.body.params.chargeId; //充值套餐id
    let user = await new Promise((resolve, reject) => {
        con.query('select * from users where tel=? and role=1', [chargeTel], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result
                });
            }
        })
    });
    if (user.code == 200 && user.data.length > 0) {
        let receiverId = user.data[0].id;
        let chargeRules = await new Promise((resolve, reject) => {
            con.query('select * from charge_rules where id=? and discarded=0', [chargeId], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        code: 200,
                        msg: '查询成功',
                        data: result
                    })
                }
            })
        });
        let ba = await new Promise((resolve, reject) => {
            con.query('select * from blind_account where user_id = ?', [receiverId], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        code: 200,
                        msg: '查询成功',
                        data: result
                    })
                }
            })
        });
        if (chargeRules.code == 200 && chargeRules.data.length > 0) {
            //创建充值订单
            let orderid = idMaker();
            let charger_id = 0;
            let receiver_id = receiverId;
            let charge_type = 0;
            let pay_money = chargeRules.data[0].pay_money;
            let pay_minutes = chargeRules.data[0].pay_minutes;
            let free_minutes = chargeRules.data[0].free_minutes;
            let pay_minutes_left = chargeRules.data[0].pay_minutes;
            let free_minutes_left = chargeRules.data[0].free_minutes;
            let pay_channel = '系统';
            let pay_orderinfo = '后台充值';
            let valid_time = chargeRules.data[0].valid_time;
            let valid_start = '';
            let valid_end = '';
            if (ba.code == 200 && ba.data.length > 0) {
                valid_start = ba.data[0].valid_time;
                valid_end = ba.data[0].valid_time + valid_time;
            } else {
                valid_start = '';
                valid_end = valid_time;
            }
            let t = moment().format('YYYY-MM-DD HH:mm:ss');

            let chargeOrder = await new Promise((resolve, reject) => {
                con.query('insert into charge_order (`orderid`,`charger_id`,`receiver_id`,`charge_type`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes_left`,`free_minutes_left`,`pay_channel`,`pay_orderinfo`,`valid_time`,`valid_start`,`valid_end`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [orderid, charger_id, receiver_id, charge_type, pay_money, pay_minutes, free_minutes, pay_minutes_left, free_minutes_left, pay_channel, pay_orderinfo, valid_time, valid_start, valid_end, t, t], function(err, result) {
                    console.log(err);
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve({
                            code: 200,
                            msg: '插入成功',
                            data: result
                        })
                    }
                })
            });
            let changeId = idMaker();
            let user_id = receiverId;
            let paytime_old = parseFloat(ba.data[0].paytime_left);
            let paytime_new = paytime_old + parseFloat(pay_minutes);;
            let freetime_old = parseFloat(ba.data[0].freetime_left);;
            let freetime_new = freetime_old + parseFloat(free_minutes);
            let money_new = parseFloat(ba.data[0].money_left) + parseFloat(pay_money);
            let cardvt_old = ba.data[0].cards_validtime;
            let cardvt_new = ba.data[0].cards_validtime;
            let validtime_old = ba.data[0].valid_time;
            let validtime_new = ba.data[0].valid_time + valid_time;
            let related_chatid = 0;
            let related_chargeid = orderid;
            let last_changeid = ba.data[0].last_changeid;
            let pay_money_str = number_format(pay_money, 2);
            let desc = `充值${pay_money_str}元`;
            let detail = `${chargeTel} ${pay_channel} ${pay_orderinfo}`;
            let changed_minutes = parseFloat(pay_minutes) + parseFloat(free_minutes);
            let changed_minutes_str = number_format(changed_minutes, 2);
            let changed = `+${changed_minutes_str}元`;
            let minutes_after_charge = paytime_new + freetime_new;
            let minutes_after_charge_str = number_format(minutes_after_charge, 2);
            let newvalue = `${minutes_after_charge_str}元`;
            let t1 = moment().format('YYYY-MM-DD HH:mm:ss');

            let blindAccountChangeLog = await new Promise((resolve, reject) => {
                con.query('insert into blindaccount_changelog (`changeid`,`user_id`,`paytime_old`,`paytime_new`,`freetime_old`,`freetime_new`,`cardvt_old`,`cardvt_new`,`validtime_old`,`validtime_new`,`related_chatid`,`related_chargeid`,`last_changeid`,`desc`,`detail`,`changed`,`newvalue`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [changeId, user_id, paytime_old, paytime_new, freetime_old, freetime_new, cardvt_old, cardvt_new, validtime_old, validtime_new, related_chatid, related_chargeid, last_changeid, desc, detail, changed, newvalue, t1, t1], function(err, result) {
                    console.log(err);
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve({
                            code: 200,
                            msg: '插入成功',
                            data: result
                        })
                    }
                })
            });
            if (ba.code == 200 && ba.data.length > 0) {
                let v = ba.data[0].version + 1;
                let t2 = moment().format('YYYY-MM-DD HH:mm:ss');

                let blindAccount = await new Promise((resolve, reject) => {
                    con.query('update blind_account set paytime_left=?,freetime_left=?,valid_time=?,money_left=?,last_changeid=?,version=?,updatedAt=? where user_id=? and version=?', [paytime_new, freetime_new, validtime_new, money_new, changeId, v, t2, user_id, ba.data[0].version], function(err, result) {
                        console.log(err);
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '插入成功',
                                data: result
                            })
                        }
                    })
                });

            } else {
                let t2 = moment().format('YYYY-MM-DD HH:mm:ss');
                let blindAccount = await new Promise((resolve, reject) => {
                    con.query('insert into blind_account (`user_id`,`paytime_left`,`freetime_left`,`valid_time`,`money_left`,`last_changeid`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?)', [user_id, paytime_new, freetime_new, validtime_new, money_new, changeId, t2, t2], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '插入成功',
                                data: result
                            })
                        }
                    })
                });
            }
        } else {
            re = {
                code: 10005,
                msg: '充值套餐有误'
            };
        }

    } else {
        re = {
            code: 10006,
            msg: '用户不存在'
        }
    }
    ctx.response.body = re;
});

/**
 * 充值套餐
 */
router.get('/chargeRules', async(ctx, next) => {
    let rules = await new Promise((resolve, reject) => {
        con.query('select * from charge_rules where rule_type< 999 and discarded=0', [], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                for (let index in result) {
                    result[index].desc = result[index].rule_name + result[index].rule_desc;
                }
                resolve({
                    code: 200,
                    msg: '操作成功',
                    data: result
                });
            }
        });
    });
    ctx.response.body = rules;
});

let idMaker = function() {
    let _last_ts = 0;
    let _increment_id = 0;
    let _instance_id = 1023;
    let _base_date = new Date(2018, 1, 1, 0, 0, 0).getTime();
    //unique_id, snake
    //支持运行130年,每秒1000个id/台,1000台机器
    //51----------------20------------10-------0
    //-----TIMESTAMP-----|------id----|---MID--|
    //能支持64位有效位的整数
    //支持运行130年，每毫秒1000个id/台,4000台机器
    //63----------------22------------12-------0
    //-----TIMESTAMP-----|------id----|---MID--|
    let ts = (Date.now() - _base_date) / 1000;
    ts |= 0;
    if (_last_ts != ts) {
        _last_ts = ts;
        _increment_id = 0;
    }
    ts = ts * 1024 * 1024;
    ts += _increment_id * 1024; //一秒钟单台机器最多允许产生1024(如果支持64位整数，可以产生1M个)个id, 最多允许存在1024台
    _increment_id += 1;
    ts += _instance_id;
    return ts;
};

let number_format = function(number, decimals) {
    /*
     * 参数说明：
     * number：要格式化的数字
     * decimals：保留几位小数
     * */

    let num = number + '';
    num = num.replace(/[^0-9+-Ee.]/g, '');
    num = parseFloat(num);
    let s = num.toFixed(decimals) + '';
    return s;
}
module.exports = router;
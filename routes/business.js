const router = require('koa-router')();
const Wifi = require('../models').wifi;
const sequelize = require('../models').sequelize;
const con = require('../appdb2'); //服务器测试库
// const con = require('../appdb4'); //服务器正式库
// const con = require('../appdb3')(); //本地
const env = "dev";
// const env = "prod";
const moment = require('moment');
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const crypto = require('crypto');
const systemLog = require('../lib/systemLog');
const common = require('../lib/common');
const jwt = require('jsonwebtoken');
const secret = 'wenhuaiyunxiang';

//支付宝支付参数
// const AlipaySdk = require('../lib/alipay-sdk/alipay');
// const AlipayFormData = require('../lib/alipay-sdk/form');
// const formData = new AlipayFormData["default"]({});
// const fs = require('fs');
// const path = require('path');

// const alipay_appid = '2018080260889042';
// console.log(__dirname);
// let alipay_publickey = path.resolve(__dirname, '..') + '/lib/rsa_public_key.pem';
// let alipay_privatekey = path.resolve(__dirname, '..') + '/lib/rsa_private_key.pem';

// const angelAlipaySdk = new AlipaySdk["default"]({
//     appId: alipay_appid,
//     privateKey: fs.readFileSync(alipay_privatekey, 'ascii'),
//     alipayPublicKey: fs.readFileSync(alipay_publickey, 'ascii'),
// });


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
                        con.query('select users.*,settings.jsonValues as setting from users left join settings on users.id=settings.userId where role=1 order by createdAt desc limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
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
            con.query('select users.*,settings.jsonValues as setting from users left join settings on users.id=settings.userId where tel=? and role=1', [key], function(err, result) {
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

router.post("/blindSetting", async(ctx, next) => {
    let blindId = ctx.request.body.id;
    let stg = parseInt(ctx.request.body.stg.trim());
    let stgArr = [0, 1, 2];
    let re = {};
    do {
        if (!blindId) {
            re = {
                code: 10010,
                msg: '参数视友id有误'
            };
            break;
        }
        if (stgArr.indexOf(stg) == -1) {
            re = {
                code: 10010,
                msg: '参数stg值有误'
            };
            break;
        }
        re = await new Promise((resolve, reject) => {
            con.query('select * from settings where userId=?', [blindId], function(err, result) {
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
            });
        });
        if (re.code == 200) {
            if (re.data.length <= 0) {
                let jsonValues = {
                    "refused": {
                        "startTime": "00:00",
                        "endTime": "00:00",
                    },
                    "cs_enabled": 1,
                    "vt_enabled": 1,
                    "ff_enabled": 1,
                    "stg": stg
                };
                jsonValues = JSON.stringify(jsonValues);
                re = await new Promise((resolve, reject) => {
                    con.query('insert into settings (jsonValues,userId) values (?,?)', [jsonValues, blindId], function(err, result) {
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
                                msg: '配置成功',
                                data: result
                            });
                        }
                    });
                });
            } else {
                let setting = JSON.parse(re.data[0].jsonValues);
                let jsonValues = {
                    refused: {
                        startTime: setting.refused.startTime,
                        endTime: setting.refused.endTime,
                    },
                    cs_enabled: setting.cs_enabled,
                    vt_enabled: setting.vt_enabled,
                    ff_enabled: setting.ff_enabled,
                    stg: stg
                };
                jsonValues = JSON.stringify(jsonValues);
                re = await new Promise((resolve, reject) => {
                    con.query('update settings set jsonValues=? where userId=? ', [jsonValues, blindId], function(err, result) {
                        if (err) {
                            resolve({
                                code: 10004,
                                msg: '网络出错',
                                data: ''
                            });
                        } else {
                            resolve({
                                code: 200,
                                msg: '配置更新成功',
                                data: result
                            });
                        }
                    });
                });
            }
        } else {
            break;
        }
    } while (false)
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
                                    if (result[index].test == 0) {
                                        result[index].test = '正式用户';
                                    }
                                    if (result[index].test == 1) {
                                        result[index].test = '测试用户';
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
                        if (result[index].test == 0) {
                            result[index].test = '正式用户';
                        }
                        if (result[index].test == 1) {
                            result[index].test = '测试用户';
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
        con.query('update users set name = ?,gender=?,birthday=?,address=?,eyesight=?,role=?,test=? where id = ?', [paramlist.name, paramlist.gender, paramlist.birthday, paramlist.address, paramlist.eyesight, paramlist.role, paramlist.test, paramlist.id], function(err, result) {
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
                    con.query('INSERT INTO `users` (`tel`,`name`,`gender`,`avatar`,`password`,`role`,`birthday`,`address`,`eyesight`,`service`,`auth`,`test`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [paramlist.tel, paramlist.name, paramlist.gender, '', pwd, paramlist.role, paramlist.birthday, paramlist.address, paramlist.eyesight, 0, 0, paramlist.test, time, time], function(err, result) {
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
    let money = parseFloat(ctx.request.body.params.money); //赠送金额
    let charge_type = 0;

    let token = ctx.headers.authorization;
    token = token.split(' ');
    token = token[1];
    let detoken = jwt.verify(token, secret);
    let uid = detoken.id;
    let uname = detoken.name;
    // let uid = await new Promise((resolve, reject) => {
    //     jwt.verify(token, secret, function(err, decoded) {
    //         console.log(decoded);
    //         if (!err) {
    //             resolve(decoded.id);
    //         }
    //     })
    // });
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
        let pay_money = 0;
        let pay_minutes = 0;
        let free_minutes = money;
        let pay_minutes_left = 0;
        let free_minutes_left = money;
        let valid_time = 0;
        if (chargeId > 0) {
            const chargeRules = await new Promise((resolve, reject) => {
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

            if (chargeRules.code != 200 && chargeRules.data.length <= 0) {
                re = {
                    code: 10005,
                    msg: '充值套餐有误'
                };
                return;
            }
            pay_money = chargeRules.data[0].pay_money;
            pay_minutes = chargeRules.data[0].pay_minutes;
            free_minutes = free_minutes + parseFloat(chargeRules.data[0].free_minutes);
            pay_minutes_left = chargeRules.data[0].pay_minutes;
            free_minutes_left = free_minutes_left + parseFloat(chargeRules.data[0].free_minutes);
            valid_time = chargeRules.data[0].valid_time;
            charge_type = chargeRules.data[0].rule_type;
        }

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
        try {
            //创建充值订单
            let orderid = idMaker();
            let charger_id = 0;
            let receiver_id = receiverId;


            let pay_channel = '系统';
            let pay_orderinfo = '后台充值';
            let valid_start = 0;
            let valid_end = 0;
            if (ba.code == 200 && ba.data.length > 0) {
                valid_start = ba.data[0].valid_time;
                valid_end = ba.data[0].valid_time + valid_time;
            } else {
                valid_start = 0;
                valid_end = valid_time;
            }
            let t = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

            let sqlParamsEntity = [];
            let sql1 = 'insert into charge_order (`orderid`,`charger_id`,`receiver_id`,`charge_type`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes_left`,`free_minutes_left`,`pay_channel`,`pay_orderinfo`,`valid_time`,`valid_start`,`valid_end`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            let params = [orderid, charger_id, receiver_id, charge_type, pay_money, pay_minutes, free_minutes, pay_minutes_left, free_minutes_left, pay_channel, pay_orderinfo, valid_time, valid_start, valid_end, t, t];
            let sqlParams = {
                sql: sql1,
                params: params
            };
            sqlParamsEntity.push(sqlParams);
            // let chargeOrder = await new Promise((resolve, reject) => {
            //     con.query('insert into charge_order (`orderid`,`charger_id`,`receiver_id`,`charge_type`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes_left`,`free_minutes_left`,`pay_channel`,`pay_orderinfo`,`valid_time`,`valid_start`,`valid_end`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [orderid, charger_id, receiver_id, charge_type, pay_money, pay_minutes, free_minutes, pay_minutes_left, free_minutes_left, pay_channel, pay_orderinfo, valid_time, valid_start, valid_end, t, t], function(err, result) {
            //         console.log(err);
            //         if (err) {
            //             resolve({
            //                 code: 10004,
            //                 msg: '网络出错',
            //                 data: ''
            //             });
            //         } else {
            //             resolve({
            //                 code: 200,
            //                 msg: '插入成功',
            //                 data: result
            //             })
            //         }
            //     })
            // });

            let paytime_old = 0;
            let freetime_old = 0;
            let money_new = parseFloat(pay_money);
            let cardvt_old = 0;
            let cardvt_new = 0;
            let validtime_old = 0;
            let validtime_new = valid_time;
            let last_changeid = 0;
            if (ba.code == 200 && ba.data.length > 0) {
                paytime_old = parseFloat(ba.data[0].paytime_left);
                freetime_old = parseFloat(ba.data[0].freetime_left);
                money_new = parseFloat(ba.data[0].money_left) + money_new;
                cardvt_old = ba.data[0].cards_validtime;
                cardvt_new = ba.data[0].cards_validtime;
                validtime_old = ba.data[0].valid_time;
                validtime_new = ba.data[0].valid_time + validtime_new;
                last_changeid = ba.data[0].last_changeid;
            }
            let changeId = idMaker();
            let user_id = receiverId;
            let paytime_new = paytime_old + parseFloat(pay_minutes);
            let freetime_new = freetime_old + parseFloat(free_minutes);
            let related_chatid = 0;
            let related_chargeid = orderid;
            let pay_money_str = number_format(pay_money, 2);
            let desc = `充值${pay_money_str}元`;
            let detail = `${chargeTel} ${pay_channel} ${pay_orderinfo}`;
            let changed_minutes = parseFloat(pay_minutes) + parseFloat(free_minutes);
            let changed_minutes_str = number_format(changed_minutes, 2);
            let changed = `+${changed_minutes_str}元`;
            let minutes_after_charge = paytime_new + freetime_new;
            let minutes_after_charge_str = number_format(minutes_after_charge, 2);
            let newvalue = `${minutes_after_charge_str}元`;
            let t1 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

            let sql2 = 'insert into blindaccount_changelog (`changeid`,`user_id`,`paytime_old`,`paytime_new`,`freetime_old`,`freetime_new`,`cardvt_old`,`cardvt_new`,`validtime_old`,`validtime_new`,`related_chatid`,`related_chargeid`,`last_changeid`,`desc`,`detail`,`changed`,`newvalue`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            let params2 = [changeId, user_id, paytime_old, paytime_new, freetime_old, freetime_new, cardvt_old, cardvt_new, validtime_old, validtime_new, related_chatid, related_chargeid, last_changeid, desc, detail, changed, newvalue, t1, t1];
            let sqlParams2 = {
                sql: sql2,
                params: params2
            };
            sqlParamsEntity.push(sqlParams2);

            // let blindAccountChangeLog = await new Promise((resolve, reject) => {
            //     con.query('insert into blindaccount_changelog (`changeid`,`user_id`,`paytime_old`,`paytime_new`,`freetime_old`,`freetime_new`,`cardvt_old`,`cardvt_new`,`validtime_old`,`validtime_new`,`related_chatid`,`related_chargeid`,`last_changeid`,`desc`,`detail`,`changed`,`newvalue`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [changeId, user_id, paytime_old, paytime_new, freetime_old, freetime_new, cardvt_old, cardvt_new, validtime_old, validtime_new, related_chatid, related_chargeid, last_changeid, desc, detail, changed, newvalue, t1, t1], function(err, result) {
            //         console.log(err);
            //         if (err) {
            //             resolve({
            //                 code: 10004,
            //                 msg: '网络出错',
            //                 data: ''
            //             });
            //         } else {
            //             resolve({
            //                 code: 200,
            //                 msg: '插入成功',
            //                 data: result
            //             })
            //         }
            //     })
            // });
            let action = '';

            if (ba.code == 200 && ba.data.length > 0) {
                let v = ba.data[0].version + 1;
                let t2 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

                let sql3 = 'update blind_account set paytime_left=?,freetime_left=?,valid_time=?,money_left=?,last_changeid=?,version=?,updatedAt=? where user_id=? and version=?';
                let params3 = [paytime_new, freetime_new, validtime_new, money_new, changeId, v, t2, user_id, ba.data[0].version];
                let sqlParams3 = {
                    sql: sql3,
                    params: params3
                };
                sqlParamsEntity.push(sqlParams3);

                action = 'update';

                // let blindAccount = await new Promise((resolve, reject) => {
                //     con.query('update blind_account set paytime_left=?,freetime_left=?,valid_time=?,money_left=?,last_changeid=?,version=?,updatedAt=? where user_id=? and version=?', [paytime_new, freetime_new, validtime_new, money_new, changeId, v, t2, user_id, ba.data[0].version], function(err, result) {
                //         console.log(err);
                //         if (err) {
                //             resolve({
                //                 code: 10004,
                //                 msg: '网络出错',
                //                 data: ''
                //             });
                //         } else {
                //             resolve({
                //                 code: 200,
                //                 msg: '更新成功',
                //                 data: result
                //             })
                //         }
                //     })
                // });

                // if (blindAccount && blindAccount.code == 200)　 {
                //     ip = common.get_client_ip(ctx);
                //     let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
                //     systemLog.saveLog(uid, ip, 'update', operation, '后台充值');
                //     re = {
                //         code: 200,
                //         msg: "充值成功"
                //     };
                // } else {
                //     re = {
                //         code: 10007,
                //         msg: "充值失败"
                //     };
                // }

            } else {
                let t2 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

                let sql3 = 'insert into blind_account (`user_id`,`paytime_left`,`freetime_left`,`valid_time`,`money_left`,`last_changeid`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?)';
                let params3 = [user_id, paytime_new, freetime_new, validtime_new, money_new, changeId, t2, t2];
                let sqlParams3 = {
                    sql: sql3,
                    params: params3
                };
                sqlParamsEntity.push(sqlParams3);

                action = 'create';
                // let blindAccount = await new Promise((resolve, reject) => {
                //     con.query('insert into blind_account (`user_id`,`paytime_left`,`freetime_left`,`valid_time`,`money_left`,`last_changeid`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?)', [user_id, paytime_new, freetime_new, validtime_new, money_new, changeId, t2, t2], function(err, result) {
                //         if (err) {
                //             resolve({
                //                 code: 10004,
                //                 msg: '网络出错',
                //                 data: ''
                //             });
                //         } else {
                //             resolve({
                //                 code: 200,
                //                 msg: '插入成功',
                //                 data: result
                //             })
                //         }
                //     })
                // });

                // if (blindAccount && blindAccount.code == 200)　 {
                //     ip = common.get_client_ip(ctx);
                //     let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
                //     systemLog.saveLog(uid, ip, 'create', operation, '后台充值');
                //     re = {
                //         code: 200,
                //         msg: "充值成功"
                //     };
                // } else {
                //     re = {
                //         code: 10007,
                //         msg: "充值失败"
                //     };
                // }
            }
            let result = await new Promise((resolve, reject) => {
                con.execTrans(sqlParamsEntity, function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错'
                        });
                    } else {
                        resolve({
                            code: 200,
                            msg: '充值成功',
                            data: result
                        });
                    }
                })
            })
            if (result.code == 200) {
                let ip = common.get_client_ip(ctx);
                let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
                let changeJson = {
                    action: 'charge',
                    tables: {
                        charge_order: orderid,
                        blindacount_changelog: changeId,
                        blind_account: user_id
                    },
                    environment: env
                };
                changeJson = JSON.stringify(changeJson);
                systemLog.saveLog(uid, ip, action, operation, '后台充值', changeJson);
                re = {
                    code: 200,
                    msg: "充值成功"
                };
            } else {
                re = {
                    code: 10007,
                    msg: "充值失败"
                };
            }

        } catch (err) {
            console.log(err);
            re.code = 610;
            re.msg = 'Error catched';
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
 * 编辑钱包
 */
router.post('/updateWallet', async(ctx, next) => {
    let re = {};
    let uid = ctx.request.body.params.user_id;
    let paytimeLeft = parseFloat(ctx.request.body.params.paytime_left); //支付金额
    let freetimeLeft = parseFloat(ctx.request.body.params.freetime_left); //赠送金额
    let freetimeLeft2 = parseInt(ctx.request.body.params.freetime_left); //赠送分钟

    let token = ctx.headers.authorization;
    token = token.split(' ');
    token = token[1];
    let detoken = jwt.verify(token, secret);
    let uid2 = detoken.id;
    let uname = detoken.name;

    let receiverId = user.data[0].id;
    let pay_money = 0;
    let pay_minutes = 0;
    let free_minutes = money;
    let pay_minutes_left = 0;
    let free_minutes_left = money;
    let valid_time = 0;
    if (chargeId > 0) {
        const chargeRules = await new Promise((resolve, reject) => {
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

        if (chargeRules.code != 200 && chargeRules.data.length <= 0) {
            re = {
                code: 10005,
                msg: '充值套餐有误'
            };
            return;
        }
        pay_money = chargeRules.data[0].pay_money;
        pay_minutes = chargeRules.data[0].pay_minutes;
        free_minutes = free_minutes + parseFloat(chargeRules.data[0].free_minutes);
        pay_minutes_left = chargeRules.data[0].pay_minutes;
        free_minutes_left = free_minutes_left + parseFloat(chargeRules.data[0].free_minutes);
        valid_time = chargeRules.data[0].valid_time;
        charge_type = chargeRules.data[0].rule_type;
    }

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
    try {
        //创建充值订单
        let orderid = idMaker();
        let charger_id = 0;
        let receiver_id = receiverId;


        let pay_channel = '系统';
        let pay_orderinfo = '后台充值';
        let valid_start = 0;
        let valid_end = 0;
        if (ba.code == 200 && ba.data.length > 0) {
            valid_start = ba.data[0].valid_time;
            valid_end = ba.data[0].valid_time + valid_time;
        } else {
            valid_start = 0;
            valid_end = valid_time;
        }
        let t = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

        let sqlParamsEntity = [];
        let sql1 = 'insert into charge_order (`orderid`,`charger_id`,`receiver_id`,`charge_type`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes_left`,`free_minutes_left`,`pay_channel`,`pay_orderinfo`,`valid_time`,`valid_start`,`valid_end`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        let params = [orderid, charger_id, receiver_id, charge_type, pay_money, pay_minutes, free_minutes, pay_minutes_left, free_minutes_left, pay_channel, pay_orderinfo, valid_time, valid_start, valid_end, t, t];
        let sqlParams = {
            sql: sql1,
            params: params
        };
        sqlParamsEntity.push(sqlParams);
        // let chargeOrder = await new Promise((resolve, reject) => {
        //     con.query('insert into charge_order (`orderid`,`charger_id`,`receiver_id`,`charge_type`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes_left`,`free_minutes_left`,`pay_channel`,`pay_orderinfo`,`valid_time`,`valid_start`,`valid_end`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [orderid, charger_id, receiver_id, charge_type, pay_money, pay_minutes, free_minutes, pay_minutes_left, free_minutes_left, pay_channel, pay_orderinfo, valid_time, valid_start, valid_end, t, t], function(err, result) {
        //         console.log(err);
        //         if (err) {
        //             resolve({
        //                 code: 10004,
        //                 msg: '网络出错',
        //                 data: ''
        //             });
        //         } else {
        //             resolve({
        //                 code: 200,
        //                 msg: '插入成功',
        //                 data: result
        //             })
        //         }
        //     })
        // });

        let paytime_old = 0;
        let freetime_old = 0;
        let money_new = parseFloat(pay_money);
        let cardvt_old = 0;
        let cardvt_new = 0;
        let validtime_old = 0;
        let validtime_new = valid_time;
        let last_changeid = 0;
        if (ba.code == 200 && ba.data.length > 0) {
            paytime_old = parseFloat(ba.data[0].paytime_left);
            freetime_old = parseFloat(ba.data[0].freetime_left);
            money_new = parseFloat(ba.data[0].money_left) + money_new;
            cardvt_old = ba.data[0].cards_validtime;
            cardvt_new = ba.data[0].cards_validtime;
            validtime_old = ba.data[0].valid_time;
            validtime_new = ba.data[0].valid_time + validtime_new;
            last_changeid = ba.data[0].last_changeid;
        }
        let changeId = idMaker();
        let user_id = receiverId;
        let paytime_new = paytime_old + parseFloat(pay_minutes);
        let freetime_new = freetime_old + parseFloat(free_minutes);
        let related_chatid = 0;
        let related_chargeid = orderid;
        let pay_money_str = number_format(pay_money, 2);
        let desc = `充值${pay_money_str}元`;
        let detail = `${chargeTel} ${pay_channel} ${pay_orderinfo}`;
        let changed_minutes = parseFloat(pay_minutes) + parseFloat(free_minutes);
        let changed_minutes_str = number_format(changed_minutes, 2);
        let changed = `+${changed_minutes_str}元`;
        let minutes_after_charge = paytime_new + freetime_new;
        let minutes_after_charge_str = number_format(minutes_after_charge, 2);
        let newvalue = `${minutes_after_charge_str}元`;
        let t1 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

        let sql2 = 'insert into blindaccount_changelog (`changeid`,`user_id`,`paytime_old`,`paytime_new`,`freetime_old`,`freetime_new`,`cardvt_old`,`cardvt_new`,`validtime_old`,`validtime_new`,`related_chatid`,`related_chargeid`,`last_changeid`,`desc`,`detail`,`changed`,`newvalue`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        let params2 = [changeId, user_id, paytime_old, paytime_new, freetime_old, freetime_new, cardvt_old, cardvt_new, validtime_old, validtime_new, related_chatid, related_chargeid, last_changeid, desc, detail, changed, newvalue, t1, t1];
        let sqlParams2 = {
            sql: sql2,
            params: params2
        };
        sqlParamsEntity.push(sqlParams2);

        // let blindAccountChangeLog = await new Promise((resolve, reject) => {
        //     con.query('insert into blindaccount_changelog (`changeid`,`user_id`,`paytime_old`,`paytime_new`,`freetime_old`,`freetime_new`,`cardvt_old`,`cardvt_new`,`validtime_old`,`validtime_new`,`related_chatid`,`related_chargeid`,`last_changeid`,`desc`,`detail`,`changed`,`newvalue`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [changeId, user_id, paytime_old, paytime_new, freetime_old, freetime_new, cardvt_old, cardvt_new, validtime_old, validtime_new, related_chatid, related_chargeid, last_changeid, desc, detail, changed, newvalue, t1, t1], function(err, result) {
        //         console.log(err);
        //         if (err) {
        //             resolve({
        //                 code: 10004,
        //                 msg: '网络出错',
        //                 data: ''
        //             });
        //         } else {
        //             resolve({
        //                 code: 200,
        //                 msg: '插入成功',
        //                 data: result
        //             })
        //         }
        //     })
        // });
        let action = '';

        if (ba.code == 200 && ba.data.length > 0) {
            let v = ba.data[0].version + 1;
            let t2 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

            let sql3 = 'update blind_account set paytime_left=?,freetime_left=?,valid_time=?,money_left=?,last_changeid=?,version=?,updatedAt=? where user_id=? and version=?';
            let params3 = [paytime_new, freetime_new, validtime_new, money_new, changeId, v, t2, user_id, ba.data[0].version];
            let sqlParams3 = {
                sql: sql3,
                params: params3
            };
            sqlParamsEntity.push(sqlParams3);

            action = 'update';

            // let blindAccount = await new Promise((resolve, reject) => {
            //     con.query('update blind_account set paytime_left=?,freetime_left=?,valid_time=?,money_left=?,last_changeid=?,version=?,updatedAt=? where user_id=? and version=?', [paytime_new, freetime_new, validtime_new, money_new, changeId, v, t2, user_id, ba.data[0].version], function(err, result) {
            //         console.log(err);
            //         if (err) {
            //             resolve({
            //                 code: 10004,
            //                 msg: '网络出错',
            //                 data: ''
            //             });
            //         } else {
            //             resolve({
            //                 code: 200,
            //                 msg: '更新成功',
            //                 data: result
            //             })
            //         }
            //     })
            // });

            // if (blindAccount && blindAccount.code == 200)　 {
            //     ip = common.get_client_ip(ctx);
            //     let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
            //     systemLog.saveLog(uid, ip, 'update', operation, '后台充值');
            //     re = {
            //         code: 200,
            //         msg: "充值成功"
            //     };
            // } else {
            //     re = {
            //         code: 10007,
            //         msg: "充值失败"
            //     };
            // }

        } else {
            let t2 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');

            let sql3 = 'insert into blind_account (`user_id`,`paytime_left`,`freetime_left`,`valid_time`,`money_left`,`last_changeid`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?)';
            let params3 = [user_id, paytime_new, freetime_new, validtime_new, money_new, changeId, t2, t2];
            let sqlParams3 = {
                sql: sql3,
                params: params3
            };
            sqlParamsEntity.push(sqlParams3);

            action = 'create';
            // let blindAccount = await new Promise((resolve, reject) => {
            //     con.query('insert into blind_account (`user_id`,`paytime_left`,`freetime_left`,`valid_time`,`money_left`,`last_changeid`,`createdAt`,`updatedAt`) values (?,?,?,?,?,?,?,?)', [user_id, paytime_new, freetime_new, validtime_new, money_new, changeId, t2, t2], function(err, result) {
            //         if (err) {
            //             resolve({
            //                 code: 10004,
            //                 msg: '网络出错',
            //                 data: ''
            //             });
            //         } else {
            //             resolve({
            //                 code: 200,
            //                 msg: '插入成功',
            //                 data: result
            //             })
            //         }
            //     })
            // });

            // if (blindAccount && blindAccount.code == 200)　 {
            //     ip = common.get_client_ip(ctx);
            //     let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
            //     systemLog.saveLog(uid, ip, 'create', operation, '后台充值');
            //     re = {
            //         code: 200,
            //         msg: "充值成功"
            //     };
            // } else {
            //     re = {
            //         code: 10007,
            //         msg: "充值失败"
            //     };
            // }
        }
        let result = await new Promise((resolve, reject) => {
            con.execTrans(sqlParamsEntity, function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错'
                    });
                } else {
                    resolve({
                        code: 200,
                        msg: '充值成功',
                        data: result
                    });
                }
            })
        })
        if (result.code == 200) {
            let ip = common.get_client_ip(ctx);
            let operation = `${uid}为用户${receiverId}选择充值套餐为${chargeId},赠送金额${money}`;
            let changeJson = {
                action: 'charge',
                tables: {
                    charge_order: orderid,
                    blindacount_changelog: changeId,
                    blind_account: user_id
                },
                environment: env
            };
            changeJson = JSON.stringify(changeJson);
            systemLog.saveLog(uid, ip, action, operation, '后台充值', changeJson);
            re = {
                code: 200,
                msg: "充值成功"
            };
        } else {
            re = {
                code: 10007,
                msg: "充值失败"
            };
        }

    } catch (err) {
        console.log(err);
        re.code = 610;
        re.msg = 'Error catched';
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

/**
 * 充值套餐列表
 */
router.get('/chargeRulesList', async(ctx, next) => {
    let rulesList = await new Promise((resolve, reject) => {
        con.query('select * from charge_rules', [], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: "网络出错",
                    data: ''
                });
            } else {
                for (let index in result) {
                    if (result[index].for_newuser == 1) {
                        result[index].for_newuser = '是';
                    } else {
                        result[index].for_newuser = '否';
                    }
                    if (result[index].rule_type == 0) {
                        result[index].rule_type = '普通充值';
                    } else if (result[index].rule_type == 1) {
                        result[index].rule_type = '月卡充值';
                    } else {
                        result[index].rule_type = '其他';
                    }
                    if (result[index].discarded == 1) {
                        result[index].discarded = '已失效';
                    } else {
                        result[index].discarded = '生效中';
                    }
                }
                resolve({
                    code: 200,
                    msg: "操作成功",
                    data: result
                })
            }
        })
    })
    ctx.response.body = rulesList;
});

router.post('/chargeRulesAdd', async(ctx, next) => {
    let params = ctx.request.body.params;
    params.valid_time = parseInt(params.valid_time) * 86400;
    let re = await new Promise((resolve, reject) => {
        con.query('INSERT INTO `charge_rules` (`rule_name`,`rule_type`,`for_newuser`,`rule_desc`,`pay_money`,`pay_minutes`,`free_minutes`,`pay_minutes2`,`free_minutes2`,`valid_time`,`discarded`,`createdAt`,`updatedAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [params.rule_name, params.rule_type, params.for_newuser, params.rule_desc, params.pay_money, params.pay_minutes, params.free_minutes, params.pay_minutes2, params.free_minutes2, params.valid_time, params.discarded, time, time], function(err, result) {
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
                    msg: '操作成功',
                    data: ''
                });
            }
        });
    });
    ctx.response.body = re;
});

router.get('/approvalList', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let res = {};
    if (key == '' || typeof(key) == 'undefined') {
        res = await new Promise((resolve, reject) => {
            con.query('select ua.`*`,u.auth,u.tel from user_auth as ua left join users as u on ua.user_id=u.id limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result.length > 0) {
                        for (let index in result) {
                            let info = JSON.parse(JSON.parse(result[index].user_auth_info));
                            result[index].name = info.Name;
                            result[index].IdentificationNumber = info.IdentificationNumber;
                            if (info.IdCardType == 'identityCard') {
                                result[index].IdCardType = '身份证';
                            } else {
                                result[index].IdCardType = '其他';
                            }
                            result[index].FacePic = info.FacePic;
                            if (result[index].auth_status == -1) {
                                result[index].auth_status = '未认证';
                            }
                            if (result[index].auth_status == 0) {
                                result[index].auth_status = '认证中';
                            }
                            if (result[index].auth_status == 1) {
                                result[index].auth_status = '认证通过';
                            }
                            if (result[index].auth_status == 2) {
                                result[index].auth_status == '认证不通过';
                            }
                            if (result[index].auth == 0) {
                                result[index].auth = '未审批';
                            }
                            if (result[index].auth == 1) {
                                result[index].auth = '通过审批';
                            }
                            if (result[index].auth == 2) {
                                result[index].auth = '未通过审批';
                            }
                        }
                    }
                    resolve({
                        code: 200,
                        records: result,
                        total: result.length
                    })
                }
            });
        })
    } else {

    }
    ctx.body = res;
});
router.post('/approve', async(ctx, next) => {
    let res = {};
    let param = ctx.request.body;
    do {
        if (!param.uid) {
            res.code = 600;
            res.msg = '参数错误';
            break;
        }
        let uid = param.uid;
        let auth = parseInt(param.auth);
        if ([1, 2].indexOf(auth) == -1) {
            res.code = 601;
            res.msg = 'auth参数值有误';
            break;
        }
        res = await new Promise((resolve, reject) => {
            con.query('select * from users where id=?', [uid], function(err, result) {
                console.log(err);
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result && result.length > 0) {
                        con.query('update users set auth=? where id=?', [auth, uid], function(err, result) {
                            console.log(err);
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '更新失败',
                                    data: '',
                                });
                            } else {
                                resolve({
                                    code: 200,
                                    msg: '审批成功'
                                })
                            }
                        })
                    } else {
                        resolve({
                            code: 10004,
                            msg: '用户不存在',
                            data: ''
                        });
                    }
                }
            })
        });
        break;
    } while (false);
    ctx.body = res;

})

router.post('/zhiMaCount', async(ctx, next) => {
    let param = ctx.request.body.params;
    let method = 'zhima.credit.score.brief.get';
    let request_params = {
        bizContent: {
            transaction_id: '2142353262367377',
            product_code: 'w1010100000000002733',
            cert_type: 'IDENTITY_CARD',
            cert_no: '362421198910206221',
            name: '邓丽君',
            admittance_score: 600,
        },
    };
    let options = {
        validateSign: true,
        // log: logger
    };
    result = await angelAlipaySdk.exec(method, request_params, options);
    console.log(result);
    ctx.response.body = {
        code: 200,
        msg: "success",
        data: result
    };
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

/**
 * 创建或者更新activity
 */
router.post('/activity', async(ctx, next) => {
    let res = {};
    do {
        let param = ctx.request.body.params;
        if (!param.name || param.name.length <= 0) {
            res.code = 600;
            res.msg = '活动名称不能为空';
            break;
        }
        if (!param.content || param.content.length <= 0) {
            res.code = 601;
            res.msg = '活动内容不能为空';
            break;
        }
        if (!param.startAndend || param.startAndend.length <= 0) {
            res.code = 602;
            res.msg = '活动时间必须设置';
            break;
        }
        if (!param.end_show_time || param.end_show_time <= 0) {
            res.code = 604;
            res.msg = '活动展示结束时间必须设置';
            break;
        }
        let t2 = moment().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
        let start = moment(param.startAndend[0]).utc().format('YYYY-MM-DD HH:mm:ss');
        let end = moment(param.startAndend[1]).utc().format('YYYY-MM-DD HH:mm:ss');
        let show = moment(param.end_show_time).utc().format('YYYY-MM-DD HH:mm:ss');
        if (param.id && param.id > 0) {
            //更新活动
            let activity = await new Promise((resolve, reject) => {
                con.query('select * from activity_show where id=?', [param.id], function(err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                })
            });
            if (!activity || activity.length <= 0) {
                res.code = 605;
                res.msg = '该活动不存在';
                break;
            }
            let tmp = await new Promise((resolve, reject) => {
                con.query('update activity_show set name=?,content=?,start_time=?,end_time=?,end_show_time=?,status=?,updatedAt=? where id=? and version=?', [param.name, param.content, start, end, show, param.status, t2, param.id, activity[0].version], function(err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                })
            });
            if (tmp) {
                res.code = 200;
                res.msg = '更新活动成功';
                break;
            }
        } else {
            //新建活动
            let activity = await new Promise((resolve, reject) => {
                con.query('insert into activity_show (name,content,start_time,end_time,end_show_time,status,createdAt,updatedAt) values (?,?,?,?,?,?,?,?)', [param.name, param.content, start, end, show, param.status, t2, t2], function(err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                })
            });
            res.code = 200;
            res.msg = '活动创建成功';
        }
    } while (false);
    ctx.response.body = res;
});
/**
 * 活动列表
 */
router.get('/activityList', async(ctx, next) => {
    let activities = await new Promise((resolve, reject) => {
        con.query('select * from activity_show order by status DESC,createdAt DESC', [], function(err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
    for (let index in activities) {
        if (activities[index].status == 1) {
            activities[index].statusText = '启用';
        } else {
            activities[index].statusText = '未启用';
        }
        activities[index].start_time = moment(activities[index].start_time).add(8, 'h').format('YYYY-MM-DD');
        activities[index].end_time = moment(activities[index].end_time).add(8, 'h').format('YYYY-MM-DD');
        activities[index].end_show_time = moment(activities[index].end_show_time).add(8, 'h').format('YYYY-MM-DD');
    }
    ctx.response.body = {
        code: 200,
        msg: '获取成功',
        data: activities
    }
});
router.get('/getActivity', async(ctx, next) => {
    let res = {};
    let param = ctx.query;
    //更新活动
    let activity = await new Promise((resolve, reject) => {
        con.query('select * from activity_show where id=?', [param.id], function(err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    });
    if (!activity || activity.length <= 0) {
        res.code = 605;
        res.msg = '该活动不存在';
    }
    activity[0].start_time = moment(activity[0].start_time).add(8, 'h').format('YYYY-MM-DD');
    activity[0].end_time = moment(activity[0].end_time).add(8, 'h').format('YYYY-MM-DD');
    activity[0].end_show_time = moment(activity[0].end_show_time).add(8, 'h').format('YYYY-MM-DD');
    activity[0].startAndend = [activity[0].start_time, activity[0].end_time];
    ctx.body = activity[0];
});

module.exports = router;
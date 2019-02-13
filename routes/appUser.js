const router = require('koa-router')();
const sequelize = require('../models').sequelize;
const con = require('../appdb4'); //服务器正式库
// const con = require('../appdb3')();

const moment = require('moment');
const common = require('../lib/common.js');
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const xlsx = require('node-xlsx');
const send = require('koa-send');
const fs = require('fs');

router.prefix('/appUser');
/**
 * APP端盲人用户信息
 */

router.get('/appBlindInfo', async(ctx, next) => {

    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query('select count(id) as blindnum  from users where role=1', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].blindnum > 0) {
                        let total = result[0].blindnum;
                        con.query('select users.*,angelnum,money_left,totalmoney from users left join blind_account on users.id = blind_account.user_id left join (select count(*) as angelnum,blindId from `blind2family-through` group by blindId) as t on users.id = t.blindId left join (select sum(pay_money) as totalmoney,receiver_id from charge_order group by `receiver_id`) as p on users.id = p.receiver_id where users.role=1 limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].totalmoney == null) {
                                        result[index].money_use = '0.00';
                                    }
                                    if (result[index].totalmoney != null && result[index].money_left == null) {
                                        result[index].money_use = result[index].totalmoney;
                                    }
                                    if (result[index].totalmoney != null && result[index].money_left != null) {
                                        result[index].money_use = (parseFloat(result[index].totalmoney) - parseFloat(result[index].money_left)).toFixed(2);
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        });
                    }
                }

            })
        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select count(id) as blindnum  from users where role=1 and tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].blindnum > 0) {
                        let total = result[0].blindnum;
                        con.query('select users.*,angelnum,money_left,totalmoney from users left join blind_account on users.id = blind_account.user_id left join (select count(*) as angelnum,blindId from `blind2family-through` group by blindId) as t on users.id = t.blindId left join (select sum(pay_money) as totalmoney,receiver_id from charge_order group by `receiver_id`) as p on users.id = p.receiver_id where users.role=1 and tel=? limit ?,?', [key, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].totalmoney == null) {
                                        result[index].money_use = '0.00';
                                    }
                                    if (result[index].totalmoney != null && result[index].money_left == null) {
                                        result[index].money_use = result[index].totalmoney;
                                    }
                                    if (result[index].totalmoney != null && result[index].money_left != null) {
                                        result[index].money_use = (parseFloat(result[index].totalmoney) - parseFloat(result[index].money_left)).toFixed(2);
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        });
                    }
                }

            })
        });
        ctx.response.body = re;
    }


});


/**
 * APP端亲友用户信息
 */

router.get('/appAngelInfo', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    if (key == '' || typeof(key) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query('select count(id) as angelnum  from users where role=2', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].angelnum > 0) {
                        let total = result[0].angelnum;
                        con.query('select users.*,balance,profit_total,blindnum from users left join angel_account on users.id = angel_account.user_id left join (select count(*) as blindnum,angelId from `blind2family-through` group by angelId) as p on users.id = p.angelId  where users.role=2 limit ?,?', [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].profit_total == null) {
                                        result[index].money_use = '0.00';
                                    }
                                    if (result[index].profit_total != null && result[index].balance == null) {
                                        result[index].money_use = result[index].profit_total;
                                    }
                                    if (result[index].profit_total != null && result[index].balance != null) {
                                        result[index].money_use = (parseFloat(result[index].profit_total) - parseFloat(result[index].balance)).toFixed(2);
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select count(id) as angelnum  from users where role=2 and tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].angelnum > 0) {
                        let total = result[0].angelnum;
                        con.query('select users.*,balance,profit_total,blindnum from users left join angel_account on users.id = angel_account.user_id left join (select count(*) as blindnum,angelId from `blind2family-through` group by angelId) as p on users.id = p.angelId  where users.role=2 and tel=? limit ?,?', [key, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].profit_total == null) {
                                        result[index].money_use = '0.00';
                                    }
                                    if (result[index].profit_total != null && result[index].balance == null) {
                                        result[index].money_use = result[index].profit_total;
                                    }
                                    if (result[index].profit_total != null && result[index].balance != null) {
                                        result[index].money_use = (parseFloat(result[index].profit_total) - parseFloat(result[index].balance)).toFixed(2);
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    }

});

/**
 * APP端用户呼叫明细
 */

router.get('/userCallDetail', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let tel = ctx.query.tel;
    let userType = ctx.query.userType;
    let test = [];
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
        key1 = key1 + ' 00:00:00';
        key2 = key2 + ' 00:00:00';
    }
    if (userType == "true" || userType == true) {
        //全部用户
        // test = 'users.test=0 or users.test=1';
        test = [0, 1];
    } else {
        //真实用户
        // test = 'users.test=0';
        test = [0];
    }
    if (tel == '' || typeof(tel) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query("select count(call_orders.id) as callnum from call_orders left join users on call_orders.caller_id=users.id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and user_id=caller_id and users.test in (?)", [key1, key2, test], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].callnum > 0) {
                        let total = result[0].callnum;
                        con.query("select call_orders.*,answered_calls.chat_id as aid,answered_calls.answer_time,chat_orders.chat_id as cid,chat_orders.ua,chat_orders.ub,chat_orders.start_time as chat_start_time,chat_orders.end_time as chat_end_time,chat_orders.duration as chat_duration,chat_orders.duration2,users.name,users.address,users.birthday,users.gender,users.tel,users.eyesight from call_orders left join users on call_orders.user_id=users.id left join answered_calls on call_orders.chat_id=answered_calls.chat_id left join chat_orders on call_orders.chat_id=chat_orders.chat_id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and call_orders.user_id = call_orders.caller_id and users.test in (?) order by call_orders.createdAt desc limit ?,?", [key1, key2, test, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            console.log(result);
                            if (err) {
                                console.log(err);
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].aid != null && result[index].cid != null) {
                                        result[index].status = '已接通';
                                        result[index].hanguptime = moment(result[index].chat_end_time).format('HH:mm:ss');
                                    }
                                    if (result[index].aid != null && result[index].cid == null) {
                                        result[index].status = '已接听';
                                        result[index].hanguptime = moment(result[index].answer_time).format('HH:mm:ss');
                                    }
                                    if (result[index].aid == null) {
                                        result[index].status = '未接听';
                                    }
                                    result[index].calldate = moment(result[index].call_time).format('YYYY-MM-DD');
                                    result[index].calltime = moment(result[index].call_time).format('HH:mm:ss');
                                    result[index].hanguptime = moment(result[index].hangup_time).format('HH:mm:ss');
                                    if (parseInt(result[index].chat_duration) > 0) {
                                        result[index].chat_duration = common.sec_to_time(result[index].chat_duration);
                                    } else {
                                        result[index].chat_duration = "00:00:00";
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                    if (result[index].service_type == "0") {
                                        result[index].service_type = "亲友";
                                    }
                                    if (result[index].service_type == "2") {
                                        result[index].service_type = "志愿者";
                                    }
                                    if (result[index].service_type == "1") {
                                        result[index].service_type = "客服";
                                    }

                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query("select count(call_orders.id) as callnum from call_orders left join users on call_orders.user_id = users.id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and users.tel = ? and call_orders.user_id=call_orders.caller_id", [key1, key2, tel], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].callnum > 0) {
                        let total = result[0].callnum;
                        con.query("select call_orders.*,answered_calls.chat_id as aid,answered_calls.answer_time,chat_orders.chat_id as cid,chat_orders.ua,chat_orders.ub,chat_orders.start_time as chat_start_time,chat_orders.end_time as chat_end_time,chat_orders.duration as chat_duration,chat_orders.duration2,users.name,users.address,users.birthday,users.gender,users.tel,users.eyesight from call_orders left join users on call_orders.user_id=users.id left join answered_calls on call_orders.chat_id=answered_calls.chat_id left join chat_orders on call_orders.chat_id=chat_orders.chat_id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and users.tel=? and call_orders.user_id=call_orders.caller_id order by call_orders.createdAt desc limit ?,?", [key1, key2, tel, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                console.log(err);
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].aid != null && result[index].cid != null) {
                                        result[index].status = '已接通';
                                        result[index].hanguptime = moment(result[index].chat_end_time).format('HH:mm:ss');
                                    }
                                    if (result[index].aid != null && result[index].cid == null) {
                                        result[index].status = '已接听';
                                        result[index].hanguptime = moment(result[index].answer_time).format('HH:mm:ss');
                                    }
                                    if (result[index].aid == null) {
                                        result[index].status = '未接听';
                                    }
                                    result[index].calldate = moment(result[index].call_time).format('YYYY-MM-DD');
                                    result[index].calltime = moment(result[index].call_time).format('HH:mm:ss');
                                    result[index].hanguptime = moment(result[index].hangup_time).format('HH:mm:ss');
                                    if (parseInt(result[index].chat_duration) > 0) {
                                        result[index].chat_duration = common.sec_to_time(result[index].chat_duration);
                                    } else {
                                        result[index].chat_duration = "00:00:00";
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                    if (result[index].service_type == "0") {
                                        result[index].service_type = "亲友";
                                    }
                                    if (result[index].service_type == "2") {
                                        result[index].service_type = "志愿者";
                                    }
                                    if (result[index].service_type == "1") {
                                        result[index].service_type = "客服";
                                    }

                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    }

});

/**
 * APP端用户呼叫汇总
 */

router.get('/userCalls', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let userType = ctx.query.userType;
    let test = [];
    if (userType == 'true' || userType == true) {
        test = [0, 1];
    } else {
        test = [0];
    }
    if (key == '') {
        let re = await new Promise((resolve, reject) => {
            con.query('select user_id,count(call_orders.id) as callnum from call_orders left join users on call_orders.caller_id=users.id where users.test in (?) group by user_id', [test], function(err, result) {
                console.log(err);
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result.length > 0) {
                        let total = result.length;
                        con.query('select user_id,a.callnum,b.answernum,c.chatnum,users.* from (select user_id,count(id) as callnum from call_orders group by user_id) as a left join (select caller_id,count(chat_id) as answernum from answered_calls group by caller_id) as b on a.user_id=b.caller_id left join (select caller_uid,count(chat_id) as chatnum from chat_orders group by caller_uid) as c on a.user_id = c.caller_uid left join users on a.user_id=users.id where users.test in (?) limit ?,?', [test, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].chatnum != null) {
                                        result[index].unchatnum = parseInt(result[index].callnum) - parseInt(result[index].chatnum);
                                    } else {
                                        result[index].unchatnum = parseInt(result[index].callnum);
                                    }
                                    if (parseInt(result[index].callnum) > 0) {
                                        if (result[index].chatnum != null) {
                                            result[index].chatSuccessRate = Math.round(parseFloat(result[index].chatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].chatSuccessRate = "0%";
                                        }
                                        if (result[index].answernum != null) {
                                            result[index].answerSuccessRate = Math.round(parseFloat(result[index].answernum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].chatSuccessRate = "0%";
                                        }
                                        if (result[index].unchatnum != 0 || result[index].unchatnum != null) {
                                            result[index].unchatSuccessRate = Math.round(parseFloat(result[index].unchatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].unchatSuccessRate = "0%";
                                        }
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select user_id,count(call_orders.id) as callnum from call_orders left join users on call_orders.user_id=users.id where tel = ? group by user_id', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result.length > 0) {
                        let total = result.length;
                        con.query('select user_id,a.callnum,b.answernum,c.chatnum,users.* from (select user_id,count(id) as callnum from call_orders group by user_id) as a left join (select caller_id,count(chat_id) as answernum from answered_calls group by caller_id) as b on a.user_id=b.caller_id left join (select caller_uid,count(chat_id) as chatnum from chat_orders group by caller_uid) as c on a.user_id = c.caller_uid left join users on a.user_id=users.id where users.tel=? limit ?,?', [key, (parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
                            if (err) {
                                resolve({
                                    code: 10004,
                                    msg: '网络出错',
                                    data: ''
                                });
                            } else {
                                for (let index in result) {
                                    let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                                    result[index].age = common.getAge(birthday);
                                    if (result[index].chatnum != null) {
                                        result[index].unchatnum = parseInt(result[index].callnum) - parseInt(result[index].chatnum);
                                    } else {
                                        result[index].unchatnum = parseInt(result[index].callnum);
                                    }
                                    if (parseInt(result[index].callnum) > 0) {
                                        if (result[index].chatnum != null) {
                                            result[index].chatSuccessRate = Math.round(parseFloat(result[index].chatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].chatSuccessRate = "0%";
                                        }
                                        if (result[index].answernum != null) {
                                            result[index].answerSuccessRate = Math.round(parseFloat(result[index].answernum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].chatSuccessRate = "0%";
                                        }
                                        if (result[index].unchatnum != 0 || result[index].unchatnum != null) {
                                            result[index].unchatSuccessRate = Math.round(parseFloat(result[index].unchatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                                        } else {
                                            result[index].unchatSuccessRate = "0%";
                                        }
                                    }
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
                                }
                                resolve({
                                    code: 200,
                                    msg: '操作成功',
                                    data: {
                                        records: result,
                                        total: total
                                    }
                                });
                            }
                        });
                    } else {
                        resolve({
                            code: 10006,
                            msg: '暂无数据',
                            data: ''
                        })
                    }
                }

            })
        });
        ctx.response.body = re;
    }
});

router.get('/appBlindInfoExcel', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let dd = moment(Date.now()).format('YYYYMMDD');

    if (key == '' || typeof(key) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query('select users.*,angelnum,money_left,totalmoney from users left join blind_account on users.id = blind_account.user_id left join (select count(*) as angelnum,blindId from `blind2family-through` group by blindId) as t on users.id = t.blindId left join (select sum(pay_money) as totalmoney,receiver_id from charge_order group by `receiver_id`) as p on users.id = p.receiver_id where users.role=1', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].totalmoney == null) {
                            result[index].money_use = '0.00';
                        }
                        if (result[index].totalmoney != null && result[index].money_left == null) {
                            result[index].money_use = result[index].totalmoney;
                        }
                        if (result[index].totalmoney != null && result[index].money_left != null) {
                            result[index].money_use = (parseFloat(result[index].totalmoney) - parseFloat(result[index].money_left)).toFixed(2);
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '视友姓名', '城市', '年龄', '性别', '电话', '视力状况', '绑定亲友数', '账户余额', '使用额', '充值额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].angelnum, result[index].money_left, result[index].money_use, result[index].totalmoney];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userBlindInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userBlindInfo' + dd + '.xlsx'
                    });
                }
            });
        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select users.*,angelnum,money_left,totalmoney from users left join blind_account on users.id = blind_account.user_id left join (select count(*) as angelnum,blindId from `blind2family-through` group by blindId) as t on users.id = t.blindId left join (select sum(pay_money) as totalmoney,receiver_id from charge_order group by `receiver_id`) as p on users.id = p.receiver_id where users.role=1 and tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].totalmoney == null) {
                            result[index].money_use = '0.00';
                        }
                        if (result[index].totalmoney != null && result[index].money_left == null) {
                            result[index].money_use = result[index].totalmoney;
                        }
                        if (result[index].totalmoney != null && result[index].money_left != null) {
                            result[index].money_use = (parseFloat(result[index].totalmoney) - parseFloat(result[index].money_left)).toFixed(2);
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '视友姓名', '城市', '年龄', '性别', '电话', '视力状况', '绑定亲友数', '账户余额', '使用额', '充值额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].angelnum, result[index].money_left, result[index].money_use, result[index].totalmoney];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userBlindInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userBlindInfo' + dd + '.xlsx'
                    });
                }
            });


        });
        ctx.response.body = re;
    }


});
router.get('/appAngelInfoExcel', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let dd = moment(Date.now()).format('YYYYMMDD');

    if (key == '' || typeof(key) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query('select users.*,balance,profit_total,blindnum from users left join angel_account on users.id = angel_account.user_id left join (select count(*) as blindnum,angelId from `blind2family-through` group by angelId) as p on users.id = p.angelId  where users.role=2', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].profit_total == null) {
                            result[index].money_use = '0.00';
                        }
                        if (result[index].profit_total != null && result[index].balance == null) {
                            result[index].money_use = result[index].profit_total;
                        }
                        if (result[index].profit_total != null && result[index].balance != null) {
                            result[index].money_use = (parseFloat(result[index].profit_total) - parseFloat(result[index].balance)).toFixed(2);
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '年龄', '性别', '电话', '视力状况', '绑定视友数', '账户余额', '使用额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].blindnum, result[index].balance, result[index].money_use];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/appAngelInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/appAngelInfo' + dd + '.xlsx'
                    });
                }
            });

        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select users.*,balance,profit_total,blindnum from users left join angel_account on users.id = angel_account.user_id left join (select count(*) as blindnum,angelId from `blind2family-through` group by angelId) as p on users.id = p.angelId  where users.role=2 and tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].profit_total == null) {
                            result[index].money_use = '0.00';
                        }
                        if (result[index].profit_total != null && result[index].balance == null) {
                            result[index].money_use = result[index].profit_total;
                        }
                        if (result[index].profit_total != null && result[index].balance != null) {
                            result[index].money_use = (parseFloat(result[index].profit_total) - parseFloat(result[index].balance)).toFixed(2);
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '年龄', '性别', '电话', '视力状况', '绑定视友数', '账户余额', '使用额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].blindnum, result[index].balance, result[index].money_use];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/appAngelInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/appAngelInfo' + dd + '.xlsx'
                    });
                }
            });




        });
        ctx.response.body = re;
    }

});
router.get('/userCallDetailExcel', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let tel = ctx.query.tel;
    let userType = ctx.query.userType;
    let test = [];
    let key1 = '';
    let key2 = '';
    let dd = moment(Date.now()).format('YYYYMMDD');

    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
        key1 = key1 + ' 00:00:00';
        key2 = key2 + ' 00:00:00';
    }
    if (userType == "true" || userType == true) {
        //全部用户
        // test = 'users.test=0 or users.test=1';
        test = [0, 1];
    } else {
        //真实用户
        // test = 'users.test=0';
        test = [0];
    }
    if (tel == '' || typeof(tel) == 'undefined') {
        let re = await new Promise((resolve, reject) => {
            con.query("select call_orders.*,answered_calls.chat_id as aid,answered_calls.answer_time,chat_orders.chat_id as cid,chat_orders.ua,chat_orders.ub,chat_orders.start_time as chat_start_time,chat_orders.end_time as chat_end_time,chat_orders.duration as chat_duration,chat_orders.duration2,users.name,users.address,users.birthday,users.gender,users.tel,users.eyesight from call_orders left join users on call_orders.user_id=users.id left join answered_calls on call_orders.chat_id=answered_calls.chat_id left join chat_orders on call_orders.chat_id=chat_orders.chat_id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and call_orders.user_id = call_orders.caller_id and users.test in (?) order by call_orders.createdAt desc", [key1, key2, test], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].aid != null && result[index].cid != null) {
                            result[index].status = '已接通';
                            result[index].hanguptime = moment(result[index].chat_end_time).format('HH:mm:ss');
                        }
                        if (result[index].aid != null && result[index].cid == null) {
                            result[index].status = '已接听';
                            result[index].hanguptime = moment(result[index].answer_time).format('HH:mm:ss');
                        }
                        if (result[index].aid == null) {
                            result[index].status = '未接听';
                        }
                        result[index].calldate = moment(result[index].call_time).format('YYYY-MM-DD');
                        result[index].calltime = moment(result[index].call_time).format('HH:mm:ss');
                        result[index].hanguptime = moment(result[index].hangup_time).format('HH:mm:ss');
                        if (parseInt(result[index].chat_duration) > 0) {
                            result[index].chat_duration = common.sec_to_time(result[index].chat_duration);
                        } else {
                            result[index].chat_duration = "00:00:00";
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                        if (result[index].service_type == "0") {
                            result[index].service_type = "亲友";
                        }
                        if (result[index].service_type == "2") {
                            result[index].service_type = "志愿者";
                        }
                        if (result[index].service_type == "1") {
                            result[index].service_type = "客服";
                        }

                    }
                    let datas = [
                        ['接通id', '用户id', '视友姓名', '城市', '年龄', '性别', '电话', '视力状况', '接通状态', '通话状态', '呼叫对象', '日期', '呼叫时间', '挂断时间', '通话时间', '亲友端版本号', '视友端版本号']
                    ];
                    for (let index in result) {
                        let data = [result[index].chat_id, result[index].user_id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].status, result[index].hangup_reason, result[index].service_type, result[index].calldate, result[index].calltime, result[index].hanguptime, result[index].chat_duration, result[index].ua, result[index].ub];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userCallDetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userCallDetail' + dd + '.xlsx'
                    });
                }
            });

        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query("select call_orders.*,answered_calls.chat_id as aid,answered_calls.answer_time,chat_orders.chat_id as cid,chat_orders.ua,chat_orders.ub,chat_orders.start_time as chat_start_time,chat_orders.end_time as chat_end_time,chat_orders.duration as chat_duration,chat_orders.duration2,users.name,users.address,users.birthday,users.gender,users.tel,users.eyesight from call_orders left join users on call_orders.user_id=users.id left join answered_calls on call_orders.chat_id=answered_calls.chat_id left join chat_orders on call_orders.chat_id=chat_orders.chat_id where date_add(call_orders.createdAt, interval '08:00:00' hour_second) > ? and date_add(call_orders.createdAt, interval '08:00:00' hour_second) < ? and users.tel=? and call_orders.user_id=call_orders.caller_id order by call_orders.createdAt desc limit ?,?", [key1, key2, tel], function(err, result) {
                if (err) {
                    console.log(err);
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].aid != null && result[index].cid != null) {
                            result[index].status = '已接通';
                            result[index].hanguptime = moment(result[index].chat_end_time).format('HH:mm:ss');
                        }
                        if (result[index].aid != null && result[index].cid == null) {
                            result[index].status = '已接听';
                            result[index].hanguptime = moment(result[index].answer_time).format('HH:mm:ss');
                        }
                        if (result[index].aid == null) {
                            result[index].status = '未接听';
                        }
                        result[index].calldate = moment(result[index].call_time).format('YYYY-MM-DD');
                        result[index].calltime = moment(result[index].call_time).format('HH:mm:ss');
                        result[index].hanguptime = moment(result[index].hangup_time).format('HH:mm:ss');
                        if (parseInt(result[index].chat_duration) > 0) {
                            result[index].chat_duration = common.sec_to_time(result[index].chat_duration);
                        } else {
                            result[index].chat_duration = "00:00:00";
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                        if (result[index].service_type == "0") {
                            result[index].service_type = "亲友";
                        }
                        if (result[index].service_type == "2") {
                            result[index].service_type = "志愿者";
                        }
                        if (result[index].service_type == "1") {
                            result[index].service_type = "客服";
                        }

                    }
                    let datas = [
                        ['接通id', '用户id', '视友姓名', '城市', '年龄', '性别', '电话', '视力状况', '接通状态', '通话状态', '呼叫对象', '日期', '呼叫时间', '挂断时间', '通话时间', '亲友端版本号', '视友端版本号']
                    ];
                    for (let index in result) {
                        let data = [result[index].chat_id, result[index].user_id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].status, result[index].hangup_reason, result[index].service_type, result[index].calldate, result[index].calltime, result[index].hanguptime, result[index].chat_duration, result[index].ua, result[index].ub];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userCallDetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userCallDetail' + dd + '.xlsx'
                    });
                }
            });

        });
        ctx.response.body = re;
    }

});
router.get('/userCallsExcel', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let dd = moment(Date.now()).format('YYYYMMDD');

    if (key == '') {
        let re = await new Promise((resolve, reject) => {
            con.query('select user_id,a.callnum,b.answernum,c.chatnum,users.* from (select user_id,count(id) as callnum from call_orders group by user_id) as a left join (select caller_id,count(chat_id) as answernum from answered_calls group by caller_id) as b on a.user_id=b.caller_id left join (select caller_uid,count(chat_id) as chatnum from chat_orders group by caller_uid) as c on a.user_id = c.caller_uid left join users on a.user_id=users.id', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].chatnum != null) {
                            result[index].unchatnum = parseInt(result[index].callnum) - parseInt(result[index].chatnum);
                        } else {
                            result[index].unchatnum = parseInt(result[index].callnum);
                        }
                        if (parseInt(result[index].callnum) > 0) {
                            if (result[index].chatnum != null) {
                                result[index].chatSuccessRate = Math.round(parseFloat(result[index].chatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].chatSuccessRate = "0%";
                            }
                            if (result[index].answernum != null) {
                                result[index].answerSuccessRate = Math.round(parseFloat(result[index].answernum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].chatSuccessRate = "0%";
                            }
                            if (result[index].unchatnum != 0 || result[index].unchatnum != null) {
                                result[index].unchatSuccessRate = Math.round(parseFloat(result[index].unchatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].unchatSuccessRate = "0%";
                            }
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '年龄', '性别', '电话', '视力状况', '呼叫总次数', '接通数', '接通占比', '接听数', '接听占比', '未接通数', '未接通占比']
                    ];
                    for (let index in result) {
                        let data = [result[index].user_id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].callnum, result[index].chatnum, result[index].chatSuccessRate, result[index].answernum, result[index].answerSuccessRate, result[index].unchatnum, result[index].unchatSuccessRate];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userCalls' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userCalls' + dd + '.xlsx'
                    });
                }
            });

        });
        ctx.response.body = re;
    } else {
        let re = await new Promise((resolve, reject) => {
            con.query('select user_id,a.callnum,b.answernum,c.chatnum,users.* from (select user_id,count(id) as callnum from call_orders group by user_id) as a left join (select caller_id,count(chat_id) as answernum from answered_calls group by caller_id) as b on a.user_id=b.caller_id left join (select caller_uid,count(chat_id) as chatnum from chat_orders group by caller_uid) as c on a.user_id = c.caller_uid left join users on a.user_id=users.id where users.tel=?', [key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    for (let index in result) {
                        let birthday = moment(result[index].birthday).format('YYYY-MM-DD');
                        result[index].age = common.getAge(birthday);
                        if (result[index].chatnum != null) {
                            result[index].unchatnum = parseInt(result[index].callnum) - parseInt(result[index].chatnum);
                        } else {
                            result[index].unchatnum = parseInt(result[index].callnum);
                        }
                        if (parseInt(result[index].callnum) > 0) {
                            if (result[index].chatnum != null) {
                                result[index].chatSuccessRate = Math.round(parseFloat(result[index].chatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].chatSuccessRate = "0%";
                            }
                            if (result[index].answernum != null) {
                                result[index].answerSuccessRate = Math.round(parseFloat(result[index].answernum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].chatSuccessRate = "0%";
                            }
                            if (result[index].unchatnum != 0 || result[index].unchatnum != null) {
                                result[index].unchatSuccessRate = Math.round(parseFloat(result[index].unchatnum) / parseFloat(result[index].callnum) * 10000) / 100.00 + "%";
                            } else {
                                result[index].unchatSuccessRate = "0%";
                            }
                        }
                        if (result[index].gender == "0") {
                            result[index].gender = '未知';
                        }
                        if (result[index].gender == "1") {
                            result[index].gender = '男';
                        }
                        if (result[index].gender == "2") {
                            result[index].gender = '女';
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '年龄', '性别', '电话', '视力状况', '呼叫总次数', '接通数', '接通占比', '接听数', '接听占比', '未接通数', '未接通占比']
                    ];
                    for (let index in result) {
                        let data = [result[index].user_id, result[index].name, result[index].address, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].callnum, result[index].chatnum, result[index].chatSuccessRate, result[index].answernum, result[index].answerSuccessRate, result[index].unchatnum, result[index].unchatSuccessRate];
                        datas.push(data);
                    }

                    let buffer = xlsx.build([{
                        name: 'sheet1',
                        data: datas
                    }]);

                    fs.writeFileSync('public/uploads/userCalls' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
                    resolve({
                        code: 200,
                        msg: '操作成功',
                        data: 'uploads/userCalls' + dd + '.xlsx'
                    });
                }
            });
        });
        ctx.response.body = re;
    }
});
router.get('/getCallDetail', async(ctx, next) => {
    let dd = moment(Date.now()).format('YYYYMMDD');
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let tel = ctx.query.tel;
    let userType = ctx.query.userType;
    let key1 = '';
    let key2 = '';
    let chatIdArray1 = [];
    let chatIdArray2 = [];
    let test = [];
    let type = ctx.query.type; //是否要导出excel
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
        key1 = key1 + ' 00:00:00';
        key2 = key2 + ' 00:00:00';
    }
    //真实与测试用户筛选
    if (userType == "true" || userType == true) {
        //全部用户
        test = [0, 1];
    } else {
        //真实用户
        test = [0];
    }
    if (tel == '' || typeof(tel) == 'undefined') {
        //全部成功
        let re1 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent,co.hangup_time, co.chat_id, co.hangup_reason, co.call_time,co.callee_tel,co.wifi_type,co.wifi_name, ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb FROM re_prod.users AS us,re_prod.answered_calls as ac, re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id AND ch.first_audioa > 0 AND ch.first_audiob > 0 AND ch.first_videob > 0 AND us.test in (?) and date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r1 = re1.result;
        for (let index in r1) {
            r1[index].call_status = "成功";
            r1[index].answer_status = "接通";
            r1[index].chat_status = "正常";
            r1[index].av_status = "正常";
            r1[index].aa_status = "正常";
            r1[index].ba_status = "正常";
            r1[index].bv_status = "正常";
            r1[index].answer_call_time = common.sec_to_time(Math.round((r1[index].answer_time - r1[index].call_time) / 1000));
            r1[index].call_time = moment(r1[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].answer_time = moment(r1[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].start_time = moment(r1[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].end_time = moment(r1[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].hangup_time = moment(r1[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].duration = common.sec_to_time(r1[index].duration);
            r1[index].flowa = (r1[index].flowa / 1024).toFixed(2);
            r1[index].flowb = (r1[index].flowb / 1024).toFixed(2);
            if (r1[index].wifi_type == 1 || r1[index].wifi_type == '1') {
                r1[index].wifi_type = '热点';
            }
            if (r1[index].wifi_type == 0 || r1[index].wifi_type == '0') {
                r1[index].wifi_type = 'wifi';
            }
        }
        //呼叫失败
        let re2 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel,co.wifi_type,co.wifi_name FROM re_prod.users AS us, re_prod.call_orders AS co WHERE co.user_id=co.caller_id AND co.user_id = us.id AND co.chat_id NOT IN (SELECT chat_id FROM re_prod.signal_order WHERE chat_id=co.chat_id) AND us.test in (?) AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r2 = re2.result;
        for (let index in r2) {
            r2[index].call_status = "失败";
            r2[index].answer_status = "未接通";
            r2[index].chat_status = "异常";
            r2[index].av_status = "异常";
            r2[index].aa_status = "异常";
            r2[index].ba_status = "异常";
            r2[index].bv_status = "异常";
            r2[index].call_fail_reason = r2[index].hangup_reason;
            r2[index].hangup_reason = '';
            r2[index].call_time = moment(r2[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            // r2[index].answer_time = moment(r2[index].answer_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r2[index].hangup_time = moment(r2[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r2[index].wifi_type == 1 || r2[index].wifi_type == '1') {
                r2[index].wifi_type = '热点';
            }
            if (r2[index].wifi_type == 0 || r2[index].wifi_type == '0') {
                r2[index].wifi_type = 'wifi';
            }
        }
        //接听失败
        let re3 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel,co.wifi_type,co.wifi_name FROM re_prod.users AS us, re_prod.signal_order AS so left join call_orders as co on so.chat_id=co.chat_id and co.user_id=co.caller_id WHERE so.caller_uid = us.id AND so.chat_id NOT IN (SELECT chat_id FROM re_prod.answered_calls) AND us.test in (?) AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r3 = re3.result;
        for (let index in r3) {
            r3[index].call_status = "成功";
            r3[index].answer_status = "未接通";
            r3[index].chat_status = "异常";
            r3[index].av_status = "异常";
            r3[index].aa_status = "异常";
            r3[index].ba_status = "异常";
            r3[index].bv_status = "异常";
            r3[index].answer_fail_reason = r3[index].hangup_reason;
            r3[index].hangup_reason = '';
            r3[index].call_time = moment(r3[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            // r3[index].answer_time = moment(r3[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r3[index].hangup_time = moment(r3[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r3[index].wifi_type == 1 || r3[index].wifi_type == '1') {
                r3[index].wifi_type = '热点';
            }
            if (r3[index].wifi_type == 0 || r3[index].wifi_type == '0') {
                r3[index].wifi_type = 'wifi';
            }
        }
        //接通失败
        let re4 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel,co.wifi_type,co.wifi_name FROM re_prod.users AS us, re_prod.answered_calls AS ac left join call_orders as co on ac.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ac.caller_id = us.id AND ac.chat_id NOT IN (SELECT chat_id FROM re_prod.chat_orders) AND us.test in (?) AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r4 = re4.result;
        for (let index in r4) {
            r4[index].call_status = "成功";
            r4[index].answer_status = "接通";
            r4[index].chat_status = "异常";
            r4[index].av_status = "异常";
            r4[index].aa_status = "异常";
            r4[index].ba_status = "异常";
            r4[index].bv_status = "异常";
            r4[index].chat_fail_reason = r4[index].hangup_reason;
            r4[index].answer_call_time = common.sec_to_time(Math.round((r4[index].answer_time - r4[index].call_time) / 1000));
            r4[index].call_time = moment(r4[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].answer_time = moment(r4[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].hangup_time = moment(r4[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r4[index].wifi_type == 1 || r4[index].wifi_type == '1') {
                r4[index].wifi_type = '热点';
            }
            if (r4[index].wifi_type == 0 || r4[index].wifi_type == '0') {
                r4[index].wifi_type = 'wifi';
            }
        }
        //音视频异常
        let re5 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent, co.chat_id, co.hangup_reason, co.call_time,co.callee_tel,co.wifi_type,co.wifi_name,ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb,ch.first_audioa,ch.first_audiob,ch.first_videob FROM re_prod.users AS us,re_prod.answered_calls as ac, re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id AND (ch.first_audioa = 0 or ch.first_audiob = 0 or ch.first_videob = 0) AND us.test in (?) and date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r5 = re5.result;
        for (let index in r5) {
            r5[index].call_status = "成功";
            r5[index].answer_status = "接通";
            r5[index].chat_status = "接通";
            r5[index].av_status = "异常";
            r5[index].av_fail_reason = r5[index].hangup_reason;
            r5[index].answer_call_time = common.sec_to_time(Math.round((r5[index].answer_time - r5[index].call_time) / 1000));
            r5[index].call_time = moment(r5[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].answer_time = moment(r5[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].start_time = moment(r5[index].start_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].end_time = moment(r5[index].end_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].hangup_time = moment(r5[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].flowa = (r5[index].flowa / 1024).toFixed(2);
            r5[index].flowb = (r5[index].flowb / 1024).toFixed(2);
            let reason1 = '';
            let reason2 = '';
            let reason3 = '';
            if (r5[index].first_audioa == 0 || r5[index].first_audioa == "0") {
                reason1 = "亲友端音频,";
                r5[index].aa_status = "异常";
            }
            if (r5[index].first_audiob == 0 || r5[index].first_audiob == "0") {
                reason2 = "盲人端音频,";
                r5[index].ba_status = "异常";
            }
            if (r5[index].first_videob == 0 || r5[index].first_videob == "0") {
                reason3 = "盲人端视频";
                r5[index].bv_status = "异常";
            }
            r5[index].av_reason = reason1 + reason2 + reason3 + '异常';
            if (r5[index].wifi_type == 1 || r5[index].wifi_type == '1') {
                r5[index].wifi_type = '热点';
            }
            if (r5[index].wifi_type == 0 || r5[index].wifi_type == '0') {
                r5[index].wifi_type = 'wifi';
            }
        }

        //自检明细
        let re6 = await new Promise((resolve, reject) => {
            con.query("select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg,group_concat(distinct play_msg) as play_msg,group_concat(distinct wifi_type) as wifi_type,group_concat(distinct wifi_name) as wifi_name from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and date_add(ck.createdAt, interval '08:00:00' hour_second)>? AND date_add(ck.createdAt, interval '08:00:00' hour_second)<? group by id,tel,name,gender,address,eyesight,check_id,user_agent", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r6 = re6.result;

        for (let index in r6) {
            r6[index].check_start_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].check_end_time = moment(r6[index].check_end_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].call_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].check_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            if (r6[index].status_code >= 200 && r6[index].status_code < 300) {
                r6[index].check_result = '成功';
            } else if (r6[index].status_code >= 500 && r6[index].status_code < 600) {
                r6[index].check_result = '失败';
                r6[index].check_fail_reason = r6[index].status_msg.replace('true', '').replace(',', '');
            } else {
                r6[index].check_result = '跳过';
            }
            r6[index].restore_method = r6[index].play_msg.replace(',', '');
            if (r6[index].wifi_type == 1 || r6[index].wifi_type == '1') {
                r6[index].wifi_type = '热点';
            }
            if (r6[index].wifi_type == 0 || r6[index].wifi_type == '0') {
                r6[index].wifi_type = 'wifi';
            }
        }

        let re = [];
        re = re.concat(r1, r2, r3, r4, r5, r6);
        re = common.groupAndSort(re, 'id');
        for (let k in re) {
            if (typeof(re[k].check_id) != 'undefined') {
                re[k].call_time = '';
            }
        }
        if (type == "excel") {
            let datas = [
                ['姓名', '手机号', '接听者手机号', '发起自检时间', '自检结束时间', '自检结果', '自检失败原因', '修复方式', '发起呼叫时间', '呼叫状态', '呼叫失败原因', '接听呼叫时间', '接听耗时', '接听状态', '未接听原因', '接通状态', '接通异常原因', '亲友端音频状态', '视友端音频状态', '视友端视频状态', '音视频异常原因', '通话开始时间', '通话结束时间', '挂断时间', '通话时长', '挂断原因', '亲友端流量(kb)', '盲人端流量(kb)', '视友端版本号', '亲友端版本号', '通话id', '网络类型', '网络名称']
            ];
            for (let index in re) {
                let data = [re[index].name, re[index].tel, re[index].callee_tel, re[index].check_time, re[index].check_end_time, re[index].check_result, re[index].check_fail_reason, re[index].restore_method, re[index].call_time, re[index].call_status, re[index].call_fail_reason, re[index].answer_time, re[index].answer_call_time, re[index].answer_status, re[index].answer_fail_reason, re[index].chat_status, re[index].chat_fail_reason, re[index].aa_status, re[index].ba_status, re[index].bv_status, re[index].av_fail_reason, re[index].start_time, re[index].end_time, re[index].hangup_time, re[index].duration, re[index].hangup_reason, re[index].flowa, re[index].flowb, re[index].user_agent, re[index].ua, re[index].chat_id, re[index].wifi_type, re[index].wifi_name];
                datas.push(data);
            }

            let buffer = xlsx.build([{
                name: 'sheet1',
                data: datas
            }]);

            fs.writeFileSync('public/uploads/calldetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
            ctx.response.body = {
                code: 200,
                msg: '操作成功',
                data: 'uploads/calldetail' + dd + '.xlsx'
            };
        } else {
            ctx.response.body = re;
        }
    } else {
        //全部成功
        let re1 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent,co.hangup_time, co.chat_id, co.hangup_reason, co.call_time,co.callee_tel, ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb FROM re_prod.users AS us,re_prod.answered_calls as ac, re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id AND ch.first_audioa > 0 AND ch.first_audiob > 0 AND ch.first_videob > 0 AND us.test in (?) AND us.tel=? and date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r1 = re1.result;
        for (let index in r1) {
            r1[index].call_status = "成功";
            r1[index].answer_status = "接通";
            r1[index].chat_status = "正常";
            r1[index].av_status = "正常";
            r1[index].call_time = moment(r1[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].answer_time = moment(r1[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].start_time = moment(r1[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].end_time = moment(r1[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].hangup_time = moment(r1[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].duration = common.sec_to_time(r1[index].duration);
            r1[index].flowa = (r1[index].flowa / 1024).toFixed(2);
            r1[index].flowb = (r1[index].flowb / 1024).toFixed(2);
        }
        //呼叫失败
        let re2 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel FROM re_prod.users AS us, re_prod.call_orders AS co WHERE co.user_id=co.caller_id AND co.user_id = us.id AND co.chat_id NOT IN (SELECT chat_id FROM re_prod.signal_order WHERE chat_id=co.chat_id) AND us.test in (?) AND us.tel=? AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r2 = re2.result;
        for (let index in r2) {
            r2[index].call_status = "失败";
            r2[index].answer_status = "未接通";
            r2[index].chat_status = "异常";
            r2[index].av_status = "异常";
            r2[index].call_time = moment(r2[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r2[index].answer_time = moment(r2[index].answer_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r2[index].hangup_time = moment(r2[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
        }
        //接听失败
        let re3 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel FROM re_prod.users AS us, re_prod.signal_order AS so left join call_orders as co on so.chat_id=co.chat_id and co.user_id=co.caller_id WHERE so.caller_uid = us.id AND so.chat_id NOT IN (SELECT chat_id FROM re_prod.answered_calls) AND us.test in (?) AND us.tel=? AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r3 = re3.result;
        for (let index in r3) {
            r3[index].call_status = "成功";
            r3[index].answer_status = "未接通";
            r3[index].chat_status = "异常";
            r3[index].av_status = "异常";
            r3[index].call_time = moment(r3[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r3[index].answer_time = moment(r3[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r3[index].hangup_time = moment(r3[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
        }
        //接通失败
        let re4 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel FROM re_prod.users AS us, re_prod.answered_calls AS ac left join call_orders as co on ac.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ac.caller_id = us.id AND ac.chat_id NOT IN (SELECT chat_id FROM re_prod.chat_orders) AND us.test in (?) AND us.tel=? AND date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r4 = re4.result;
        for (let index in r4) {
            r4[index].call_status = "成功";
            r4[index].answer_status = "接通";
            r4[index].chat_status = "异常";
            r4[index].av_status = "异常";
            r4[index].call_time = moment(r4[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].answer_time = moment(r4[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].hangup_time = moment(r4[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');

        }
        //音视频异常
        let re5 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent, co.chat_id, co.hangup_reason, co.call_time,co.callee_tel, ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb,ch.first_audioa,ch.first_audiob,ch.first_videob FROM re_prod.users AS us,re_prod.answered_calls as ac, re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id AND (ch.first_audioa = 0 or ch.first_audiob = 0 or ch.first_videob = 0) AND us.test in (?) AND us.tel=? and date_add(co.createdAt, interval '08:00:00' hour_second)>? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });
        let r5 = re5.result;
        for (let index in r5) {
            r5[index].call_status = "成功";
            r5[index].answer_status = "接通";
            r5[index].chat_status = "异常";
            r5[index].av_status = "异常";
            r5[index].call_time = moment(r5[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].answer_time = moment(r5[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].start_time = moment(r5[index].start_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].end_time = moment(r5[index].end_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].hangup_time = moment(r5[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].flowa = (r5[index].flowa / 1024).toFixed(2);
            r5[index].flowb = (r5[index].flowb / 1024).toFixed(2);
            let reason1 = '';
            let reason2 = '';
            let reason3 = '';
            if (r5[index].first_audioa == 0 || r5[index].first_audioa == "0") {
                reason1 = "亲友端音频,";
            }
            if (r5[index].first_audiob == 0 || r5[index].first_audiob == "0") {
                reason2 = "盲人端音频,";
            }
            if (r5[index].first_videob == 0 || r5[index].first_videob == "0") {
                reason3 = "盲人端视频";
            }
            r5[index].av_reason = reason1 + reason2 + reason3 + '异常';
        }
        //自检明细
        let re6 = await new Promise((resolve, reject) => {
            con.query("select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and us.tel=? and date_add(ck.createdAt, interval '08:00:00' hour_second)>? AND date_add(ck.createdAt, interval '08:00:00' hour_second)<? group by id,tel,name,gender,address,eyesight,check_id,user_agent", [test, tel, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve({
                        result
                    })
                }

            });
        });

        let r6 = re6.result;

        for (let index in r6) {
            r6[index].check_start_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].check_end_time = moment(r6[index].check_end_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].call_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            r6[index].check_time = moment(r6[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
            if (r6[index].status_code >= 200 && r6[index].status_code < 300) {
                r6[index].check_result = '成功';
            } else if (r6[index].status_code >= 500 && r6[index].status_code < 600) {
                r6[index].check_result = '失败';
                r6[index].check_fail_reason = r6[index].status_msg.replace('true', '').replace(',', '');
            } else {
                r6[index].check_result = '跳过';
            }
        }

        let re = [];
        re = re.concat(r1, r2, r3, r4, r5, r6);
        re = common.groupAndSort(re, 'id');
        for (let k in re) {
            if (typeof(re[k].check_id) != 'undefined') {
                re[k].call_time = '';
            }
        }
        if (type == "excel") {
            let datas = [
                ['姓名', '手机号', '接听者手机号', '发起自检时间', '自检结束时间', '自检结果', '自检失败原因', '修复方式', '呼叫状态', '接听状态', '接通状态', '音频状态', '挂断原因', '发起呼叫(自检)时间', '接听呼叫时间', '通话(自检)开始时间', '通话(自检)结束时间', '挂断时间', '通话时长', '亲友端流量(kb)', '盲人端流量(kb)', '音视频异常原因', '视友端版本号', '亲友端版本号', '通话id', ]
            ];
            for (let index in re) {
                let data = [re[index].name, re[index].tel, re[index].callee_tel, re[index].check_time, re[index].check_end_time, re[index].check_result, re[index].check_fail_reason, re[index].restore_method, re[index].call_status, re[index].answer_status, re[index].chat_status, re[index].av_status, re[index].hangup_reason, re[index].call_time, re[index].answer_time, re[index].start_time, re[index].end_time, re[index].hangup_time, re[index].duration, re[index].flowa, re[index].flowb, re[index].av_reason, re[index].user_agent, re[index].ua, re[index].chat_id];
                datas.push(data);
            }

            let buffer = xlsx.build([{
                name: 'sheet1',
                data: datas
            }]);

            fs.writeFileSync('public/uploads/calldetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
            ctx.response.body = {
                code: 200,
                msg: '操作成功',
                data: 'uploads/calldetail' + dd + '.xlsx'
            };
        } else {
            ctx.response.body = re;
        }
    }
});
/**
 * 客服接听情况统计
 */
router.get('/getCusAnswer', async(ctx, next) => {
    let dd = moment(Date.now()).format('YYYYMMDD');
    let key = ctx.query['key[]'];
    let tel = ctx.query.tel;
    let key1 = '';
    let key2 = '';
    let type = ctx.query.type; //是否要导出excel
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    let re = await new Promise((resolve, reject) => {
        con.query("select us.tel,us.name,callee_id,answernum,chatnum,durations from (select count(*) as answernum,callee_id from answered_calls as ac where date_add(ac.createdAt, interval '08:00:00' hour_second) > ? and date_add(ac.createdAt, interval '08:00:00' hour_second) < ? group by callee_id) as A,(select count(*) as chatnum,sum(duration) as durations,callee_uid from chat_orders as co where date_add(co.createdAt, interval '08:00:00' hour_second) > ? and date_add(co.createdAt, interval '08:00:00' hour_second) < ? group by callee_uid) as C,users as us where A.callee_id=C.callee_uid and A.callee_id=us.id and us.role=8;", [key1, key2, key1, key2], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                resolve(result);
            }
        });
    });
    if (type == "excel") {
        let datas = [
            ['姓名', '手机号', '接听次数', '接通次数', '通话总时长']
        ];
        for (let index in re) {
            re[index].durations = common.sec_to_time(re[index].durations);
            let data = [re[index].name, re[index].tel, re[index].answernum, re[index].chatnum, re[index].durations];
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/cusanswer' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/cusanswer' + dd + '.xlsx'
        };
    } else {
        for (let index in re) {
            re[index].durations = common.sec_to_time(re[index].durations);
        }
        ctx.response.body = re;
    }
});

/**
 * 客服通话明细
 */
router.get('/getCusAnswerDetail', async(ctx, next) => {
    let dd = moment(Date.now()).format('YYYYMMDD');
    let key = ctx.query['key[]'];
    let tel = ctx.query.tel;
    let key1 = '';
    let key2 = '';
    let type = ctx.query.type; //是否要导出excel
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    let re = await new Promise((resolve, reject) => {
        con.query("select ac.callee_id,us.tel,us.name,co.hangup_reason,co.hangup_time,co.caller_tel, ac.answer_time,ch.chat_id,ch.start_time,ch.end_time,ch.duration from users as us,call_orders as co,answered_calls as ac left join chat_orders as ch on ac.chat_id=ch.chat_id where ac.callee_id=us.id and us.tel=? and ac.chat_id=co.chat_id and co.caller_id=co.user_id and date_add(ac.createdAt, interval '08:00:00' hour_second) > ? and date_add(ac.createdAt, interval '08:00:00' hour_second) < ?", [tel, key1, key2], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                resolve(result);
            }
        });
    });
    if (type == "excel") {
        let datas = [
            ['姓名', '手机号', '呼叫者手机号', '接听时间', '通话开始时间', '通话结束时间', '挂断时间', '通话时长', '挂断原因']
        ];
        for (let index in re) {
            re[index].hangup_time = moment(re[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re[index].answer_time = moment(re[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            re[index].start_time = moment(re[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            re[index].end_time = moment(re[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            re[index].duration = common.sec_to_time(re[index].duration);
            let data = [re[index].name, re[index].tel, re[index].caller_tel, re[index].answer_time, re[index].start_time, re[index].end_time, re[index].hangup_time, re[index].duration, re[index].duration];
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/cusanswerdetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/cusanswerdetail' + dd + '.xlsx'
        };
    } else {
        for (let index in re) {
            re[index].hangup_time = moment(re[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re[index].answer_time = moment(re[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            re[index].start_time = moment(re[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            re[index].end_time = moment(re[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            re[index].duration = common.sec_to_time(re[index].duration);
        }
        ctx.response.body = re;
    }

});

/**
 * 统计用户呼通次数
 */
router.get('/getUserChatNum', async(ctx, next) => {
    let timeType = ctx.query.timeType;
    let re = {};
    let demos = parseInt(ctx.query.demos);
    let sql = '';
    let temp = '';
    if (timeType == "day") {
        let key = ctx.query['key[]'];
        let key1 = '';
        let key2 = '';
        if (typeof(key) != 'undefined') {
            key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        } else {
            key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
            key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        }
        if (demos == 0) {
            //呼通次数
            sql = "select caller_uid, count( * ) as chatnum from chat_orders as ch  where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0
            };
        } else {
            //通话时长
            sql = "select caller_uid,sum(duration) as duration from chat_orders as ch where date_add(ch.createdAt,interval '08:00:00' hour_second) > ? and date_add(ch.createdAt,interval '08:00:00' hour_second) < ? group by caller_uid";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0,
                seven: 0,
                eight: 0,
                nine: 0
            };
        }
        re = await new Promise((resolve, reject) => {
            con.query(sql, [key1, key2], function(err, result) {
                console.log(err);
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (demos == 0) {
                        for (let index in result) {
                            if (parseInt(result[index].chatnum) == 1) {
                                temp.one++;
                            }
                            if (parseInt(result[index].chatnum) >= 2 && parseInt(result[index].chatnum) <= 4) {
                                temp.two++;
                            }
                            if (parseInt(result[index].chatnum) >= 5 && parseInt(result[index].chatnum) <= 10) {
                                temp.three++;
                            }
                            if (parseInt(result[index].chatnum) >= 11 && parseInt(result[index].chatnum) <= 20) {
                                temp.four++;
                            }
                            if (parseInt(result[index].chatnum) >= 21 && parseInt(result[index].chatnum) <= 50) {
                                temp.five++;
                            }
                            if (parseInt(result[index].chatnum) > 50) {
                                temp.six++;
                            }
                        }
                    } else {
                        for (let index in result) {
                            if (parseInt(result[index].duration) >= 0 && parseInt(result[index].duration <= 3)) {
                                temp.one++;
                            }
                            if (parseInt(result[index].duration) > 3 && parseInt(result[index].duration <= 10)) {
                                temp.two++;
                            }
                            if (parseInt(result[index].duration) > 10 && parseInt(result[index].duration) <= 30) {
                                temp.three++;
                            }
                            if (parseInt(result[index].duration) > 30 && parseInt(result[index].duration) <= 60) {
                                temp.four++;
                            }
                            if (parseInt(result[index].duration) > 60 && parseInt(result[index].duration) <= 180) {
                                temp.five++;
                            }
                            if (parseInt(result[index].duration) > 180 && parseInt(result[index].duration) <= 600) {
                                temp.six++;
                            }
                            if (parseInt(result[index].duration) > 600 && parseInt(result[index].duration) <= 1800) {
                                temp.seven++;
                            }
                            if (parseInt(result[index].duration) > 1800 && parseInt(result[index].duration) <= 3600) {
                                temp.eight++;
                            }
                            if (parseInt(result[index].duration) > 3600) {
                                temp.nine++;
                            }
                        }
                    }
                    resolve(temp);
                }
            });
        });
    }
    if (timeType == "week") {
        let week = '';
        let key = ctx.query.key;
        console.log(key);
        if (key == '') {
            week = common.getWeek(moment(Date.now()).format('YYYY-MM-DD'));
        } else {
            week = common.getWeek(moment(key).format('YYYY-MM-DD'));
        }
        console.log(week);
        if (demos == 0) {
            //呼通次数
            sql = "select caller_uid, count( * ) as chatnum from chat_orders as ch  where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by caller_uid";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0
            };
        } else {
            //通话时长
            sql = "select caller_uid,sum(duration) as duration from chat_orders as ch  where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by caller_uid;";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0,
                seven: 0,
                eight: 0,
                nine: 0
            };
        }
        console.log(sql);
        re = await new Promise((resolve, reject) => {
            con.query(sql, [week], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (demos == 0) {
                        for (let index in result) {
                            if (parseInt(result[index].chatnum) == 1) {
                                temp.one++;
                            }
                            if (parseInt(result[index].chatnum) >= 2 && parseInt(result[index].chatnum) <= 4) {
                                temp.two++;
                            }
                            if (parseInt(result[index].chatnum) >= 5 && parseInt(result[index].chatnum) <= 10) {
                                temp.three++;
                            }
                            if (parseInt(result[index].chatnum) >= 11 && parseInt(result[index].chatnum) <= 20) {
                                temp.four++;
                            }
                            if (parseInt(result[index].chatnum) >= 21 && parseInt(result[index].chatnum) <= 50) {
                                temp.five++;
                            }
                            if (parseInt(result[index].chatnum) > 50) {
                                temp.six++;
                            }
                        }
                    } else {
                        for (let index in result) {
                            if (parseInt(result[index].duration) >= 0 && parseInt(result[index].duration <= 3)) {
                                temp.one++;
                            }
                            if (parseInt(result[index].duration) > 3 && parseInt(result[index].duration <= 10)) {
                                temp.two++;
                            }
                            if (parseInt(result[index].duration) > 10 && parseInt(result[index].duration) <= 30) {
                                temp.three++;
                            }
                            if (parseInt(result[index].duration) > 30 && parseInt(result[index].duration) <= 60) {
                                temp.four++;
                            }
                            if (parseInt(result[index].duration) > 60 && parseInt(result[index].duration) <= 180) {
                                temp.five++;
                            }
                            if (parseInt(result[index].duration) > 180 && parseInt(result[index].duration) <= 600) {
                                temp.six++;
                            }
                            if (parseInt(result[index].duration) > 600 && parseInt(result[index].duration) <= 1800) {
                                temp.seven++;
                            }
                            if (parseInt(result[index].duration) > 1800 && parseInt(result[index].duration) <= 3600) {
                                temp.eight++;
                            }
                            if (parseInt(result[index].duration) > 3600) {
                                temp.nine++;
                            }
                        }
                    }
                    resolve(temp);
                }
            });
        });
    }
    if (timeType == "month") {
        let m = '';
        let key = ctx.query.key;
        console.log(key);
        if (key == '') {
            let d = new Date();
            m = d.getMonth() + 1;
        } else {
            m = moment(key).format('MM');
        }
        console.log(m);
        if (demos == 0) {
            //呼通次数
            sql = "select caller_uid, count( * ) as chatnum from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? group by caller_uid";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0
            };
        } else {
            //通话时长
            sql = "select caller_uid,sum(duration) as duration from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? group by caller_uid";
            temp = {
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0,
                six: 0,
                seven: 0,
                eight: 0,
                nine: 0
            };
        }
        console.log(sql);
        re = await new Promise((resolve, reject) => {
            con.query(sql, [m], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (demos == 0) {
                        for (let index in result) {
                            if (parseInt(result[index].chatnum) == 1) {
                                temp.one++;
                            }
                            if (parseInt(result[index].chatnum) >= 2 && parseInt(result[index].chatnum) <= 4) {
                                temp.two++;
                            }
                            if (parseInt(result[index].chatnum) >= 5 && parseInt(result[index].chatnum) <= 10) {
                                temp.three++;
                            }
                            if (parseInt(result[index].chatnum) >= 11 && parseInt(result[index].chatnum) <= 20) {
                                temp.four++;
                            }
                            if (parseInt(result[index].chatnum) >= 21 && parseInt(result[index].chatnum) <= 50) {
                                temp.five++;
                            }
                            if (parseInt(result[index].chatnum) > 50) {
                                temp.six++;
                            }
                        }
                    } else {
                        for (let index in result) {
                            if (parseInt(result[index].duration) >= 0 && parseInt(result[index].duration <= 3)) {
                                temp.one++;
                            }
                            if (parseInt(result[index].duration) > 3 && parseInt(result[index].duration <= 10)) {
                                temp.two++;
                            }
                            if (parseInt(result[index].duration) > 10 && parseInt(result[index].duration) <= 30) {
                                temp.three++;
                            }
                            if (parseInt(result[index].duration) > 30 && parseInt(result[index].duration) <= 60) {
                                temp.four++;
                            }
                            if (parseInt(result[index].duration) > 60 && parseInt(result[index].duration) <= 180) {
                                temp.five++;
                            }
                            if (parseInt(result[index].duration) > 180 && parseInt(result[index].duration) <= 600) {
                                temp.six++;
                            }
                            if (parseInt(result[index].duration) > 600 && parseInt(result[index].duration) <= 1800) {
                                temp.seven++;
                            }
                            if (parseInt(result[index].duration) > 1800 && parseInt(result[index].duration) <= 3600) {
                                temp.eight++;
                            }
                            if (parseInt(result[index].duration) > 3600) {
                                temp.nine++;
                            }
                        }
                    }
                    resolve(temp);
                }
            });
        });
    }
    ctx.response.body = re;
});

/**
 * 统计用户呼通次数
 */
router.get('/getUserChatNumDetail', async(ctx, next) => {
    let timeType = ctx.query.timeType;
    let re = {};
    let demos = parseInt(ctx.query.demos);
    let sql = '';
    let temp = '';
    let num = ctx.query['num[]'];

    if (timeType == "day") {
        let key = ctx.query['key[]'];
        let key1 = '';
        let key2 = '';
        if (typeof(key) != 'undefined') {
            key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        } else {
            key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
            key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        }
        if (demos == 0) {

            //呼通次数
            if (typeof(num) == 'string' && num == 1) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch  where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid) AS B where A.caller_uid=B.caller_uid and B.chatnum=1";
            }
            if (typeof(num) == 'string' && num == 50) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch  where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid) AS B where A.caller_uid=B.caller_uid and B.chatnum > 50";
            }
            if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch  where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid) AS B where A.caller_uid=B.caller_uid and B.chatnum >= ? and B.chatnum <= ?";
            }
        } else {
            //通话时长
            if (typeof(num) == 'string') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid,caller_tel) as A,(select caller_uid,sum(duration) as durations from chat_orders as ch where date_add(ch.createdAt,interval '08:00:00' hour_second) > ? and date_add(ch.createdAt,interval '08:00:00' hour_second) < ? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > 3600";
            } else if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order where date_add(createdAt,interval '08:00:00' hour_second) > ? and date_add(createdAt,interval '08:00:00' hour_second) < ? group by caller_uid,caller_tel) as A,(select caller_uid,sum(duration) as durations from chat_orders as ch where date_add(ch.createdAt,interval '08:00:00' hour_second) > ? and date_add(ch.createdAt,interval '08:00:00' hour_second) < ? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > ? and B.durations < ?";
            }

        }
        console.log(sql);
        re = await new Promise((resolve, reject) => {
            if (typeof(num) == 'object') {
                con.query(sql, [key1, key2, key1, key2, num[0], num[1]], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        console.log(result);
                        resolve(result);
                    }
                });
            } else {
                con.query(sql, [key1, key2, key1, key2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            }

        });
    }
    if (timeType == "week") {
        let week = '';
        let key = ctx.query.key;
        console.log(key);
        if (key == '') {
            week = common.getWeek(moment(Date.now()).format('YYYY-MM-DD'));
        } else {
            week = common.getWeek(moment(key).format('YYYY-MM-DD'));
        }
        console.log(week);
        if (demos == 0) {
            //呼通次数
            if (typeof(num) == 'string' && num == 1) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum, WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1) as weeks from chat_orders as ch where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by weeks, caller_uid order by weeks DESC) as B where A.caller_uid=B.caller_uid and B.chatnum=1";
            }
            if (typeof(num) == 'string' && num == 50) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum, WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1) as weeks from chat_orders as ch where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by weeks, caller_uid order by weeks DESC) as B where A.caller_uid=B.caller_uid and B.chatnum > 50";
            }
            if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum, WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1) as weeks from chat_orders as ch where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by weeks, caller_uid order by weeks DESC) as B where A.caller_uid=B.caller_uid and B.chatnum >= ? and B.chatnum <= ?";
            }
        } else {
            //通话时长
            if (typeof(num) == 'string') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, sum(duration) as durations from chat_orders as ch where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > 3600";
            } else if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, sum(duration) as durations from chat_orders as ch where WEEK(date_add(createdAt,interval '08:00:00' hour_second), 1)=? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > ? and B.durations < ?";
            }
        }
        console.log(sql);
        if (typeof(num) == 'object') {
            re = await new Promise((resolve, reject) => {
                con.query(sql, [week, week, num[0], num[1]], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        } else {
            re = await new Promise((resolve, reject) => {
                con.query(sql, [week, week], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }

    }
    if (timeType == "month") {
        let m = '';
        let key = ctx.query.key;
        console.log(key);
        if (key == '') {
            m = moment(Date.now()).format('MM');
        } else {
            m = moment(key).format('MM');
        }
        console.log(m);

        if (demos == 0) {
            //呼通次数
            if (typeof(num) == 'string' && num == 1) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  group by caller_uid) as B where A.caller_uid=B.caller_uid and B.chatnum=1";
            }
            if (typeof(num) == 'string' && num == 50) {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  group by caller_uid) as B where A.caller_uid=B.caller_uid and B.chatnum > 50";
            }
            if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.chatnum from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, count( * ) as chatnum from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=?  group by caller_uid) as B where A.caller_uid=B.caller_uid and B.chatnum >= ? and B.chatnum <= ?";
            }
        } else {
            //通话时长
            if (typeof(num) == 'string') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, sum(duration) as durations from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > 3600";
            } else if (typeof(num) == 'object') {
                sql = "select A.caller_uid,A.caller_tel,A.last_call_time,B.durations from (select caller_uid,caller_tel,max(call_time) as last_call_time from signal_order as so where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? and chat_id in (select chat_id from chat_orders) group by caller_uid,caller_tel) as A,(select caller_uid, sum(duration) as durations from chat_orders as ch where MONTH(date_add(createdAt,interval '08:00:00' hour_second))=? group by caller_uid) as B where A.caller_uid=B.caller_uid and B.durations > ? and B.durations < ?";
            }
        }

        console.log(sql);
        if (typeof(num) == 'object') {
            re = await new Promise((resolve, reject) => {
                con.query(sql, [m, m, num[0], num[1]], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        } else {
            re = await new Promise((resolve, reject) => {
                con.query(sql, [m, m], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }

    }
    ctx.response.body = re;
});

router.get('/getChatTime', async(ctx, next) => {
    let timeType = ctx.query.timeType;
    let re = {};
    let demos = parseInt(ctx.query.demos);
    let sql = '';
    let temp = '';
    let num = ctx.query['num[]'];

    //按日
    if (timeType == 'day') {
        let key = ctx.query['key[]'];
        let key1 = '';
        let key2 = '';
        if (typeof(key) != 'undefined') {
            key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        } else {
            key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
            key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        }
        if (demos == 0) {
            //实时通话
            //今天
            let today = moment(Date.now()).format('YYYY-MM-DD');
            let yestoday = moment(Date.now()).subtract(1, 'days').format('YYYY-MM-DD');
            sql = "select count(*) as chatnum,Hour(date_add(createdAt,interval '08:00:00' hour_second)) as Hour from chat_orders where date(date_add(createdAt,interval '08:00:00' hour_second)) = ? group by  Hour";
            let re1 = await new Promise((resolve, reject) => {
                con.query(sql, [today], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
            let re2 = await new Promise((resolve, reject) => {
                con.query(sql, [yestoday], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
            ctx.response.body = { 'today': re1, 'yestoday': re2 };

        }
        if (demos == 1) {
            //通话时段
            sql = "select count(*) as chatnum,Hour(date_add(createdAt,interval '08:00:00' hour_second)) as Hour from chat_orders where date_add(createdAt,interval '08:00:00' hour_second) >? and date_add(createdAt,interval '08:00:00' hour_second) <? group by  Hour";
            re = await new Promise((resolve, reject) => {
                con.query(sql, [key1, key2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
            ctx.response.body = re;
        }
        if (demos == 2) {
            //通话时长
            sql = "select sum(duration) as durations,date(date_add(createdAt,interval '08:00:00' hour_second)) as day from chat_orders where date_add(createdAt,interval '08:00:00' hour_second) >? and date_add(createdAt,interval '08:00:00' hour_second) <? group by day";
            re = await new Promise((resolve, reject) => {
                con.query(sql, [key1, key2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
            for (let index in re) {
                re[index].day = moment(re[index].day).format('MM-DD');
            }
            ctx.response.body = re;
        }

    }
    //按周
    if (timeType == 'week') {
        let key = ctx.query.key;
        console.log(key);
        let w = '';
        if (key == '' || typeof(key) == 'undefined') {
            w = common.getWeek();
        } else {
            w = common.getWeek(key);
        }
        console.log(w);
        if (demos == 1) {
            //通话时段
            sql = "select count(*) as chatnum,Hour(date_add(createdAt,interval '08:00:00' hour_second)) as Hour from chat_orders where week(date_add(createdAt,interval '08:00:00' hour_second),1)=? group by  Hour";
        }
        if (demos == 2) {
            //通话时长
            sql = "select sum(duration) as durations,week(date_add(createdAt,interval '08:00:00' hour_second)) as week from chat_orders group by week";
        }
        re = await new Promise((resolve, reject) => {
            con.query(sql, [w], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        ctx.response.body = re;
    }
    //按月
    if (timeType == 'month') {
        let key = ctx.query.key;
        let m = '';
        if (key == '' || typeof(key) == 'undefined') {
            m = moment(Date.now()).format('MM');
        } else {
            m = moment(key).format('MM');
        }
        console.log(m + '月');
        if (demos == 1) {
            //通话时段
            sql = "select count(*) as chatnum,Hour(date_add(createdAtk)) as Hour from chat_orders where month(date_add(createdAt,interval '08:00:00' hour_second))=? group by Hour";
        }
        if (demos == 2) {
            //通话时长
            sql = "select sum(duration) as durations,month(date_add(createdAt,interval '08:00:00' hour_second)) as month from chat_orders group by month";
        }
        re = await new Promise((resolve, reject) => {
            con.query(sql, [m], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        ctx.response.body = re;
    }

});

/**
 * 一键自检的检测
 */
router.get('/selfCheck', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let timeType = ctx.query.timeType;
    let userType = ctx.query.userType;
    let sql = '';
    let re = '';
    let test = [];
    if (userType == true || userType == "true") {
        test = [0, 1];
    }
    if (userType == false || userType == "false") {
        test = [0];
    }
    //按日统计
    if (timeType == 'day') {
        if (typeof(key) != 'undefined') {
            key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        } else {
            key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
            key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        }
        sql = "select user_id,check_id,max(status_code) as status_code,date(date_add(checklist.createdAt,interval '08:00:00' hour_second)) as dd from checklist,users where users.id=checklist.user_id and users.test in (?) and date_add(checklist.createdAt,interval '08:00:00' hour_second) >? and date_add(checklist.createdAt,interval '08:00:00' hour_second) <? group by check_id,user_id,dd order by dd DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        let map = [];
        let dest = [];
        for (let index in re) {
            let tmp = re[index];
            let df = moment(tmp.dd).format('YYYY-MM-DD');
            if (!dest[df]) {
                map.push(df);
                dest[df] = {
                    total: 0,
                    succ: 0,
                    fail: 0,
                };
            }
            dest[df].total++;
            if (tmp.status_code >= 200 && tmp.status_code < 300) {
                dest[df].succ++;
            }
            if (tmp.status_code >= 500 && tmp.status_code < 600) {
                dest[df].fail++;
            }

        }
        let r = [];
        for (let i in map) {
            r.push({
                total: dest[map[i]].total,
                succ: dest[map[i]].succ + '/' + Math.round(parseFloat(dest[map[i]].succ) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                fail: dest[map[i]].fail + '/' + Math.round(parseFloat(dest[map[i]].fail) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                date: map[i],
                succ2: dest[map[i]].succ,
                fail2: dest[map[i]].fail,
            })
        }
        ctx.response.body = r;

    }
    //按周统计
    if (timeType == 'week') {
        sql = "select user_id,check_id,max(status_code) as status_code,week(date_add(checklist.createdAt,interval '08:00:00' hour_second),1) as ww from checklist,users where checklist.user_id=users.id and users.test in (?) group by check_id,user_id,ww order by ww DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        let map = [];
        let dest = [];
        for (let index in re) {
            let tmp = re[index];
            let df = tmp.ww;
            if (!dest[df]) {
                map.push(df);
                dest[df] = {
                    total: 0,
                    succ: 0,
                    fail: 0,
                };
            }
            dest[df].total++;
            if (tmp.status_code >= 200 && tmp.status_code < 300) {
                dest[df].succ++;
            }
            if (tmp.status_code >= 500 && tmp.status_code < 600) {
                dest[df].fail++;
            }

        }
        let r = [];
        for (let i in map) {
            r.push({
                total: dest[map[i]].total,
                succ: dest[map[i]].succ + '/' + Math.round(parseFloat(dest[map[i]].succ) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                fail: dest[map[i]].fail + '/' + Math.round(parseFloat(dest[map[i]].fail) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                date: map[i],
                succ2: dest[map[i]].succ,
                fail2: dest[map[i]].fail,
            })
        }
        ctx.response.body = r;
    }

    //按月统计
    if (timeType == 'month') {
        sql = "select user_id,check_id,max(status_code) as status_code,month(date_add(checklist.createdAt,interval '08:00:00' hour_second)) as mm from checklist,users where checklist.user_id=users.id and users.test in (?) group by check_id,user_id,mm order by mm DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        let map = [];
        let dest = [];
        for (let index in re) {
            let tmp = re[index];
            let df = tmp.mm;
            if (!dest[df]) {
                map.push(df);
                dest[df] = {
                    total: 0,
                    succ: 0,
                    fail: 0,
                };
            }
            dest[df].total++;
            if (tmp.status_code >= 200 && tmp.status_code < 300) {
                dest[df].succ++;
            }
            if (tmp.status_code >= 500 && tmp.status_code < 600) {
                dest[df].fail++;
            }

        }
        let r = [];
        for (let i in map) {
            r.push({
                total: dest[map[i]].total,
                succ: dest[map[i]].succ + '/' + Math.round(parseFloat(dest[map[i]].succ) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                fail: dest[map[i]].fail + '/' + Math.round(parseFloat(dest[map[i]].fail) / parseFloat(dest[map[i]].total) * 10000) / 100.00 + "%",
                date: map[i],
                succ2: dest[map[i]].succ,
                fail2: dest[map[i]].fail,
            })
        }
        ctx.response.body = r;
    }

});

/**
 * 一键自检明细
 */
router.get('/selfCheckDetail', async(ctx, next) => {
    let timeType = ctx.query.timeType;
    let userType = ctx.query.userType;
    let type = ctx.query.type;
    let test = [];
    let re = '';
    let sql = '';
    let code1 = 0;
    let code2 = 0;
    let reason = ctx.query.reason;

    if (userType == 'true' || userType == true) {
        test = [0, 1];
    }
    if (userType == 'false' || userType == false) {
        test = [0];
    }
    if (type == "all") {
        code1 = 0;
        code2 = 1000;
    }
    if (type == "success") {
        code1 = 200;
        code2 = 300;
    }
    if (type == "fail") {
        code1 = 500;
        code2 = 600;
    }
    if (typeof(reason) == 'undefined' || reason == '') {
        if (timeType == 'day') {
            let key = ctx.query['key[]'];
            let key1 = '';
            let key2 = '';
            if (typeof(key) != 'undefined') {
                key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
                key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            } else {
                key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
                key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
            }
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and date_add(ck.createdAt, interval '08:00:00' hour_second)>? AND date_add(ck.createdAt, interval '08:00:00' hour_second)<? group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code< ?";
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, key1, key2, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        if (timeType == 'week') {
            let w = parseInt(ctx.query.key);
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and week(date_add(ck.createdAt, interval '08:00:00' hour_second),1)=? group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code < ?";
            console.log(sql);
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, w, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        if (timeType == 'month') {
            let key = parseInt(ctx.query.key);
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and month(date_add(ck.createdAt, interval '08:00:00' hour_second))=? group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code < ?";
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, key, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
    } else {
        if (timeType == 'day') {
            let key = ctx.query['key[]'];
            let key1 = '';
            let key2 = '';
            if (typeof(key) != 'undefined') {
                key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
                key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            } else {
                key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
                key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
            }
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and date_add(ck.createdAt, interval '08:00:00' hour_second)>? AND date_add(ck.createdAt, interval '08:00:00' hour_second)<? and status_msg like " + "'%" + reason + "%'" + "group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code < ?";
            console.log(sql);
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, key1, key2, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        if (timeType == 'week') {
            let w = parseInt(ctx.query.key);
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and week(date_add(ck.createdAt, interval '08:00:00' hour_second),1)=? and status_msg like " + "'%" + reason + "%'" + " group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code < ?";
            console.log(sql);
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, w, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        if (timeType == 'month') {
            let key = parseInt(ctx.query.key);
            sql = "select * from (select us.id, us.tel, us.name, us.gender, us.address, us.eyesight,ck.check_id,ck.user_agent,min(ck.start_time) as check_start_time,max(ck.end_time) as check_end_time,max(ck.status_code) as status_code,group_concat(distinct status_msg) as status_msg from checklist AS ck,users AS us where us.id=ck.user_id and us.test in (?) and month(date_add(ck.createdAt, interval '08:00:00' hour_second))=? and status_msg like " + "'%" + reason + "%'" + " group by id,tel,name,gender,address,eyesight,check_id,user_agent) as T where T.status_code >= ? and T.status_code < ?";
            re = await new Promise((resolve, reject) => {
                con.query(sql, [test, key, code1, code2], function(err, result) {
                    if (err) {
                        resolve({
                            code: 10004,
                            msg: '网络出错',
                            data: ''
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        }
    }

    for (let index in re) {
        re[index].check_start_time = moment(re[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
        re[index].check_end_time = moment(re[index].check_end_time).format('YYYY-MM-DD HH:mm:ss');
        re[index].check_time = moment(re[index].check_start_time).format('YYYY-MM-DD HH:mm:ss');
        if (re[index].status_code >= 200 && re[index].status_code < 300) {
            re[index].check_result = '成功';
        } else if (re[index].status_code >= 500 && re[index].status_code < 600) {
            re[index].check_result = '失败';
            re[index].restore_method = re[index].status_msg.replace('true', '').replace(',', '');
        } else {
            re[index].check_result = '跳过';
        }
    }
    ctx.response.body = re;
});

/**
 * 一键自检失败原因统计
 */
router.get('/selfCheckFailReason', async(ctx, next) => {
    let timeType = ctx.query.timeType;
    let userType = ctx.query.userType;
    let total = parseInt(ctx.query.total);
    let fail = parseInt(ctx.query.fail);
    let test = [];
    let re = '';
    let sql = '';
    if (userType == 'true' || userType == true) {
        test = [0, 1];
    }
    if (userType == 'false' || userType == false) {
        test = [0];
    }
    if (timeType == 'day') {
        let key = ctx.query['key[]'];
        let key1 = '';
        let key2 = '';
        if (typeof(key) != 'undefined') {
            key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
            key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        } else {
            key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
            key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        }
        let total = await new Promise((resolve, reject) => {
            con.query("select count(distinct check_id) as checknum from checklist,users where checklist.user_id=users.id and users.test in (?) and date_add(checklist.createdAt,interval '08:00:00' hour_second) >? and date_add(checklist.createdAt,interval '08:00:00' hour_second) <?", [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                    })
                } else {
                    resolve(result);
                }
            })
        });
        sql = "select status_msg,count(*) as num,count(distinct user_id) as usernum from checklist,users where checklist.user_id=users.id and users.test in (?) and status_code >=500 and status_code<600 and date_add(checklist.createdAt,interval '08:00:00' hour_second) >? and date_add(checklist.createdAt,interval '08:00:00' hour_second) <? group by status_msg order by num DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test, key1, key2], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        let failtotal = 0;
        for (let index in re) {
            failtotal += re[index].num;
        }
        for (let index in re) {
            re[index].failRate = Math.round(parseFloat(re[index].num) / parseFloat(total[0].checknum) * 10000) / 100.00 + "%"; //相对总的自检数
            re[index].failRate2 = Math.round(parseFloat(re[index].num) / parseFloat(failtotal) * 10000) / 100.00 + "%"; //相对总的自检失败数
        }
    }
    if (timeType == 'week') {
        let key = parseInt(ctx.query.key);
        sql = "select status_msg,count(*) as num,count(distinct user_id) as usernum from checklist,users where checklist.user_id=users.id and users.test in (?) and status_code >=500 and status_code<600 and week(date_add(checklist.createdAt,interval '08:00:00' hour_second),1) =? group by status_msg order by num DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test, key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        for (let index in re) {
            re[index].failRate = Math.round(parseFloat(re[index].num) / parseFloat(total) * 10000) / 100.00 + "%"; //相对总的自检数
            re[index].failRate2 = Math.round(parseFloat(re[index].num) / parseFloat(fail) * 10000) / 100.00 + "%"; //相对总的自检失败数
        }
    }
    if (timeType == 'month') {
        let key = parseInt(ctx.query.key);
        sql = "select status_msg,count(*) as num,count(distinct user_id) as usernum from checklist,users where checklist.user_id=users.id and users.test in (?) and status_code >=500 and status_code<600 and month(date_add(checklist.createdAt,interval '08:00:00' hour_second)) =? group by status_msg order by num DESC";
        re = await new Promise((resolve, reject) => {
            con.query(sql, [test, key], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    resolve(result);
                }
            });
        });
        for (let index in re) {
            re[index].failRate = Math.round(parseFloat(re[index].num) / parseFloat(total) * 10000) / 100.00 + "%"; //相对总的自检数
            re[index].failRate2 = Math.round(parseFloat(re[index].num) / parseFloat(fail) * 10000) / 100.00 + "%"; //相对总的自检失败数
        }
    }
    ctx.response.body = re;
});
module.exports = router;
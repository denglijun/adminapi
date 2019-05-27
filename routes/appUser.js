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
                                    if (result[index].createdAt) {
                                        result[index].createdAt = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
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
        if (re.data.total && re.data.total > 0) {
            for (let i in re.data.records) {
                //最后使用时间
                let lastUseTime2 = await new Promise((resolve, reject) => {
                    con.query('select createdAt as lastUseTime from signal_order where caller_uid=? order by createdAt DESC limit 1', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用次数
                let totalTimes2 = await new Promise(function(resolve, reject) {
                    con.query('select count(*) as totalTimes from signal_order where caller_uid=?', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用时长
                let totalTime2 = await new Promise(function(resolve, reject) {
                    con.query('select sum(duration2) as totalTime from chat_orders where caller_uid=?', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let lut = '';
                let tts = 0;
                let tt = 0;
                if (lastUseTime2 && lastUseTime2.length > 0) {
                    lut = moment(lastUseTime2[0].lastUseTime).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                if (totalTimes2 && totalTimes2.length > 0) {
                    tts = totalTimes2[0].totalTimes;
                }
                if (totalTime2 && totalTime2.length > 0) {
                    tt = common.sec_to_time(totalTime2[0].totalTime);
                }
                let temp = { lastUseTime: lut, totalTimes: tts, totalTime: tt };
                re.data.records[i] = Object.assign(re.data.records[i], temp);
            }
        }

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
                                    if (result[index].createdAt) {
                                        result[index].createdAt = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
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
        if (re.data.total && re.data.total > 0) {
            for (let i in re.data.records) {
                //最后使用时间
                let lastUseTime2 = await new Promise((resolve, reject) => {
                    con.query('select createdAt as lastUseTime from signal_order where caller_uid=? order by createdAt DESC limit 1', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用次数
                let totalTimes2 = await new Promise(function(resolve, reject) {
                    con.query('select count(*) as totalTimes from signal_order where caller_uid=?', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用时长
                let totalTime2 = await new Promise(function(resolve, reject) {
                    con.query('select sum(duration2) as totalTime from chat_orders where caller_uid=?', [re.data.records[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let lut = '';
                let tts = 0;
                let tt = 0;
                if (lastUseTime2 && 　lastUseTime2.length > 0) {
                    lut = moment(lastUseTime2[0].lastUseTime).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                if (totalTimes2 && totalTimes2.length > 0) {
                    tts = totalTimes2[0].totalTimes;
                }
                if (totalTime2 && totalTime2.length > 0) {
                    tt = common.sec_to_time(totalTime2[0].totalTime);
                }
                let temp = { lastUseTime: lut, totalTimes: tts, totalTime: tt };
                re.data.records[i] = Object.assign(re.data.records[i], temp);
            }
        }
        ctx.response.body = re;
    }
});


/**
 * APP端用户信息
 */

router.get('/appUserInfo', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query.key;
    let type = 1;
    let dd = moment(Date.now()).format('YYYYMMDD');
    if (ctx.query.type) {
        type = parseInt(ctx.query.type); //1正常展示,2导出excel
    }
    let re = {};
    if (key == '' || typeof(key) == 'undefined') {
        re = await new Promise((resolve, reject) => {
            con.query('select count(id) as angelnum  from users', [], function(err, result) {
                if (err) {
                    resolve({
                        code: 10004,
                        msg: '网络出错',
                        data: ''
                    });
                } else {
                    if (result[0].angelnum > 0) {
                        let total = result[0].angelnum;
                        let sql = '';
                        let start = 0;
                        let end = 0;
                        if (type == 1) {
                            start = (parseInt(page) - 1) * parseInt(pagenum);
                            end = parseInt(pagenum);
                        }
                        if (type == 2) {
                            start = 0;
                            end = parseInt(total);
                        }
                        con.query('select * from users order by createdAt DESC limit ?,?', [start, end], function(err, result) {
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
                                    if (result[index].gender == "0") {
                                        result[index].gender = '未知';
                                    }
                                    if (result[index].gender == "1") {
                                        result[index].gender = '男';
                                    }
                                    if (result[index].gender == "2") {
                                        result[index].gender = '女';
                                    }
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
                                    if (result[index].auth == 1) {
                                        result[index].auth = '是志愿者';
                                    }
                                    if ((result[index].role == 2 || result[index].role == 4) && result[index].auth == 0) {
                                        result[index].auth = '非志愿者';
                                    }
                                    if (result[index].createdAt) {
                                        result[index].regtime = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
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
        if (re.code == 200) {
            let tmp = re.data.records;
            for (let i in tmp) {
                let user_agent = await new Promise((resolve, reject) => {
                    con.query('select user_agent from call_orders where user_id=? order by createdAt DESC limit 1', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let mobile = '';
                let mobile_version = '';
                let app_version = '';
                let glass_version = '';
                if (user_agent.length > 0) {
                    user_agent = user_agent[0].user_agent;
                    let ua = user_agent.split('_');
                    mobile = ua[3];
                    mobile_version = ua[3] + '_' + ua[4];
                    app_version = ua[0] + '_' + ua[1] + '_' + ua[2];
                }
                let user_auth_info = await new Promise((resolve, reject) => {
                    con.query('select user_auth_info from user_auth where user_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let idnum = '';
                if (user_auth_info && user_auth_info.length > 0) {
                    user_auth_info = JSON.parse(user_auth_info[0].user_auth_info);
                    if (user_auth_info.hasOwnProperty('IdentificationNumber')) {
                        idnum = user_auth_info.IdentificationNumber;
                    }
                }
                let angellist = '';
                let angelnum = 0;
                let angel = await new Promise((resolve, reject) => {
                    con.query('select count(*) as angelnum,group_concat(distinct users.tel) as angellist from `blind2family-through` as bf left join users on users.id=bf.angelId where bf.blindId=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (angel.length > 0) {
                    angelnum = angel[0].angelnum;
                    angellist = angel[0].angellist
                }
                let inviter_tel = await new Promise((resolve, reject) => {
                    con.query('select inviter_tel from invite_order where invitee_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (inviter_tel.length > 0) {
                    inviter_tel = inviter_tel[0].inviter_tel;
                }
                let invitee_tel = await new Promise((resolve, reject) => {
                    con.query('select group_concat(distinct invitee_tel) as invitee_tel from invite_order where inviter_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });

                if (invitee_tel.length > 0) {
                    invitee_tel = invitee_tel[0].invitee_tel;
                }
                let invite_count = await new Promise((resolve, reject) => {
                    con.query('select count(*) as num from invite_order where inviter_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                console.log(invite_count);
                if (invite_count && invite_count.length > 0) {
                    invite_count = invite_count[0].num;
                } else {
                    invite_count = 0;
                }
                //上次登录时间
                let last_login_time = 0;
                let lt = await new Promise((resolve, reject) => {
                    con.query("select createdAt from user_event where user_id=? and event_name='API-login' order by createdAt DESC limit 0,1", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                if (lt && lt.length > 0) {
                    last_login_time = moment(lt[0].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                //上次退出时间
                let last_logout_time = 0;
                let lg = await new Promise((resolve, reject) => {
                    con.query("select createdAt from user_event where user_id=? and event_name='API-logout' order by createdAt DESC limit 0,1", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                if (lg && lg.length > 0) {
                    last_login_time = moment(lg[0].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                //连续登录天数
                let in_out_day = 0;
                let ins = new Date(last_login_time).getTime();
                let outs = new Date(last_logout_time).getTime();
                if (ins > outs) {
                    in_out_day = (new Date().getTime() - ins) / 86400000;
                    in_out_day = Math.floor(in_out_day);
                } else {
                    in_out_day = (outs - ins) / 86400000;
                    in_out_day = Math.floor(in_out_day);
                }
                //软件登录总时长
                let total_login_time = 0;
                let in_out_arr = await new Promise((resolve, reject) => {
                    con.query("select createdAt,event_name from user_event where user_id=? and (event_name='API-logout' or event_name='API-login') order by createdAt ASC", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                let in_arr = [];
                let out_arr = [];
                if (in_out_arr && in_out_arr.length > 0) {
                    let b = 0;
                    for (let i = 0; i < in_out_arr.length; i++) {
                        if (b == 0 && in_out_arr[i].event_name == 'API-login') {
                            b = 1;
                            in_arr.push(moment(in_out_arr[i].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss'));
                        }
                        if (b == 1 && in_out_arr[i].event_name == 'API-logout') {
                            b = 0
                            out_arr.push(moment(in_out_arr[i].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss'));
                        }
                    }
                    if (in_arr.length > 0 && out_arr.length == 0) {
                        console.log(11);
                        total_login_time = (new Date().getTime()) - (new Date(in_arr[0]).getTime());
                        console.log(total_login_time);
                    }
                    if (in_arr.length > 0 && out_arr.length > 0 && (in_arr.length == out_arr.length)) {
                        for (let d = 0; d < in_arr.length; d++) {
                            total_login_time += (new Date(out_arr[d]).getTime()) - (new Date(in_arr[d]).getTime());
                            console.log(new Date(out_arr[d]).getTime());
                            console.log(new Date(in_arr[d]).getTime());
                            console.log(total_login_time);
                        }
                    }
                    if (in_arr.length > 0 && out_arr.length > 0 && (in_arr.length > out_arr.length)) {
                        let l = 0;
                        for (let d = 0; d < out_arr.length; d++) {
                            l = d
                            total_login_time += (new Date(out_arr[d]).getTime()) - (new Date(in_arr[d]).getTime());
                        }
                        total_login_time += (new Date().getTime()) - (new Date(in_arr[l]).getTime());
                    }
                }
                if (total_login_time > 0) {
                    total_login_time = Math.floor(total_login_time / 1000);
                    total_login_time = common.sec_to_time(total_login_time);
                }
                let balance = await new Promise((resolve, reject) => {
                    con.query('select paytime_left,freetime_left,money_left,valid_time from blind_account where user_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let paytime_left, freetime_left, money_left, valid_time;
                if (balance.length > 0) {
                    paytime_left = balance[0].paytime_left;
                    freetime_left = balance[0].freetime_left;
                    money_left = balance[0].money_left;
                    valid_time = balance[0].valid_time;
                }
                let usedTime = await new Promise((resolve, reject) => {
                    con.query('select sum(duration2) as usedTime from chat_orders where caller_uid=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (usedTime.length > 0) {
                    usedTime = usedTime[0].usedTime;
                }
                let usedTimes = await new Promise((resolve, reject) => {
                    con.query("select count(*) as usedTimes from user_event where user_id=? and event_name='Signal-login'", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (usedTimes.length > 0) {
                    usedTimes = usedTimes[0].usedTimes;
                }
                let anan = '',
                    voan = '',
                    csan = '',
                    totalan = '',
                    angletime = '',
                    votime = '',
                    cstime = '',
                    totaltime = '';
                if (tmp[i].role == '视友') {
                    anan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as anan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (anan.length > 0) {
                        anan = anan[0].anan;
                    }
                    voan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as voan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (voan.length > 0) {
                        voan = voan[0].voan;
                    }
                    csan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as csan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (csan.length > 0) {
                        csan = csan[0].csan;
                    }
                    totalan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as totalan from answered_calls where caller_id=?", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totalan.length > 0) {
                        totalan = totalan[0].totalan;
                    }
                    angletime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as angletime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (angletime.length > 0) {
                        angletime = angletime[0].angletime;
                    }
                    votime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as votime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (votime.length > 0) {
                        votime = votime[0].votime;
                    }
                    cstime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as cstime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (cstime.length > 0) {
                        cstime = cstime[0].cstime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders where caller_uid=?", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }
                }
                if (tmp[i].role == '亲友') {
                    anan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as anan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (anan.length > 0) {
                        anan = anan[0].anan;
                        totalan = anan;
                    }
                    angletime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as angletime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (angletime.length > 0) {
                        angletime = angletime[0].angletime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }
                }
                if (tmp[i].role == '志愿者') {
                    voan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as voan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (voan.length > 0) {
                        voan = voan[0].voan;
                        totalan = voan;
                    }
                    votime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as votime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (votime.length > 0) {
                        votime = votime[0].votime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }

                }
                if (tmp[i].role == '客服') {
                    csan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as csan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (csan.length > 0) {
                        csan = csan[0].csan;
                        totalan = csan;
                    }
                    cstime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as cstime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (cstime.length > 0) {
                        cstime = cstime[0].cstime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }

                }
                tmp[i] = Object.assign(tmp[i], { mobile: mobile, mobile_version: mobile_version, app_version: app_version, glass_version: glass_version, idnum: idnum, angelnum: angelnum, angellist: angellist, invite_count: invite_count, inviter_tel: inviter_tel, invitee_tels: invitee_tel, paytime_left: paytime_left, freetime_left: freetime_left, usedTime: usedTime, valid_time: valid_time, money_left: money_left, usedTimes: usedTimes, anan: anan, voan: voan, csan: csan, totalan: totalan, angletime: angletime, votime: votime, cstime: cstime, totaltime: totaltime, last_login_time: last_login_time, in_out_day: in_out_day, total_login_time: total_login_time })
            }
        }
    } else {
        re = await new Promise((resolve, reject) => {
                con.query('select * from users where tel=?', [key], function(err, result) {
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
                            if (result[index].gender == "0") {
                                result[index].gender = '未知';
                            }
                            if (result[index].gender == "1") {
                                result[index].gender = '男';
                            }
                            if (result[index].gender == "2") {
                                result[index].gender = '女';
                            }
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
                            if (result[index].auth == 1) {
                                result[index].auth = '是志愿者';
                            }
                            if ((result[index].role == 2 || result[index].role == 4) && result[index].auth == 0) {
                                result[index].auth = '非志愿者';
                            }
                            if (result[index].createdAt) {
                                result[index].regtime = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                            }
                        }
                        resolve({
                            code: 200,
                            msg: '操作成功',
                            data: {
                                records: result,
                                total: 1
                            }
                        });
                    }
                });
                  
        });
        if (re.code == 200) {
            let tmp = re.data.records;
            for (let i in tmp) {
                let user_agent = await new Promise((resolve, reject) => {
                    con.query('select user_agent from call_orders where user_id=? order by createdAt DESC limit 1', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let mobile = '';
                let mobile_version = '';
                let app_version = '';
                let glass_version = '';
                if (user_agent.length > 0) {
                    user_agent = user_agent[0].user_agent;
                    let ua = user_agent.split('_');
                    mobile = ua[3];
                    mobile_version = ua[3] + '_' + ua[4];
                    app_version = ua[0] + '_' + ua[1] + '_' + ua[2];
                }
                let user_auth_info = await new Promise((resolve, reject) => {
                    con.query('select user_auth_info from user_auth where user_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let idnum = '';
                if (user_auth_info && user_auth_info.length > 0) {
                    user_auth_info = JSON.parse(user_auth_info[0].user_auth_info);
                    if (user_auth_info.hasOwnProperty('IdentificationNumber')) {
                        idnum = user_auth_info.IdentificationNumber;
                    }
                }
                let angellist = '';
                let angelnum = 0;
                let angel = await new Promise((resolve, reject) => {
                    con.query('select count(*) as angelnum,group_concat(distinct users.tel) as angellist from `blind2family-through` as bf left join users on users.id=bf.angelId where bf.blindId=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (angel.length > 0) {
                    angelnum = angel[0].angelnum;
                    angellist = angel[0].angellist
                }
                let inviter_tel = await new Promise((resolve, reject) => {
                    con.query('select inviter_tel from invite_order where invitee_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (inviter_tel.length > 0) {
                    inviter_tel = inviter_tel[0].inviter_tel;
                }
                let invitee_tel = await new Promise((resolve, reject) => {
                    con.query('select group_concat(distinct invitee_tel) as invitee_tel from invite_order where inviter_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });

                if (invitee_tel.length > 0) {
                    invitee_tel = invitee_tel[0].invitee_tel;
                }
                let invite_count = await new Promise((resolve, reject) => {
                    con.query('select count(*) as num from invite_order where inviter_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                console.log(invite_count);
                if (invite_count && invite_count.length > 0) {
                    invite_count = invite_count[0].num;
                } else {
                    invite_count = 0;
                }
                //上次登录时间
                let last_login_time = 0;
                let lt = await new Promise((resolve, reject) => {
                    con.query("select createdAt from user_event where user_id=? and event_name='API-login' order by createdAt DESC limit 0,1", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                if (lt && lt.length > 0) {
                    last_login_time = moment(lt[0].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                //上次退出时间
                let last_logout_time = 0;
                let lg = await new Promise((resolve, reject) => {
                    con.query("select createdAt from user_event where user_id=? and event_name='API-logout' order by createdAt DESC limit 0,1", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                if (lg && lg.length > 0) {
                    last_login_time = moment(lg[0].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                //连续登录天数
                let in_out_day = 0;
                let ins = new Date(last_login_time).getTime();
                let outs = new Date(last_logout_time).getTime();
                if (ins > outs) {
                    in_out_day = (new Date().getTime() - ins) / 86400000;
                    in_out_day = Math.floor(in_out_day);
                } else {
                    in_out_day = (outs - ins) / 86400000;
                    in_out_day = Math.floor(in_out_day);
                }
                //软件登录总时长
                let total_login_time = 0;
                let in_out_arr = await new Promise((resolve, reject) => {
                    con.query("select createdAt,event_name from user_event where user_id=? and (event_name='API-logout' or event_name='API-login') order by createdAt ASC", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    })
                });
                let in_arr = [];
                let out_arr = [];
                if (in_out_arr && in_out_arr.length > 0) {
                    let b = 0;
                    for (let i = 0; i < in_out_arr.length; i++) {
                        if (b == 0 && in_out_arr[i].event_name == 'API-login') {
                            b = 1;
                            in_arr.push(moment(in_out_arr[i].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss'));
                        }
                        if (b == 1 && in_out_arr[i].event_name == 'API-logout') {
                            b = 0
                            out_arr.push(moment(in_out_arr[i].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss'));
                        }
                    }
                    if (in_arr.length > 0 && out_arr.length == 0) {
                        console.log(11);
                        total_login_time = (new Date().getTime()) - (new Date(in_arr[0]).getTime());
                        console.log(total_login_time);
                    }
                    if (in_arr.length > 0 && out_arr.length > 0 && (in_arr.length == out_arr.length)) {
                        for (let d = 0; d < in_arr.length; d++) {
                            total_login_time += (new Date(out_arr[d]).getTime()) - (new Date(in_arr[d]).getTime());
                            console.log(new Date(out_arr[d]).getTime());
                            console.log(new Date(in_arr[d]).getTime());
                            console.log(total_login_time);
                        }
                    }
                    if (in_arr.length > 0 && out_arr.length > 0 && (in_arr.length > out_arr.length)) {
                        let l = 0;
                        for (let d = 0; d < out_arr.length; d++) {
                            l = d
                            total_login_time += (new Date(out_arr[d]).getTime()) - (new Date(in_arr[d]).getTime());
                        }
                        total_login_time += (new Date().getTime()) - (new Date(in_arr[l]).getTime());
                    }
                }
                if (total_login_time > 0) {
                    total_login_time = Math.floor(total_login_time / 1000);
                    total_login_time = common.sec_to_time(total_login_time);
                }
                let balance = await new Promise((resolve, reject) => {
                    con.query('select paytime_left,freetime_left,money_left,valid_time from blind_account where user_id=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let paytime_left, freetime_left, money_left, valid_time;
                if (balance.length > 0) {
                    paytime_left = balance[0].paytime_left;
                    freetime_left = balance[0].freetime_left;
                    money_left = balance[0].money_left;
                    valid_time = balance[0].valid_time;
                }
                let usedTime = await new Promise((resolve, reject) => {
                    con.query('select sum(duration2) as usedTime from chat_orders where caller_uid=?', [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (usedTime.length > 0) {
                    usedTime = usedTime[0].usedTime;
                }
                let usedTimes = await new Promise((resolve, reject) => {
                    con.query("select count(*) as usedTimes from user_event where user_id=? and event_name='Signal-login'", [tmp[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                if (usedTimes.length > 0) {
                    usedTimes = usedTimes[0].usedTimes;
                }
                let anan = '',
                    voan = '',
                    csan = '',
                    totalan = '',
                    angletime = '',
                    votime = '',
                    cstime = '',
                    totaltime = '';
                if (tmp[i].role == '视友') {
                    anan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as anan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (anan.length > 0) {
                        anan = anan[0].anan;
                    }
                    voan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as voan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (voan.length > 0) {
                        voan = voan[0].voan;
                    }
                    csan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as csan from answered_calls as ac left join users as u on u.id=ac.callee_id where caller_id=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (csan.length > 0) {
                        csan = csan[0].csan;
                    }
                    totalan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as totalan from answered_calls where caller_id=?", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totalan.length > 0) {
                        totalan = totalan[0].totalan;
                    }
                    angletime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as angletime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (angletime.length > 0) {
                        angletime = angletime[0].angletime;
                    }
                    votime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as votime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (votime.length > 0) {
                        votime = votime[0].votime;
                    }
                    cstime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as cstime from chat_orders as co left join users as u on u.id=co.callee_uid where co.caller_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (cstime.length > 0) {
                        cstime = cstime[0].cstime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders where caller_uid=?", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }
                }
                if (tmp[i].role == '亲友') {
                    anan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as anan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (anan.length > 0) {
                        anan = anan[0].anan;
                        totalan = anan;
                    }
                    angletime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as angletime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (angletime.length > 0) {
                        angletime = angletime[0].angletime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=2", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }
                }
                if (tmp[i].role == '志愿者') {
                    voan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as voan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (voan.length > 0) {
                        voan = voan[0].voan;
                        totalan = voan;
                    }
                    votime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as votime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (votime.length > 0) {
                        votime = votime[0].votime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=4 or (u.role=2 and u.service=1)", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }

                }
                if (tmp[i].role == '客服') {
                    csan = await new Promise((resolve, reject) => {
                        con.query("select count(*) as csan from answered_calls as ac left join users as u on u.id=ac.callee_id where callee_id=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (csan.length > 0) {
                        csan = csan[0].csan;
                        totalan = csan;
                    }
                    cstime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as cstime from chat_orders as co left join users as u on u.id=co.callee_uid where co.callee_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (cstime.length > 0) {
                        cstime = cstime[0].cstime;
                    }
                    totaltime = await new Promise((resolve, reject) => {
                        con.query("select sum(duration) as totaltime from chat_orders as co left join users as u on u.id=co.callee_uid where callee_uid=? and u.role=8", [tmp[i].id], function(err, r) {
                            if (err) reject(err);
                            resolve(r);
                        });
                    });
                    if (totaltime.length > 0) {
                        totaltime = totaltime[0].totaltime;
                    }

                }
                tmp[i] = Object.assign(tmp[i], { mobile: mobile, mobile_version: mobile_version, app_version: app_version, glass_version: glass_version, idnum: idnum, angelnum: angelnum, angellist: angellist, invite_count: invite_count, inviter_tel: inviter_tel, invitee_tels: invitee_tel, paytime_left: paytime_left, freetime_left: freetime_left, usedTime: usedTime, valid_time: valid_time, money_left: money_left, usedTimes: usedTimes, anan: anan, voan: voan, csan: csan, totalan: totalan, angletime: angletime, votime: votime, cstime: cstime, totaltime: totaltime, last_login_time: last_login_time, in_out_day: in_out_day, total_login_time: total_login_time })
            }
        }
    }
    if (type == 2) {
        let temp = re.data.records;
        let datas = [
            ['用户ID', '头像', '角色', '姓名', '注册手机号', '注册时间', '城市', '生日', '性别', '视力状况', '手机型号', '手机系统版本', '软件版本号', '硬件版本号', '身份证号', '是否成为志愿者', '绑定亲友数', '关联亲友列表', '总邀请数', '邀请人', '受邀请人', '账户本金余额', '账户赠金余额', '累计使用时长', '当前积分', '消费积分', '评价', '普通充值余额的有效时间', '可退金额', '软件打开次数', '亲友接听次数', '志愿者接听次数', '客服接听次数', '总接听次数', '亲友通话时长', '志愿者通话时长', '客服通话时长', '总通话时长', '最近登录时间', '连续登录天数', '软件登录总时长']
        ];
        for (let index in temp) {
            let data = [temp[index].id, temp[index].avatar, temp[index].role, temp[index].name, temp[index].tel, temp[index].regtime, temp[index].address, temp[index].birthday, temp[index].gender, temp[index].eyesight, temp[index].mobile, temp[index].mobile_version, temp[index].app_version, temp[index].glass_version, temp[index].idnum, temp[index].auth, temp[index].angelnum, temp[index].angellist, temp[index].invite_count, temp[index].inviter_tel, temp[index].invitee_tels, temp[index].paytime_left, temp[index].freetime_left, temp[index].usedTime, '', '', '', temp[index].valid_time, temp[index].money_left, temp[index].usedTimes, temp[index].anan, temp[index].voan, temp[index].csan, temp[index].totalan, temp[index].angletime, temp[index].votime, temp[index].cstime, temp[index].totaltime, temp[index].last_login_time, temp[index].in_out_day, temp[index].total_login_time];
            datas.push(data);
        }
        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/appUserInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/appUserInfo' + dd + '.xlsx'
        };
    } else {
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
                        if (result[index].createdAt) {
                            result[index].createdAt = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                    resolve(result);
                }
            });
        });
        if (re && re.length > 0) {
            for (let i in re) {
                //最后使用时间
                let lastUseTime2 = await new Promise((resolve, reject) => {
                    con.query('select createdAt as lastUseTime from signal_order where caller_uid=? order by createdAt DESC limit 1', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用次数
                let totalTimes2 = await new Promise(function(resolve, reject) {
                    con.query('select count(*) as totalTimes from signal_order where caller_uid=?', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用时长
                let totalTime2 = await new Promise(function(resolve, reject) {
                    con.query('select sum(duration2) as totalTime from chat_orders where caller_uid=?', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let lut = '';
                let tts = 0;
                let tt = 0;
                if (lastUseTime2 && 　lastUseTime2.length > 0) {
                    lut = moment(lastUseTime2[0].lastUseTime).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                if (totalTimes2 && totalTimes2.length > 0) {
                    tts = totalTimes2[0].totalTimes;
                }
                if (totalTime2 && totalTime2.length > 0) {
                    tt = common.sec_to_time(totalTime2[0].totalTime);
                }
                let temp = { lastUseTime: lut, totalTimes: tts, totalTime: tt };
                re[i] = Object.assign(re[i], temp);
            }
            let datas = [
                ['用户id', '视友姓名', '城市', '注册时间', '最后使用时间', '总使用次数', '总使用时长', '年龄', '性别', '电话', '视力状况', '绑定亲友数', '账户余额', '使用额', '充值额']
            ];
            for (let index in re) {
                let data = [re[index].id, re[index].name, re[index].address, re[index].createdAt, re[index].lastUseTime, re[index].totalTimes, re[index].totalTime,re[index].age, re[index].gender, re[index].tel, re[index].eyesight, re[index].angelnum, re[index].money_left, re[index].money_use, re[index].totalmoney];
                datas.push(data);
            }
            let buffer = xlsx.build([{
                name: 'sheet1',
                data: datas
            }]);
            fs.writeFileSync('public/uploads/userBlindInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        }
        let tmp = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/userBlindInfo' + dd + '.xlsx'
        };
        ctx.response.body = tmp;
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
                        if (result[index].createdAt) {
                            result[index].createdAt = moment(result[index].createdAt).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                }
            });
        });
        if (re && re.length > 0) {
            for (let i in re) {
                //最后使用时间
                let lastUseTime2 = await new Promise((resolve, reject) => {
                    con.query('select createdAt as lastUseTime from signal_order where caller_uid=? order by createdAt DESC limit 1', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用次数
                let totalTimes2 = await new Promise(function(resolve, reject) {
                    con.query('select count(*) as totalTimes from signal_order where caller_uid=?', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                //总使用时长
                let totalTime2 = await new Promise(function(resolve, reject) {
                    con.query('select sum(duration2) as totalTime from chat_orders where caller_uid=?', [re[i].id], function(err, r) {
                        if (err) reject(err);
                        resolve(r);
                    });
                });
                let lut = '';
                let tts = 0;
                let tt = 0;
                if (lastUseTime2 && 　lastUseTime2.length > 0) {
                    lut = moment(lastUseTime2[0].lastUseTime).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
                }
                if (totalTimes2 && totalTimes2.length > 0) {
                    tts = totalTimes2[0].totalTimes;
                }
                if (totalTime2 && totalTime2.length > 0) {
                    tt = common.sec_to_time(totalTime2[0].totalTime);
                }
                let temp = { lastUseTime: lut, totalTimes: tts, totalTime: tt };
                re[i] = Object.assign(re[i], temp);
            }
            let datas = [
                ['用户id', '视友姓名', '城市', '注册时间', '最后使用时间', '总使用次数', '总使用时长', '年龄', '性别', '电话', '视力状况', '绑定亲友数', '账户余额', '使用额', '充值额']
            ];
            for (let index in re) {
                let data = [re[index].id, re[index].name, re[index].address, re[index].createdAt, re[index].lastUseTime, re[index].totalTimes, re[index].totalTime, re[index].createdAt, re[index].age, re[index].gender, re[index].tel, re[index].eyesight, re[index].angelnum, re[index].money_left, re[index].money_use, re[index].totalmoney];
                datas.push(data);
            }
            let buffer = xlsx.build([{
                name: 'sheet1',
                data: datas
            }]);
            fs.writeFileSync('public/uploads/userBlindInfo' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        }
        let tmp = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/userBlindInfo' + dd + '.xlsx'
        };
        ctx.response.body = tmp;
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
                        if (result[index].createdAt) {
                            result[index].createdAt = moment(result[index].createdAt).format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '注册时间', '年龄', '性别', '电话', '视力状况', '绑定视友数', '账户余额', '使用额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].createdAt, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].blindnum, result[index].balance, result[index].money_use];
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
                        if (result[index].createdAt) {
                            result[index].createdAt = moment(result[index].createdAt).format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                    let datas = [
                        ['用户id', '亲友姓名', '城市', '注册时间', '年龄', '性别', '电话', '视力状况', '绑定视友数', '账户余额', '使用额']
                    ];
                    for (let index in result) {
                        let data = [result[index].id, result[index].name, result[index].address, result[index].createdAt, result[index].age, result[index].gender, result[index].tel, result[index].eyesight, result[index].blindnum, result[index].balance, result[index].money_use];
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
        let t1 = Date.now();
        //全部成功
        let re1 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent,so.hangup_time,so.call_type,so.call_app,ch.chat_id, co.hangup_reason, so.call_time,so.callee_tel,co.wifi_type,co.wifi_name, ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb,cod.caller_setting as settings,cod.changed,cod.changed2,cod.paytime_new,cod.freetime_new,cod.freetime_new2,cod.dispatchList,cod.dispatchArriveList,cod.calleeTelOnline,cod.calleeTelOffline FROM re_prod.users AS us,re_prod.answered_calls as ac,re_prod.signal_order as so,re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id left join call_order_detail as cod on ch.chat_id=cod.chat_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id and ch.chat_id=so.chat_id AND ch.first_audioa > 0 AND ch.first_audiob > 0 AND ch.first_videob > 0 AND us.test in (?) and date_add(ch.createdAt, interval '08:00:00' hour_second)>=? AND date_add(ch.createdAt, interval '08:00:00' hour_second)<? ORDER BY ch.createdAt DESC", [test, key1, key2], function(err, result) {
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
            r1[index].ct = r1[index].call_time;
            r1[index].call_time = moment(r1[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].answer_time = moment(r1[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].start_time = moment(r1[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].end_time = moment(r1[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r1[index].hangup_time = moment(r1[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            r1[index].duration = common.sec_to_time(r1[index].duration);
            r1[index].flowa = (r1[index].flowa / 1024).toFixed(2);
            r1[index].flowb = (r1[index].flowb / 1024).toFixed(2);
            if (r1[index].wifi_type == 1 || r1[index].wifi_type == '1') {
                r1[index].wifi_type = '手机4G';
            }
            if (r1[index].wifi_type == 0 || r1[index].wifi_type == '0') {
                r1[index].wifi_type = 'wifi';
            }
            if (r1[index].hasOwnProperty('call_app') && r1[index].call_app != undefined ) {
                if (r1[index].call_app == 2) {
                    r1[index].call_app = '视友app';
                } else if (r1[index].call_app == 8) {
                    r1[index].call_app = '做你的眼睛app'
                } else {
                    r1[index].call_app = '云瞳设备';
                }
            }
            if ( r1[index].hasOwnProperty('call_app') && r1[index].call_type != undefined ) {
                if (r1[index].call_type == 0) {
                    r1[index].call_type = '全部';
                }
                if (r1[index].call_type == 1) {
                    r1[index].call_type = '亲友';
                }
                if (r1[index].call_type == 2) {
                    r1[index].call_type = '志愿者';
                }
                if (r1[index].call_type == 3) {
                    r1[index].call_type = '客服';
                }
            }
            if ( r1[index].hasOwnProperty('user_agent') && r1[index].user_agent != undefined ) {
                let userAgent = r1[index].user_agent;
                if (userAgent != null) {
                    userAgent = userAgent.split('_');
                    r1[index].mobile = userAgent[3];
                    r1[index].mobile_version = userAgent[4];
                }
            }
        }
        //呼叫失败
        let re2 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, co.chat_id, co.hangup_reason, co.call_time, co.answer_time, co.hangup_time,co.callee_tel,co.wifi_type,co.wifi_name FROM re_prod.users AS us, re_prod.call_orders AS co WHERE co.user_id=co.caller_id AND co.user_id = us.id AND co.chat_id NOT IN (SELECT chat_id FROM re_prod.signal_order WHERE chat_id=co.chat_id) AND us.test in (?) AND date_add(co.createdAt, interval '08:00:00' hour_second)>=? AND date_add(co.createdAt, interval '08:00:00' hour_second)<? ORDER BY co.id DESC", [test, key1, key2], function(err, result) {
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
            r2[index].ct = r2[index].call_time;
            r2[index].call_time = moment(r2[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            // r2[index].answer_time = moment(r2[index].answer_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r2[index].hangup_time = moment(r2[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r2[index].wifi_type == 1 || r2[index].wifi_type == '1') {
                r2[index].wifi_type = '手机4G';
            }
            if (r2[index].wifi_type == 0 || r2[index].wifi_type == '0') {
                r2[index].wifi_type = 'wifi';
            }
            
            if ( r2[index].hasOwnProperty('user_agent') && r2[index].user_agent != undefined ) {
                let userAgent = r2[index].user_agent;
                if (userAgent != null) {
                    userAgent = userAgent.split('_');
                    r2[index].mobile = userAgent[3];
                    r2[index].mobile_version = userAgent[4];
                }
            }
        }
        //接听失败
        let re3 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, so.chat_id,so.call_type,so.call_app, co.hangup_reason, so.call_time, so.answer_time, so.hangup_time,co.callee_tel,co.wifi_type,co.wifi_name,cod.caller_setting as settings,cod.changed,cod.changed2,cod.paytime_new,cod.freetime_new,cod.freetime_new2,cod.dispatchList,cod.dispatchArriveList,cod.calleeTelOnline,cod.calleeTelOffline,cod.wifi_pwd FROM re_prod.users AS us,re_prod.signal_order AS so left join call_orders as co on so.chat_id=co.chat_id and co.user_id=co.caller_id left join call_order_detail as cod on so.chat_id=cod.chat_id WHERE so.caller_uid = us.id AND so.chat_id NOT IN (SELECT chat_id FROM re_prod.answered_calls) AND us.test in (?) AND date_add(so.createdAt, interval '08:00:00' hour_second)>=? AND date_add(so.createdAt, interval '08:00:00' hour_second)<? ORDER BY so.createdAt DESC", [test, key1, key2], function(err, result) {
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
            r3[index].ct = r3[index].call_time;
            r3[index].call_time = moment(r3[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            // r3[index].answer_time = moment(r3[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r3[index].hangup_time = moment(r3[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r3[index].wifi_type == 1 || r3[index].wifi_type == '1') {
                r3[index].wifi_type = '手机4G';
            }
            if (r3[index].wifi_type == 0 || r3[index].wifi_type == '0') {
                r3[index].wifi_type = 'wifi';
            }
            if (r3[index].hasOwnProperty('call_app') && r3[index].call_app != undefined ) {
                if (r3[index].call_app == 2) {
                    r3[index].call_app = '视友app';
                } else if (r3[index].call_app == 8) {
                    r3[index].call_app = '做你的眼睛app'
                } else {
                    r3[index].call_app = '云瞳设备';
                }
            }
            if ( r3[index].hasOwnProperty('call_type') && r3[index].call_type != undefined ) {
                if (r3[index].call_type == 0) {
                    r3[index].call_type = '全部';
                }
                if (r3[index].call_type == 1) {
                    r3[index].call_type = '亲友';
                }
                if (r3[index].call_type == 2) {
                    r3[index].call_type = '志愿者';
                }
                if (r3[index].call_type == 3) {
                    r3[index].call_type = '客服';
                }
            }
            if ( r3[index].hasOwnProperty('user_agent') && r3[index].user_agent != undefined ) {
                let userAgent = r3[index].user_agent;
                if (userAgent != null) {
                    userAgent = userAgent.split('_');
                    r3[index].mobile = userAgent[3];
                    r3[index].mobile_version = userAgent[4];
                }
            }
        }
        //接通失败
        let re4 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, co.user_agent, ac.chat_id, co.hangup_reason, so.call_time,so.call_type,so.call_app, ac.answer_time, so.hangup_time,so.callee_tel,co.wifi_type,co.wifi_name,cod.caller_setting as settings,cod.changed,cod.changed2,cod.paytime_new,cod.freetime_new,cod.freetime_new2,cod.dispatchList,cod.dispatchArriveList,cod.calleeTelOnline,cod.calleeTelOffline,cod.wifi_pwd FROM re_prod.users AS us,re_prod.signal_order as so,re_prod.answered_calls AS ac left join call_orders as co on ac.chat_id=co.chat_id and co.user_id=co.caller_id left join call_order_detail as cod on ac.chat_id=cod.chat_id WHERE ac.caller_id = us.id AND ac.chat_id=so.chat_id and ac.chat_id NOT IN (SELECT chat_id FROM re_prod.chat_orders) AND us.test in (?) AND date_add(ac.createdAt, interval '08:00:00' hour_second)>=? AND date_add(ac.createdAt, interval '08:00:00' hour_second)<? ORDER BY ac.createdAt DESC", [test, key1, key2], function(err, result) {
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
            r4[index].ct = r4[index].call_time;
            r4[index].answer_call_time = common.sec_to_time(Math.round((r4[index].answer_time - r4[index].call_time) / 1000));
            r4[index].call_time = moment(r4[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].answer_time = moment(r4[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r4[index].hangup_time = moment(r4[index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            if (r4[index].wifi_type == 1 || r4[index].wifi_type == '1') {
                r4[index].wifi_type = '手机4G';
            }
            if (r4[index].wifi_type == 0 || r4[index].wifi_type == '0') {
                r4[index].wifi_type = 'wifi';
            }
            if ( r4[index].hasOwnProperty('call_app') && r4[index].call_app != undefined ) {
                if (r4[index].call_app == 2) {
                    r4[index].call_app = '视友app';
                } else if (r4[index].call_app == 8) {
                    r4[index].call_app = '做你的眼睛app'
                } else {
                    r4[index].call_app = '云瞳设备';
                }
            }
            if ( r4[index].hasOwnProperty('call_type') && r4[index].call_type != undefined ) {
                if (r4[index].call_type == 0) {
                    r4[index].call_type = '全部';
                }
                if (r4[index].call_type == 1) {
                    r4[index].call_type = '亲友';
                }
                if (r4[index].call_type == 2) {
                    r4[index].call_type = '志愿者';
                }
                if (r4[index].call_type == 3) {
                    r4[index].call_type = '客服';
                }
            }
            if ( r4[index].hasOwnProperty('user_agent') && r4[index].user_agent != undefined ) {
                let userAgent = r4[index].user_agent;
                if (userAgent != null) {
                    userAgent = userAgent.split('_');
                    r4[index].mobile = userAgent[3];
                    r4[index].mobile_version = userAgent[4];
                }
            }
        }
        //音视频异常
        let re5 = await new Promise((resolve, reject) => {
            con.query("SELECT us.id, us.tel, us.name, us.gender, us.address, us.eyesight, ch.ua, co.user_agent, ch.chat_id, co.hangup_reason, so.call_time,so.callee_tel,so.call_type,so.call_app,co.wifi_type,co.wifi_name,ac.answer_time, ch.start_time, ch.end_time, ch.duration, ch.flowa, ch.flowb,ch.first_audioa,ch.first_audiob,ch.first_videob,cod.caller_setting as settings,cod.changed,cod.changed2,cod.paytime_new,cod.freetime_new,cod.freetime_new2,cod.dispatchList,cod.dispatchArriveList,cod.calleeTelOnline,cod.calleeTelOffline,cod.wifi_pwd FROM re_prod.users AS us,re_prod.signal_order as so,re_prod.answered_calls as ac,re_prod.chat_orders AS ch left join call_orders as co on ch.chat_id=co.chat_id and co.user_id=co.caller_id left join call_order_detail as cod on cod.chat_id=ch.chat_id WHERE ch.caller_uid=us.id and ac.chat_id=ch.chat_id AND so.chat_id=ch.chat_id and (ch.first_audioa = 0 or ch.first_audiob = 0 or ch.first_videob = 0) AND us.test in (?) and date_add(ch.createdAt, interval '08:00:00' hour_second)>=? AND date_add(ch.createdAt, interval '08:00:00' hour_second)<? ORDER BY ch.createdAt DESC", [test, key1, key2], function(err, result) {
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
            r5[index].ct = r5[index].call_time;
            r5[index].call_time = moment(r5[index].call_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].answer_time = moment(r5[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
            r5[index].start_time = moment(r5[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r5[index].end_time = moment(r5[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
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
                r5[index].wifi_type = '手机4G';
            }
            if (r5[index].wifi_type == 0 || r5[index].wifi_type == '0') {
                r5[index].wifi_type = 'wifi';
            }
            if ( r5[index].hasOwnProperty('call_app') &&  r5[index].call_app != undefined ) {
                if ( r5[index].call_app == 2) {
                    r5[index].call_app = '视友app';
                } else if ( r5[index].call_app == 8) {
                    r5[index].call_app = '做你的眼睛app'
                } else {
                    r5[index].call_app = '云瞳设备';
                }
            }
            if (  r5[index].hasOwnProperty('call_type') &&  r5[index].call_type != undefined ) {
                if ( r5[index].call_type == 0) {
                    r5[index].call_type = '全部';
                }
                if (r5[index].call_type == 1) {
                    r5[index].call_type = '亲友';
                }
                if (r5[index].call_type == 2) {
                    r5[index].call_type = '志愿者';
                }
                if (r5[index].call_type == 3) {
                    r5[index].call_type = '客服';
                }
            }
            if ( r5[index].hasOwnProperty('user_agent') && r5[index].user_agent != undefined ) {
                let userAgent = r5[index].user_agent;
                if (userAgent != null) {
                    userAgent = userAgent.split('_');
                    r5[index].mobile = userAgent[3];
                    r5[index].mobile_version = userAgent[4];
                }
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
            r6[index].ct = r6[index].check_start_time;
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
                r6[index].wifi_type = '手机4G';
            }
            if (r6[index].wifi_type == 0 || r6[index].wifi_type == '0') {
                r6[index].wifi_type = 'wifi';
            }
        }
        let re = [];
        re = re.concat(r1, r2, r3, r4, r5, r6);
        // re = common.groupAndSort(re, 'id');
        re = common.sort(re);
       
        if (type == "excel") {
            let datas = [
                ['姓名', '手机号', '通话id', '通知人员列表', '通知到达人员列表', '在线人员列表', '离线人员列表', '接听者手机号', '发起自检时间', '自检结束时间', '自检结果', '自检失败原因', '解决方法语音提示', '使用产品', '开放权限', '呼叫端口', '发起呼叫时间', '呼叫状态', '呼叫失败原因', '响应时间', '响应耗时', '响应状态', '未响应原因', '接通状态', '接通异常原因', '亲友端音频状态', '视友端音频状态', '视友端视频状态', '音视频异常原因', '通话开始时间', '通话结束时间', '通话时长', '通话结束原因', '视友端流量(kb)', '亲友端流量(kb)', '视友端版本号', '亲友端版本号', '手机机型', '手机系统版本号', '网络类型', '网络名称', '网络密码', '本次消耗金额', '本次消耗时间', '当前本金余额', '当前赠金余额', '剩余分钟数', '本次获得积分']
            ];
            for (let index in re) {
                let data = [re[index].name, re[index].tel, re[index].chat_id, re[index].dispatchList, re[index].dispatchArriveList, re[index].calleeTelOnline, re[index].calleeTelOffline, re[index].callee_tel, re[index].check_time, re[index].check_end_time, re[index].check_result, re[index].check_fail_reason, re[index].restore_method, re[index].call_app, re[index].settings, re[index].call_type, re[index].call_time, re[index].call_status, re[index].call_fail_reason, re[index].answer_time, re[index].answer_call_time, re[index].answer_status, re[index].answer_fail_reason, re[index].chat_status, re[index].chat_fail_reason, re[index].aa_status, re[index].ba_status, re[index].bv_status, re[index].av_fail_reason, re[index].start_time, re[index].end_time, re[index].duration, re[index].hangup_reason, re[index].flowb, re[index].flowa, re[index].user_agent, re[index].ua, re[index].mobile, re[index].mobile_version, re[index].wifi_type, re[index].wifi_name, re[index].wifi_pwd, re[index].changed, re[index].changed2, re[index].paytime_new, re[index].freetime_new, re[index].freetime_new2, ''];
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
            let start = (page - 1) * pagenum;
            let end = page * pagenum + 1;
            let total = re.length;
            let records = re.slice(start, end);
            ctx.response.body = {
                records: records,
                total: total
            };
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
            r5[index].start_time = moment(r5[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
            r5[index].end_time = moment(r5[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
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

router.get('/getCalleeDetail', async(ctx, next) => {
    let role = ctx.query.role;
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let type = ctx.query.type;
    let key = ctx.query['key[]'];
    let start = 0;
    let end = 0;
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
    let total = await new Promise((resolve, reject) => {
        con.query("select count(*) as num from dispatch_orders where date_add(createdAt, interval '08:00:00' hour_second)>? AND date_add(createdAt, interval '08:00:00' hour_second)<?", [key1, key2], function(err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
    if (total && total.length > 0) {
        total = total[0].num;
    }
    if (type == 1) {
        start = (parseInt(page) - 1) * pagenum;
        end = parseInt(pagenum);
    }
    if (type == 2) {
        start = 0;
        end = total - 1;
    }
    let res = await new Promise((resolve, reject) => {
        con.query("select u.id as user_id,u.name,do.chat_id,do.caller_tel,do.caller_name,do.callee_tel,do.callee_role,do.call_time,do.caller_ua,do.callee_ua,do.answer_result,do.answer_desc from dispatch_orders as do,users as u where u.tel=do.callee_tel and date_add(do.createdAt, interval '08:00:00' hour_second)>? AND date_add(do.createdAt, interval '08:00:00' hour_second)<? order by do.createdAt DESC limit ?,?", [key1, key2, start, end], function(err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
    for (let index in res) {
        if (res[index].answer_result != 200) {
            res[index].answer_text = '未接听';
            res[index].noanswer_reason = res[index].answer_desc;
        } else {
            res[index].answer_text = '已接听';
            res[index].noanswer_reason = '';
        }
        let calls = await new Promise((resolve, reject) => {
            con.query("select hangup_reason,user_agent from call_orders where chat_id=? and callee_id=?", [res[index].chat_id, res[index].user_id], function(err, result) {
                if (err) reject(err);
                resolve(result);
            })
        });
        if (calls && calls.length > 0) {
            res[index].hangup_reason = calls[0].hangup_reason;
            res[index].user_agent = calls[0].user_agent;
        } else {
            res[index].hangup_reason = '';
            res[index].user_agent = '';
        }
        let chat = await new Promise((resolve, reject) => {
            con.query("select * from chat_orders where chat_id=? and callee_uid=?", [res[index].chat_id, res[index].user_id], function(err, result) {
                if (err) reject(err);
                resolve(result);
            });
        });
        if (chat && chat.length > 0) {
            res[index].duration = chat[0].duration;
            res[index].first_audioa = chat[0].first_audioa;
            res[index].first_audiob = chat[0].first_audiob;
            res[index].first_videob = chat[0].first_videob;
            res[index].start_time = chat[0].start_time;
            res[index].end_time = chat[0].end_time;
            res[index].flowa = chat[0].flowa;
            res[index].flowb = chat[0].flowb;
        } else {
            res[index].duration = 0;
            res[index].first_audioa = 0;
            res[index].first_audiob = 0;
            res[index].first_videob = 0;
            res[index].start_time = 0;
            res[index].end_time = 0;
            res[index].flowa = 0;
            res[index].flowb = 0;
        }

        res[index].xgpushtime = 0;
        res[index].jgpushtime = 0;
        let xgpt = await new Promise((resolve, reject) => {
            con.query("select sendTime,arrivedTime,ssArrivedTime,ssShowedTime from push_notify where chat_id=? and callee_tel=? and push_type='xg'", [res[index].chat_id, res[index].callee_tel], function(err, result) {
                if (err) reject(err);
                resolve(result);
            })
        });
        if (xgpt && xgpt.length > 0) {
            if (xgpt[0].sendTime > 0) {
                res[index].xgpushtime = moment(xgpt[0].sendTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].xgpushtime = xgpt[0].sendTime;
            }
            if (xgpt[0].arrivedTime > 0) {
                res[index].xgarrivedTime = moment(xgpt[0].arrivedTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].xgarrivedTime = xgpt[0].arrivedTime;
            }
            if (xgpt[0].ssArrivedTime > 0) {
                res[index].ssArrivedTime = moment(xgpt[0].ssArrivedTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].ssArrivedTime = xgpt[0].ssArrivedTime;
            }
            if (xgpt[0].ssShowedTime > 0) {
                res[index].ssShowedTime = moment(xgpt[0].ssShowedTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].ssShowedTime = xgpt[0].ssShowedTime;
            }

        }
        let jgpt = await new Promise((resolve, reject) => {
            con.query("select sendTime,arrivedTime,ssArrivedTime,ssShowedTime from push_notify where chat_id=? and callee_tel=? and push_type='jg'", [res[index].chat_id, res[index].callee_tel], function(err, result) {
                if (err) reject(err);
                resolve(result);
            })
        });
        if (jgpt && jgpt.length > 0) {
            if (xgpt[0].sendTime > 0) {
                res[index].jgpushtime = moment(xgpt[0].sendTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].jgpushtime = xgpt[0].sendTime;
            }
            if (xgpt[0].arrivedTime > 0) {
                res[index].jgarrivedTime = moment(xgpt[0].arrivedTime).format('YYYY-MM-DD HH:mm:ss');
            } else {
                res[index].jgarrivedTime = xgpt[0].arrivedTime;
            }

            // res[index].ssArrivedTime = moment(xgpt[0].ssArrivedTime).format('YYYY-MM-DD HH:mm:ss');
            // res[index].ssShowedTime = moment(xgpt[0].ssShowedTime).format('YYYY-MM-DD HH:mm:ss');
        }
        if (res[index].start_time > 0) {
            res[index].chat_status = '成功';
        } else {
            res[index].chat_status = '失败';
        }
        if (res[index].answer_time > 0) {
            res[index].answer_time = moment(res[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
        }

        if (res[index].duration > 0) {
            res[index].chat_issue = '正常';
        } else {
            res[index].chat_issue = '异常';
            if (!res[index].first_audioa || !res[index].first_audiob || !res[index].first_videob) {
                res[index].video_issue = '音视频异常';
            }
            res[index].video_issue_reason = '';
            if (res[index].first_audioa == 0) {
                res[index].video_issue_reason += '亲友端音频异常,';
            }
            if (res[index].first_audiob == 0) {
                res[index].video_issue_reason += '视友端音频异常,';
            }
            if (res[index].first_videob == 0) {
                res[index].video_issue_reason += '视友端视频异常';
            }
            res[index].issue_reason = res[index].hangup_reason;
        }
        if (res[index].start_time > 0) {
            res[index].start_time = moment(res[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
        } else {
            res[index].start_time = 0;
        }
        if (res[index].end_time > 0) {
            res[index].end_time = moment(res[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
        } else {
            res[index].end_time = 0;
        }
        if (res[index].duration > 0) {
            res[index].duration = common.sec_to_time(res[index].duration);
        }

        res[index].flowa = (res[index].flowa / 1024).toFixed(2);
        let user_agent = res[index].user_agent;
        if (user_agent && user_agent.length > 0) {
            user_agent = user_agent.split('_');
        }
        res[index].mobile = user_agent[3];
        res[index].mobile_version = user_agent[4];
    }
    if (type == 2) {
        let datas = [
            ['姓名', '手机号', '通话id', '接起视友手机号', '系统推送时间', '极光推送时间', '信鸽推送时间', '信鸽推送响应时间', '极光推送响应时间', '系统推送响应时间', '视友端显示时间', '接听状态', '未接听原因', '接通状态', '接听响应时间', '接通情况', '异常后提示语', '接收的音视频情况', '音视频异常原因', '通话结束情况', '通话开始时间', '通话结束时间', '通话时长', '亲友端流量(kb)', '视友端版本号', '亲友端版本号', '亲友网络类型', '网络名称', '手机型号', '手机系统版本号', '本次获得积分', '当前积分', '本次服务评价', '总评价']
        ];
        for (let index in res) {
            let data = [res[index].name, res[index].callee_tel, res[index].chat_id, res[index].caller_tel, res[index].systemPushTime, res[index].jgpushtime, res[index].xgpushtime, res[index].xgarrivedTime, res[index].jgarrivedTime, res[index].ssArrivedTime, res[index].ssShowedTime, res[index].answer_text, res[index].noanswer_reason, res[index].chat_status, res[index].answer_time, res[index].chat_issue, res[index].issue_reason, res[index].video_issue, res[index].video_issue_reason, res[index].hangup_reason, res[index].start_time, res[index].end_time, res[index].duration, res[index].flowa, res[index].ub, res[index].ua, res[index].wifi_type, res[index].wifi_name, res[index].mobile, res[index].mobile_version, '', '', '', ''];
            datas.push(data);
        }
        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);
        fs.writeFileSync('public/uploads/calleeChatDetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        let tmp = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/calleeChatDetail' + dd + '.xlsx'
        };
        ctx.response.body = tmp;
    } else {
        ctx.response.body = {
            code: 200,
            data: {
                records: res,
                total: total
            }
        };
    }
});

/**
 * 推送统计
 */
router.get('/pushRate', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let type = ctx.query.type;
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
    let tmp = await new Promise((resolve, reject) => {
        con.query("SELECT chat_id,COUNT(*) AS total FROM push_notify WHERE DATE_ADD(createdAt, INTERVAL '08:00:00' HOUR_SECOND)>? AND DATE_ADD(createdAt, INTERVAL '08:00:00' HOUR_SECOND)<? GROUP BY chat_id order by chat_id desc", [key1, key2], function(err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
    let tmp2 = await new Promise((resolve, reject) => {
        con.query("SELECT chat_id,COUNT(*) AS arrivenum FROM push_notify WHERE DATE_ADD(createdAt, INTERVAL '08:00:00' HOUR_SECOND)>? AND DATE_ADD(createdAt, INTERVAL '08:00:00' HOUR_SECOND)<? AND (arrivedTime > 0 OR ssArrivedTime > 0 OR ssShowedTime > 0) GROUP BY chat_id", [key1, key2], function(err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
    if (tmp && tmp.length > 0) {
        for (let index in tmp) {
            let c = await new Promise((resolve, reject) => {
                con.query("select caller_tel,caller_name,call_time from dispatch_orders where chat_id=? limit 0,1", [tmp[index].chat_id], function(err, result) {
                    if (err) reject(err);
                    resolve(result);
                })
            });
            if (c && c.length > 0) {
                tmp[index].caller_tel = c[0].caller_tel;
                tmp[index].caller_name = c[0].caller_name;
                tmp[index].call_time = moment(c[0].call_time).format('YYYY-MM-DD HH:mm:ss');
            }
            for (let k in tmp2) {
                if (tmp2[k].chat_id == tmp[index].chat_id) {
                    tmp[index].arrivenum = tmp2[k].arrivenum;
                    tmp[index].arriveRate = Math.round(parseFloat(tmp2[k].arrivenum) / parseFloat(tmp[index].total) * 10000) / 100.00 + "%";
                }
            }
        }
    }
    if (type == "excel") {
        let datas = [
            ['呼叫者手机号', '呼叫者姓名', '通话ID', '通知用户数量', '到达用户数', '推送到达率', '呼叫时间']
        ];
        for (let index in tmp) {
            let data = [tmp[index].caller_tel, tmp[index].caller_name, tmp[index].chat_id, tmp[index].total, tmp[index].arrivenum, tmp[index].arriveRate, tmp[index].call_time];
            datas.push(data);
        }
        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/pushRate' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: 'uploads/pushRate' + dd + '.xlsx'
        };
    } else {
        let start = (page - 1) * pagenum;
        let end = page * pagenum + 1;
        let total = tmp.length;
        let records = tmp.slice(start, end);
        ctx.response.body = {
            records: records,
            total: total
        };
    }

});
module.exports = router;
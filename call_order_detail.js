const con = require('./appdb4');
const moment = require('moment');
let time = moment().format('YYYY-MM-DD HH:mm:ss');
async function quik () {
let query_sql = `select so.chat_id,so.caller_uid,so.caller_tel,so.callee_uid,so.callee_tel,jsonValues,changed,changed2,paytime_new,freetime_new,freetime_new2 from signal_order as so left join settings as se on so.caller_uid=se.userId left join blindaccount_changelog as bc on so.chat_id=bc.related_chatid and so.caller_uid=bc.user_id`;
let result = await new Promise((resolve,reject) => {
        con.query(query_sql, [], function(err, result) {
            if (err) throw err;
            resolve(result);
        })
    });
for (var k in result) {
    console.log(k);
    let setStr = '';
    if (result[k].jsonValues || result[k].jsonValues != null) {
        setJson = JSON.parse(result[k].jsonValues);
        if (setJson.hasOwnProperty('cs_enabled') && setJson.hasOwnProperty('ff_enabled') && setJson.hasOwnProperty('vt_enabled')) {
            if (setJson.cs_enabled) {
                setStr = '客服,';
            }
            if (setJson.ff_enabled) {
                setStr += '亲友,';
            }
            if (setJson.vt_enabled) {
                setStr += '志愿者'
            }
        } else {
            setStr = '客服,亲友,志愿者';
        }
    } else {
        setStr = '客服,亲友,志愿者';
    }
    // result[k].setStr = setStr;
    let p0 = await new Promise((resolve,reject) => {
        con.query('select wifi_name from call_orders where chat_id=? and user_id=?',[result[k].chat_id,result[k].caller_uid],function(err,re){
            if (err) reject(err);
            resolve(re);
        })
    });
    let wifi_name = '';
    if ( p0 && p0.length > 0 ) {
        wifi_name=p0[0].wifi_name;
    }
    let p2 = await new Promise((resolve,reject) => {
        con.query('select password from user_wifi where user_id=? and ssid',[result[k].caller_uid,wifi_name],function(err,res) {
            if(err) reject(err);
            resolve(res);
        })
    });
    let wifi_pwd = '';
    if ( p2 && p2.length >0 ) {
        result[k].wifi_pwd = p2[0].password;
        wifi_pwd = p2[0].password;
    }
    let p3 = await new Promise((resolve,reject) => {
        con.query('select callee_tel,arrived_time,is_online from dispatch_orders where chat_id=? and is_dispatch=1 order by callee_tel asc',[result[k].chat_id],function(err,res) {
            if(err) reject(err);
            resolve(res);
        })
    });
    let tels = p3;
    let dispatchList = '';
    let dispatchArriveList = '';
    let calleeTelOnline = '';
    let calleeTelOffline = '';
    if ( tels && tels.length > 0 ) {
        for ( let h in tels ) {
            dispatchList += tels[h].callee_tel+',';
            if ( tels[h].arrived_time > 0 ) {
                dispatchArriveList += tels[h].callee_tel+',';
            }
            if ( tels[h].is_online == 1) {
                calleeTelOnline += tels[h].callee_tel+',';
            } else {
                calleeTelOffline += tels[h].callee_tel+',';
            }
        }
    }
    try {
        con.query('insert into call_order_detail (chat_id,caller_id,caller_tel,callee_id,callee_tel,caller_setting,changed,changed2,paytime_new,freetime_new,freetime_new2,dispatchList,dispatchArriveList,calleeTelOnline,calleeTelOffline,wifi_pwd,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ',[result[k].chat_id,result[k].caller_uid,result[k].caller_tel,result[k].callee_uid,result[k].callee_tel,setStr,result[k].changed,result[k].changed2,result[k].paytime_new,result[k].freetime_new,result[k].freetime_new2,dispatchList,dispatchArriveList,calleeTelOnline,calleeTelOffline,wifi_pwd,time,time],function(err,result) {
           
        })
    } catch(err) {
        console.log(err);
        throw(err);
    }
}   
}
quik();



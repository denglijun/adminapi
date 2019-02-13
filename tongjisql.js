module.exports = {
    "blindnum": "select count(id) as blindnum  from users where role=1", //盲人数量
    "friendsnum": "select count(id) as friendsnum  from users where role=2", //亲友数
    "volunteersnum": "select count(id) as volunteersnum  from users where role=4 or (role=2 and service = 2)", //志愿者数
    "customersnum": "select count(id) as customersnum  from users where role=8", //客服者数
    //  "bTf" : "select blindId,count(angelId) as angelnum from `blind2family-through` group by (blindId)", //每个盲人绑定的亲友数
    "bTf": "select count(*) as blind2AngelFenbu,temp.blind2AngelNum from (select count(*) as blind2AngelNum from `blind2family-through` group by (blindId) ) as temp group by temp.blind2AngelNum", //每个盲人绑定的亲友数分布
    "fTb": "select count(*) as angel2Blindfenbu,temp.angel2Blindnum from (select count(*) as angel2Blindnum from `blind2family-through` group by (angelId) ) as temp group by temp.angel2Blindnum", //每个亲友绑定的盲人数分布图
    //呼叫次数
    "daycallnum": "select count(*) as daycallnum from call_orders as co WHERE user_id=caller_id and date((date_add(co.createdAt, interval 8 hour))) = ?", //呼叫次数
    //呼叫成功次数
    "dayCallSuccessNum": 'select count(*) as dayCallSuccessNum from call_orders as co where user_id=caller_id and chat_id in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))=?', //呼叫成功次数
    //呼叫失败次数
    "dayCallFailNum": 'select count(*) as dayCallFailNum from call_orders as co where user_id=caller_id and chat_id not in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))=?', //呼叫失败次数
    //呼叫亲友数
    "daycallangel": "select count(*) as daycallangel from call_orders as co,users as u  where co.user_id=u.id and u.role=1 and service_type=0 and date(date_add(co.createdAt, interval 8 hour))= ?", //呼叫亲友
    //呼叫志愿者数
    "daycallvo": "select count(*) as daycallvo from call_orders as co,users as u where co.user_id=u.id and u.role=1 and service_type=2 and date(date_add(co.createdAt, interval 8 hour))=?", //呼叫志愿者
    //呼叫客服数
    "daycallcus": "select count(*) as daycallcus from call_orders as co,users as u where co.user_id=u.id and u.role=1 and service_type=1 and date(date_add(co.createdAt, interval 8 hour))=?", //呼叫客服
    //接听成功数
    "answerSuccessNum": "select count(*) as answerSuccessNum from `answered_calls` where date((date_add(createdAt, interval 8 hour))) = ?", //接听成功数
    //接听失败数
    "answerFailNum": "select count(*) as answerFailnum from call_orders as co where user_id=caller_id and chat_id in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))=? and answer_time =0",
    //接通成功数
    "daychatnum": "select count(*) as daychatnum from `chat_orders` where date((date_add(createdAt, interval 8 hour))) = ?", //接通次数
    //接通失败数
    "dayChatFailNum": "select count(*) as daychatfailnum from answered_calls where chat_id not in (select chat_id from chat_orders) and date(date_add(createdAt,interval 8 hour))=?",
    //接通完全成功数(音视频完成正常)
    "chatSuccessNum": "select count(*) as chatSuccessNum from chat_orders where date(date_add(createdAt,interval '08:00:00' hour_second))=? and first_audioa != 0 and first_audiob !=0 and first_videob != 0", //接通成功数
    //接通异常(音视频异常)
    "chatingFailNum": "select count(*) as chatingFailNum from chat_orders where date(date_add(createdAt,interval '08:00:00' hour_second))=? and (first_audioa=0 or first_audiob=0 or first_videob = 0)",
    //通话时长
    "dayduration": "select sum(duration) as dayduration from chat_orders where date(date_add(createdAt,interval '08:00:00' hour_second))=?",
    //接听失败原因统计
    "answerfail": "select count(*) as toalcall,hangup_reason as reason from call_orders,signal_order where  call_orders.user_id=call_orders.caller_id and call_orders.chat_id=signal_order.chat_id and call_orders.chat_id not in (select chat_id from answered_calls) and date((date_add(call_orders.createdAt, interval 8 hour))) = ? group by call_orders.hangup_reason order by toalcall desc", //接听失败原因统计
    "friendaudio": "select count(*) as friendaudio,date((date_add(createdAt, interval 8 hour))) as chatdate from chat_orders where first_audioa=0 and date((date_add(createdAt, interval 8 hour)))=? group by chatdate", //亲友端音频出问题
    "blindaudio": "select count(*) as blindaudio,date((date_add(createdAt, interval 8 hour))) as chatdate from chat_orders where first_audiob=0 and date((date_add(createdAt, interval 8 hour)))=? group by chatdate", //盲人端音频出问题
    "blindvideo": "select count(*) as blindvideo,date((date_add(createdAt, interval 8 hour))) as chatdate from chat_orders where first_videob=0 and date((date_add(createdAt, interval 8 hour)))=? group by chatdate", //盲人端视频出问题
    "blindUser": "select users.*,angelnum,money_left,totalmoney from users left join blind_account on users.id = blind_account.user_id left join (select count(*) as angelnum,blindId from `blind2family-through` group by blindId) as t on users.id = t.blindId left join (select sum(pay_money) as totalmoney,receiver_id from charge_order group by `receiver_id`) as p on users.id = p.receiver_id where users.role=1", //盲人基本信息
    "angelUser": "select users.*,balance,profit_total,blindnum from users left join angel_account on users.id = angel_account.user_id left join (select count(*) as blindnum,angelId from `blind2family-through` group by angelId) as p on users.id = p.angelId  where users.role=2", //亲友基本信息
    "userCallDetail": "select call_orders.*,answered_calls.chat_id as aid,answered_calls.answer_time,chat_orders.chat_id as cid,chat_orders.ua,chat_orders.ub,chat_orders.start_time as chat_start_time,chat_orders.end_time as chat_end_time,chat_orders.duration,chat_orders.duration2,users.name,users.address,users.birthday,users.gender,users.tel,users.eyesight from call_orders left join users on call_orders.user_id=users.id left join answered_calls on call_orders.chat_id=answered_calls.chat_id left join chat_orders on call_orders.chat_id=chat_orders.chat_id", //基于用户的呼叫明细
    "callFailDetail": 'select call_orders.*,signal_order.chat_id as cid from call_orders left join signal_order on call_orders.chat_id = signal_order.chat_id where call_orders.user_id = call_orders.caller_id and signal_order.chat_id is null and date(date_add(call_orders.createdAt, interval 8 hour))=?', //呼叫失败明细
    "dayUserNum": 'select count(distinct caller_id) as usernum from call_orders where date((date_add(createdAt, interval 8 hour))) = ?', //一天呼叫的用户数
    //各阶段明细
    //统计昨天的呼叫明细
    "calldetail": "select co.*,u.name as caller_name,u.test as test,date_add(co.createdAt, interval '08:00:00' hour_second) AS callAt from call_orders as co,users as u where co.user_id=u.id and u.role=1 and date(date_add(co.createdAt, interval '08:00:00' hour_second))=? order by co.id DESC",
    //统计昨天的接听明细
    "answerdetail": "select ac.*,u.name as caller_name,u.tel as caller_tel, date_add(ac.createdAt, interval '08:00:00' hour_second) AS callAt from answered_calls as ac,users as u where ac.caller_id=u.id and date(date_add(ac.createdAt, interval '08:00:00' hour_second))=? order by ac.createdAt DESC",
    //统计昨天的接通明细
    "chatdetail": "SELECT chat.*,u.name as caller_name,u.tel as caller_tel, date_add(chat.createdAt, interval '08:00:00' hour_second) AS callAt FROM chat_orders AS chat,users AS u where chat.caller_uid = u.id and date(date_add(chat.createdAt, interval '08:00:00' hour_second))=? ORDER by chat.createdAt DESC", //接通明细 
    //统计昨天的信令明细
    "signaldetail": "select signal_order.*,date_add(createdAt, interval '08:00:00' hour_second) as callAt from signal_order where date(date_add(createdAt, interval '08:00:00' hour_second))=?", //统计中间状态信息
    //真实数据统计
    //真实呼叫次数
    "tdaycallnum": "select count(*) as tdaycallnum from call_orders as co left join users on users.id=co.caller_id WHERE users.test=0 and user_id=caller_id and date((date_add(co.createdAt, interval 8 hour))) = ?", //呼叫次数
    //真实呼叫成功次数
    "tdayCallSuccessNum": 'select count(*) as tdayCallSuccessNum from call_orders as co left join users on co.caller_id=users.id where users.test=0 and user_id=caller_id and chat_id in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))= ?', //呼叫成功次数
    //真实呼叫失败次数
    "tdayCallFailNum": 'select count(*) as tdayCallFailNum from call_orders as co left join users on co.caller_id=users.id where users.test=0 and user_id=caller_id and chat_id not in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))= ?', //呼叫失败次数
    //真实呼叫亲友数
    "tdaycallangel": "select count(*) as tdaycallangel from call_orders as co,users as u  where co.user_id=u.id and u.test=0 and u.role=1 and service_type=0 and date(date_add(co.createdAt, interval 8 hour))= ?", //呼叫亲友
    //真实呼叫志愿者数
    "tdaycallvo": "select count(*) as tdaycallvo from call_orders as co,users as u where co.user_id=u.id and u.role=1 and u.test=0 and service_type=2 and date(date_add(co.createdAt, interval 8 hour))=?", //呼叫志愿者
    //真实呼叫客服数
    "tdaycallcus": "select count(*) as tdaycallcus from call_orders as co,users as u where co.user_id=u.id and u.role=1 and u.test=0 and service_type=1 and date(date_add(co.createdAt, interval 8 hour))=?", //呼叫客服
    //真实接听成功数
    "tanswerSuccessNum": "select count(*) as tanswerSuccessNum from answered_calls as ac left join users on ac.caller_id = users.id where users.test=0 and date((date_add(ac.createdAt, interval 8 hour))) = ?", //接听成功数
    //真实接听失败数
    "tanswerFailNum": "select count(*) as tanswerFailnum from call_orders as co left join users on co.caller_id=users.id where users.test=0 and co.user_id=co.caller_id and chat_id in (select chat_id from signal_order) and date((date_add(co.createdAt,interval 8 hour)))=? and co.answer_time =0",
    //真实接通成功数
    "tdaychatnum": "select count(*) as tdaychatnum from chat_orders as co left join users on co.caller_uid=users.id where users.test=0 and date((date_add(co.createdAt, interval 8 hour))) = ?", //接通次数
    //真实接通失败数
    "tdayChatFailNum": "select count(*) as tdaychatfailnum from answered_calls as ac left join users on users.id=ac.caller_id where users.test=0 and chat_id not in (select chat_id from chat_orders) and date(date_add(ac.createdAt,interval 8 hour))=?",
    //真实接通完全成功数(音视频完成正常)
    "tchatSuccessNum": "select count(*) as tchatSuccessNum from chat_orders as co left join users on co.caller_uid = users.id where users.test=0 and date(date_add(co.createdAt,interval '08:00:00' hour_second))=? and first_audioa != 0 and first_audiob !=0 and first_videob != 0", //接通成功数
    //真实接通异常(音视频异常)
    "tchatingFailNum": "select count(*) as tchatingFailNum from chat_orders as co left join users on co.caller_uid=users.id where users.test=0 and date(date_add(co.createdAt,interval '08:00:00' hour_second))=? and (first_audioa=0 or first_audiob=0 or first_videob = 0)",
    "tdayUserNum": 'select count(distinct caller_id) as tusernum from call_orders as co left join users on co.caller_id=users.id where users.test=0 and date((date_add(co.createdAt, interval 8 hour))) = ?', //一天呼叫的用户数
    //真实用户通话时长
    "tdayduration": "select sum(duration) as tdayduration from chat_orders left join users on chat_orders.caller_uid=users.id where users.test=0 and date(date_add(chat_orders.createdAt,interval '08:00:00' hour_second))=?",
};
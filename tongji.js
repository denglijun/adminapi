const con = require('./appdb4'); //服务器正式库
const sqls = require('./tongjisql');
const sysdb = require('./sysdb');
const moment = require('moment');
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const yestime = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD'); // 统计时的昨天日期

var blindnum = new Promise(function(resolve, reject) {
    con.query(sqls.blindnum, [], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var friendsnum = new Promise(function(resolve, reject) {
    con.query(sqls.friendsnum, [], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var volunteersnum = new Promise(function(resolve, reject) {
    con.query(sqls.volunteersnum, [], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var customersnum = new Promise(function(resolve, reject) {
    con.query(sqls.customersnum, [], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var daycallangel = new Promise(function(resolve, reject) {
    con.query(sqls.daycallangel, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var daycallvo = new Promise(function(resolve, reject) {
    con.query(sqls.daycallvo, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var daycallcus = new Promise(function(resolve, reject) {
    con.query(sqls.daycallcus, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//呼叫次数
var daycallnum = new Promise(function(resolve, reject) {
    con.query(sqls.daycallnum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//呼叫成功次数
var dayCallSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.dayCallSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//呼叫失败次数
var dayCallFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.dayCallFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接听成功次数
var answerSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.answerSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接听失败次数
var answerFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.answerFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接通成功数
var daychatnum = new Promise(function(resolve, reject) {
    con.query(sqls.daychatnum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接通失败数
var dayChatFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.dayChatFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接通完全成功数(音视频完成正常)
var chatSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.chatSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
//接通异常(音视频异常)
var chatingFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.chatingFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var friendaudio = new Promise(function(resolve, reject) {
    con.query(sqls.friendaudio, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var blindaudio = new Promise(function(resolve, reject) {
    con.query(sqls.blindaudio, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var blindvideo = new Promise(function(resolve, reject) {
    con.query(sqls.blindvideo, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    });
});
var dayUserNum = new Promise(function(resolve, reject) {
    con.query(sqls.dayUserNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var dayduration = new Promise(function(resolve, reject) {
    con.query(sqls.dayduration, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
//真实用户数据
var tdaycallnum = new Promise(function(resolve, reject) {
    con.query(sqls.tdaycallnum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdayCallSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.tdayCallSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdayCallFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.tdayCallFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdaycallangel = new Promise(function(resolve, reject) {
    con.query(sqls.tdaycallangel, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdaycallvo = new Promise(function(resolve, reject) {
    con.query(sqls.tdaycallvo, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdaycallcus = new Promise(function(resolve, reject) {
    con.query(sqls.tdaycallcus, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tanswerSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.tanswerSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tanswerFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.tanswerFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdaychatnum = new Promise(function(resolve, reject) {
    con.query(sqls.tdaychatnum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdayChatFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.tdayChatFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tchatSuccessNum = new Promise(function(resolve, reject) {
    con.query(sqls.tchatSuccessNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tchatingFailNum = new Promise(function(resolve, reject) {
    con.query(sqls.tchatingFailNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdayUserNum = new Promise(function(resolve, reject) {
    con.query(sqls.tdayUserNum, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
var tdayduration = new Promise(function(resolve, reject) {
    con.query(sqls.tdayduration, [yestime], function(err, result) {
        if (!err) {
            resolve(result);
        }
    })
});
// 同时执行p1和p2，并在它们都完成后执行then:
Promise.all([blindnum, friendsnum, volunteersnum, customersnum, daycallangel, daycallvo, daycallcus, daycallnum, daychatnum, friendaudio, blindaudio, blindvideo, dayCallSuccessNum, answerSuccessNum, chatSuccessNum, dayUserNum, dayCallFailNum, answerFailNum, dayChatFailNum, chatingFailNum, tdaycallnum, tdayCallSuccessNum, tdayCallFailNum, tdaycallangel, tdaycallvo, tdaycallcus, tanswerSuccessNum, tanswerFailNum, tdaychatnum, tdayChatFailNum, tchatSuccessNum, tchatingFailNum, tdayUserNum, dayduration, tdayduration]).then(function(results) {
    console.log(results);
    if (results[0].length > 0) {
        var b = results[0][0].blindnum;
    } else {
        var b = 0;
    }
    if (results[1].length > 0) {
        var f = results[1][0].friendsnum;
    } else {
        var f = 0;
    }
    if (results[2].length > 0) {
        var v = results[2][0].volunteersnum;
    } else {
        var v = 0;
    }
    if (results[3].length > 0) {
        var c = results[3][0].customersnum;
    } else {
        var c = 0;
    }
    if (results[4].length > 0) {
        var callangel = results[4][0].daycallangel;
    } else {
        var callangel = 0;
    }
    if (results[5].length > 0) {
        var callvo = results[5][0].daycallvo;
    } else {
        var callvo = 0;
    }
    if (results[6].length > 0) {
        var callcus = results[6][0].daycallcus;
    } else {
        var callcus = 0;
    }
    if (results[7].length > 0) {
        var callnum = results[7][0].daycallnum;
    } else {
        var callnum = 0;
    }
    if (results[8].length > 0) {
        var chatnum = results[8][0].daychatnum;
    } else {
        var chatnum = 0;
    }
    if (results[12].length > 0) {
        var callSuccessNum = results[12][0].dayCallSuccessNum;
    } else {
        var callSuccessNum = 0;
    }
    if (results[13].length > 0) {
        var answerSuccessNum = results[13][0].answerSuccessNum;
    } else {
        var answerSuccessNum = 0;
    }
    if (results[14].length > 0) {
        var chatSuccessNum = results[14][0].chatSuccessNum;

    } else {
        var chatSuccessNum = 0;
    }
    if (results[15].length > 0) {
        var userNum = results[15][0].usernum;
    } else {
        var userNum = 0;
    }
    if (results[16].length > 0) {
        var dayCallFailNum = results[16][0].dayCallFailNum
    } else {
        var dayCallFailNum = 0;
    }
    if (results[17].length > 0) {
        var answerFailNum = results[17][0].answerFailnum;
    } else {
        var answerFailNum = 0;
    }
    if (results[18].length > 0) {
        var dayChatFailNum = results[18][0].daychatfailnum;
    } else {
        var dayChatFailNum = 0;
    }
    if (results[19].length > 0) {
        var chatingFailNum = results[19][0].chatingFailNum;
    } else {
        var chatingFailNum = 0;
    }
    if (results[9].length > 0) {
        var faudio = results[9][0].friendaudio;
    } else {
        var faudio = 0;
    }
    if (results[10].length > 0) {
        var baudio = results[10][0].blindaudio;
    } else {
        var baudio = 0;
    }
    if (results[11].length > 0) {
        var bvideo = results[11][0].blindvideo;
    } else {
        var bvideo = 0;
    }
    if (results[20].length > 0) {
        var tdaycallnum = results[20][0].tdaycallnum;
    } else {
        var tdaycallnum = 0;
    }
    if (results[21].length > 0) {
        var tdayCallSuccessNum = results[21][0].tdayCallSuccessNum;
    } else {
        var tdayCallSuccessNum = 0;
    }
    if (results[22].length > 0) {
        var tdayCallFailNum = results[22][0].tdayCallFailNum;
    } else {
        var tdayCallFailNum = 0;
    }
    if (results[23].length > 0) {
        var tdaycallangel = results[23][0].tdaycallangel;
    } else {
        var tdaycallangel = 0;
    }
    if (results[24].length > 0) {
        var tdaycallvo = results[24][0].tdaycallvo;
    } else {
        var tdaycallvo = 0;
    }
    if (results[25].length > 0) {
        var tdaycallcus = results[25][0].tdaycallcus;
    } else {
        var tdaycallcus = 0;
    }
    if (results[26].length > 0) {
        var tanswerSuccessNum = results[26][0].tanswerSuccessNum;
    } else {
        var tanswerSuccessNum = 0;
    }
    if (results[27].length > 0) {
        var tanswerFailNum = results[27][0].tanswerFailnum;
    } else {
        var tanswerFailNum = 0;
    }
    if (results[28].length > 0) {
        var tdaychatnum = results[28][0].tdaychatnum;
    } else {
        var tdaychatnum = 0;
    }
    if (results[29].length > 0) {
        var tdayChatFailNum = results[29][0].tdaychatfailnum;
    } else {
        var tdayChatFailNum = 0;
    }
    if (results[30].length > 0) {
        var tchatSuccessNum = results[30][0].tchatSuccessNum;
    } else {
        var tchatSuccessNum = 0;
    }
    if (results[31].length > 0) {
        var tchatingFailNum = results[31][0].tchatingFailNum;
    } else {
        var tchatingFailNum = 0;
    }
    if (results[32].length > 0) {
        var tdayUserNum = results[32][0].tusernum;
    } else {
        var tdayUserNum = 0;
    }
    if (results[33].length > 0) {
        var dayduration = results[33][0].dayduration;
    } else {
        var dayduration = 0;
    }
    if (results[34].length > 0) {
        var tdayduration = results[34][0].tdayduration;
    } else {
        var tdayduration = 0;
    }
    sysdb.query('insert into count_user (blindnum,friendnum,volunteernum,customernum,createdAt,updatedAt) values (?,?,?,?,?,?)', [b, f, v, c, time, time], function(err, re) {
        console.log(err);
        console.log(re);
    });
    sysdb.query('insert into count_callanswerchat (callnum,callsuccessnum,callfailnum,answersuccessnum,answerfailnum,chatsuccessnum,chatfailnum,callfriendnum,callvolunteernum,callcustomernum,usernum,auviyes,auvino,duration,tcallnum,tcallsuccessnum,tcallfailnum,tanswersuccessnum,tanswerfailnum,tchatsuccessnum,tchatfailnum,tcallfriendnum,tcallvolunteernum,tcallcustomernum,tusernum,tauviyes,tauvino,tduration,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [callnum, callSuccessNum, dayCallFailNum, answerSuccessNum, answerFailNum, chatnum, dayChatFailNum, callangel, callvo, callcus, userNum, chatSuccessNum, chatingFailNum, dayduration, tdaycallnum, tdayCallSuccessNum, tdayCallFailNum, tanswerSuccessNum, tanswerFailNum, tdaychatnum, tdayChatFailNum, tdaycallangel, tdaycallvo, tdaycallcus, tdayUserNum, tchatSuccessNum, tchatingFailNum, tdayduration, time, time], function(err, re) {
        console.log(err);
        console.log(re);
    });
    sysdb.query('insert into count_chatfailreason (failnum,friendaudio,friendvideo,blindaudio,blindvideo,createdAt,updatedAt) values (?,?,?,?,?,?,?)', [0, faudio, 0, baudio, bvideo, time, time], function(err, re) {
        console.log(err);
        console.log(re);
    });

});

con.query(sqls.bTf, [], function(err, result) {
    if (err) throw err;
    console.log(result);
    var onet = 0,
        twot = 0,
        threet = 0,
        fourt = 0,
        fivet = 0,
        sixtotent = 0,
        overtent = 0;
    var total = 0;
    for (let index in result) {
        result[index].blind2AngelNum = parseInt(result[index].blind2AngelNum);
        total += parseInt(result[index].blind2AngelFenbu);
        if (result[index].blind2AngelNum == 1) {
            onet = result[index].blind2AngelFenbu;
        }
        if (result[index].blind2AngelNum == 2) {
            twot = result[index].blind2AngelFenbu;
        }
        if (result[index].blind2AngelNum == 3) {
            threet = result[index].blind2AngelFenbu
        }
        if (result[index].blind2AngelNum == 4) {
            fourt = result[index].blind2AngelFenbu
        }
        if (result[index].blind2AngelNum == 5) {
            fivet = result[index].blind2AngelFenbu
        }
        if (result[index].blind2AngelNum > 5 && result[index].blind2AngelNum <= 10) {
            sixtotent = result[index].blind2AngelFenbu
        }
        if (result[index].blind2AngelNum > 10) {
            overtent = result[index].blind2AngelFenbu
        }
    }
    con.query(sqls.friendsnum, [], function(err, result) {
        var zerot = parseInt(result[0].friendsnum) - total;
        sysdb.query('insert into count_blind2friends (zero,one,two,three,four,five,sixtoten,overten,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?)', [zerot, onet, twot, threet, fourt, fivet, sixtotent, overtent, time, time], function(err, re) {
            console.log(err);
            console.log(re);
        })
    });
});

con.query(sqls.fTb, [], function(err, result) {
    if (err) throw err;
    var onett = 0,
        twott = 0,
        threett = 0,
        fourtt = 0,
        fivett = 0,
        sixtotentt = 0,
        overtentt = 0;
    var total = 0;
    for (let i in result) {
        result[i].angel2Blindnum = parseInt(result[i].angel2Blindnum);
        total += parseInt(result[i].angel2Blindfenbu);
        if (result[i].angel2Blindnum == 1) {
            onett = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum == 2) {
            twott = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum == 3) {
            threett = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum == 4) {
            fourtt = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum == 5) {
            fivett = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum > 5 && result[i].angel2Blindnum <= 10) {
            sixtotentt = result[i].angel2Blindfenbu
        }
        if (result[i].angel2Blindnum > 10) {
            overtentt = result[i].angel2Blindfenbu
        }
    }
    con.query(sqls.blindnum, [], function(err, result) {
        var zerott = parseInt(result[0].blindnum) - total;
        sysdb.query('insert into count_friend2blind (zero,one,two,three,four,five,sixtoten,overten,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?)', [zerott, onett, twott, threett, fourtt, fivett, sixtotentt, overtentt, time, time], function(err, re) {
            console.log(err);
            console.log(re);
        })
    });

});

con.query(sqls.answerfail, [yestime], function(err, result) {
    if (err) throw err;
    for (var k in result) {
        sysdb.query('insert into count_answerfailreason (failnum,reason,createdAt,updatedAt) values (?,?,?,?)', [result[k].toalcall, result[k].reason, time, time], function(err, re) {
            console.log(err);
            console.log(re);
        })
    }
});

/**
 * 昨天的呼叫明细 
 */
con.query(sqls.calldetail, [yestime], function(err, result) {
    if (err) throw err;
    for (var r in result) {
        sysdb.query('insert into count_calldetail (chat_id,user_id,caller_id,caller_tel,caller_name,callee_id,callee_tel,call_from,hangup_reason,call_time,answer_time,hangup_time,first_vframe_time,duration,fee,service_type,user_agent,callAt,test,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [result[r].chat_id, result[r].user_id, result[r].caller_id, result[r].caller_tel, result[r].caller_name, result[r].callee_id, result[r].callee_tel, result[r].call_from, result[r].hangup_reason, result[r].call_time, result[r].answer_time, result[r].hangup_time, result[r].first_vframe_time, result[r].duration, result[r].fee, result[r].service_type, result[r].user_agent, result[r].callAt, result[r].test, time, time], function(err, result) {
            console.log(err);
            console.log(result);
        });
    }
});

/**
 * 昨天的接听明细 
 */
con.query(sqls.answerdetail, [yestime], function(err, result) {
    if (err) throw err;
    for (var r in result) {
        sysdb.query('insert into count_answerdetail (chat_id,caller_id,caller_tel,callee_id,service_type,answer_time,callAt,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?)', [result[r].chat_id, result[r].caller_id, result[r].caller_tel, result[r].callee_id, result[r].service_type, result[r].answer_time, result[r].callAt, time, time], function(err, result) {
            if (err) {
                console.log('接听明细更新失败');
            } else {
                console.log('接听明细更新成功');
            }
        });
    }
});
con.query(sqls.chatdetail, [yestime], function(err, result) {
    if (err) throw err;
    for (var t in result) {
        sysdb.query('insert into count_chatdetail (chat_id,caller_uid,caller_tel,caller_name,callee_uid,start_time,end_time,duration,duration2,first_audioa,first_videoa,quality_a,first_audiob,first_videob,quality_b,ua,ub,flowa,flowb,callAt,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [result[t].chat_id, result[t].caller_uid, result[t].caller_tel, result[t].caller_name, result[t].callee_uid, result[t].start_time, result[t].end_time, result[t].duration, result[t].duration2, result[t].first_audioa, result[t].first_videoa, result[t].quality_a, result[t].first_audiob, result[t].first_videob, result[t].quality_b, result[t].ua, result[t].ub, result[t].flowa, result[t].flowb, result[t].callAt, time, time], function(err, result) {
            console.log(err);
            console.log(result);
        });
    }
});

con.query(sqls.signaldetail, [yestime], function(err, result) {
    if (err) throw err;
    for (var t in result) {
        sysdb.query('insert into count_signal (chat_id,call_type,caller_uid,caller_tel,callee_uid,callee_tel,hanguper_uid,hanguper_tel,call_time,arrived_time,showed_time,answer_time,hangup_time,notified_count,notified_family,notified_cs,notified_vt,notified_msg,notified_push,arrived_count,showed_count,refused_count,callAt,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [result[t].chat_id, result[t].call_type, result[t].caller_uid, result[t].caller_tel, result[t].callee_uid, result[t].callee_tel, result[t].hanguper_uid, result[t].hanguper_tel, result[t].call_time, result[t].arrived_time, result[t].showed_time, result[t].answer_time, result[t].hangup_time, result[t].notified_count, result[t].notified_family, result[t].notified_cs, result[t].notified_vt, result[t].notified_msg, result[t].notified_push, result[t].arrived_count, result[t].showed_count, result[t].refused_count, result[t].callAt, time, time], function(err, result) {
            console.log(err);
            console.log(result);
        });
    }
});
//JS日期系列：根据出生日期 得到周岁年龄               
//参数strBirthday已经是正确格式的2007.02.09这样的日期字符串
//后续再增加相关的如日期判断等JS关于日期处理的相关方法

let getAge = function(strBirthday) {
    var returnAge;
    var strBirthdayArr = strBirthday.split("-");
    var birthYear = strBirthdayArr[0];
    var birthMonth = strBirthdayArr[1];
    var birthDay = strBirthdayArr[2];

    d = new Date();
    var nowYear = d.getFullYear('YYYY');
    var nowMonth = d.getMonth() + 1;
    var nowDay = d.getDate();

    if (nowYear == birthYear) {
        returnAge = 0; //同年 则为0岁
    } else {
        var ageDiff = nowYear - birthYear; //年之差
        if (ageDiff > 0) {
            if (nowMonth == birthMonth) {
                var dayDiff = nowDay - birthDay; //日之差
                if (dayDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            } else {
                var monthDiff = nowMonth - birthMonth; //月之差
                if (monthDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            }
        } else {
            returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
        }
    }

    return returnAge; //返回周岁年龄

};

/**
 * [封装的方法，将秒数转化为时分秒]
 * @version 2017-03-16
 */
let sec_to_time = function(s) {
    var t;
    if (s > -1) {
        var hour = Math.floor(s / 3600);
        var min = Math.floor(s / 60) % 60;
        var sec = s % 60;
        if (hour < 10) {
            t = '0' + hour + ":";
        } else {
            t = hour + ":";
        }

        if (min < 10) { t += "0"; }
        t += min + ":";
        if (sec < 10) { t += "0"; }
        t += sec.toFixed(2);
    }
    return t;
}

/**
 * 根据日期获取周数
 * @dd 日期
 */
let getWeek = function(dateString) {
        var da = '';
        if (dateString == undefined) {
            var now = new Date();
            var now_m = now.getMonth() + 1;
            now_m = (now_m < 10) ? '0' + now_m : now_m;
            var now_d = now.getDate();
            now_d = (now_d < 10) ? '0' + now_d : now_d;
            da = now.getFullYear() + '-' + now_m + '-' + now_d;
            console.log('今天系统时间是:' + da);
        } else {
            da = dateString; //日期格式2015-12-30
        }
        var date1 = new Date(da.substring(0, 4), parseInt(da.substring(5, 7)) - 1, da.substring(8, 10)); //当前日期
        var date2 = new Date(da.substring(0, 4), 0, 1); //1月1号
        //获取1月1号星期（以周一为第一天，0周一~6周日）
        var dateWeekNum = date2.getDay() - 1;
        if (dateWeekNum < 0) { dateWeekNum = 6; }
        if (dateWeekNum < 4) {
            //前移日期
            date2.setDate(date2.getDate() - dateWeekNum);
        } else {
            //后移日期
            date2.setDate(date2.getDate() + 7 - dateWeekNum);
        }
        var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
        if (d < 0) {
            var date3 = (date1.getFullYear() - 1) + "-12-31";
            return getYearWeek(date3);
        } else {
            //得到年数周数
            var year = date1.getFullYear();
            var week = Math.ceil((d + 1) / 7);
            console.log(year + "年第" + week + "周");
            return week;
        }
    }
    /**
     * 数组根据字段分组并且按指定字段排序
     */
let groupAndSort = function(arr, key) {
    let map = {};
    let dest = [];
    let last = [];
    for (let index in arr) {
        let temp = arr[index];
        if (!map[temp[key]]) {
            dest.push({
                Group: temp[key],
                data: [temp]
            });
            map[temp[key]] = temp;
        } else {
            for (let j = 0; j < dest.length; j++) {
                let dj = dest[j];
                if (dj.Group == temp[key]) {
                    dj.data.push(temp);
                    break;
                }
            }
        }
    }
    for (let i in dest) {
        dest[i].data.sort(compare("call_time"));
        last = last.concat(dest[i].data);
    }
    return last;
}

function sort(arr) {
    arr.sort(compare2("call_time"));
    return arr;
}

function compare(pro) {
    return function(obj1, obj2) {
        var val1 = obj1[pro];
        var val2 = obj2[pro];
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}

function compare2(pro) {
    return function(obj1, obj2) {
        var val1 = obj1[pro];
        var val2 = obj2[pro];
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }
}

let get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};
module.exports = {
    getAge,
    sec_to_time,
    getWeek,
    groupAndSort,
    get_client_ip,
    sort
}
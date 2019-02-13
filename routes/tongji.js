const router = require('koa-router')();
const CountUser = require('../models').CountUser;
const CountFriend2blind = require('../models').CountFriend2blind;
const CountChatFailReason = require('../models').CountChatFailReason;
const CountCallanswerchat = require('../models').CountCallanswerchat;
const CountBlind2Friend = require('../models').CountBlind2Friend;
const CountAnswerFailReason = require('../models').CountAnswerFailReason;
const CountCallDetail = require('../models').CountCallDetail;
const CountChatDetail = require('../models').CountChatDetail;
const CountAnswerDetail = require('../models').CountAnswerDetail;
const CountSignal = require('../models').CountSignal;
const Sequelize = require('../models').sequelize;
const xlsx = require('node-xlsx');
const send = require('koa-send');
const common = require('../lib/common.js');


const fs = require('fs');


const moment = require("moment");
//const con = require('../appdb')();
// const con = require('../appdb3')();


router.prefix('/tongji');

router.get('/getCountUser', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined') {
        key1 = moment(parseInt(key[0])).format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }

    let users = await CountUser.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
        order: [
            ['createdAt', 'ASC']
        ]
    });
    for (let index in users) {
        users[index].dataValues.createdAt = moment(users[index].dataValues.createdAt).format("YYYY-MM-DD");
    }
    ctx.response.body = { records: users };
});
router.get('/getCountFriend2blind', async(ctx, next) => {
    let key = ctx.query.key;
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined' && key != '') {
        key1 = moment(key).add(8, 'h').utc().format('YYYY-MM-DD');
        key2 = moment(key1).add('1', 'd');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
    }
    let total = await CountFriend2blind.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });
    ctx.response.body = { records: total, total: total.length };
});
router.get('/getCountChatFailReason', async(ctx, next) => {
    let userType = ctx.query.userType;
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let attributes = [];
    if (userType == "true" || userType == true) {
        attributes = ['id', 'failnum', 'friendaudio', 'friendvideo', 'blindaudio', 'blindvideo', 'createdAt'];
    } else {
        attributes = [
            'id', ['tfailnum', 'failnum'],
            ['tfriendaudio', 'friendaudio'],
            ['tfriendvideo', 'friendvideo'],
            ['tblindaudio', 'blindaudio'],
            ['tblindvideo', 'blindvideo'], 'createdAt'
        ];
    }
    let total = await CountChatFailReason.count({

    });
    let users = await CountChatFailReason.findAll({
        attributes: attributes,
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['createdAt', 'DESC']
        ]
    });
    for (let index in users) {
        users[index].dataValues.createdAt = moment(users[index].dataValues.createdAt).format('YYYY-MM-DD HH:mm:ss');
    }
    ctx.response.body = { records: users, total: total };
});
router.get('/getCountCallanswerchat', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let userType = ctx.query.userType; //true全部用户,false真实用户
    let type = ctx.query.type; //day,week,month
    let attributes = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(parseInt(key[0])).format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    if (userType == "true" || userType == true) {
        attributes = ['callnum', 'callfriendnum', 'callvolunteernum', 'callcustomernum', 'callsuccessnum', 'answersuccessnum', 'chatsuccessnum', 'usernum', 'callfailnum', 'answerfailnum', 'chatfailnum', 'auviyes', 'auvino', 'duration', 'createdAt'];
    } else {
        attributes = [
            ['tcallnum', 'callnum'],
            ['tcallfriendnum', 'callfriendnum'],
            ['tcallvolunteernum', 'callvolunteernum'],
            ['tcallcustomernum', 'callcustomernum'],
            ['tcallsuccessnum', 'callsuccessnum'],
            ['tanswersuccessnum', 'answersuccessnum'],
            ['tchatsuccessnum', 'chatsuccessnum'],
            ['tusernum', 'usernum'],
            ['tcallfailnum', 'callfailnum'],
            ['tanswerfailnum', 'answerfailnum'],
            ['tchatfailnum', 'chatfailnum'],
            ['tauviyes', 'auviyes'],
            ['tauvino', 'auvino'],
            ['tduration', 'duration'],
            'createdAt'
        ];
    }
    let total = await CountCallanswerchat.count({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
    });

    let users = await CountCallanswerchat.findAll({
        attributes: attributes,
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['createdAt', 'DESC']
        ],
        raw: true
    });
    for (let index in users) {
        users[index].createdAt = moment(users[index].createdAt).format('YYYY-MM-DD');
        users[index].callSuccessRate = Math.round(parseFloat(users[index].callsuccessnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%";
        users[index].callFailRate = Math.round(parseFloat(users[index].callfailnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%";
        users[index].answerSuccessRate = Math.round(parseFloat(users[index].answersuccessnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%"; //相对呼叫成功数
        users[index].answerSuccessRate2 = Math.round(parseFloat(users[index].answersuccessnum) / parseFloat(users[index].answersuccessnum + users[index].answerfailnum) * 10000) / 100.00 + "%"; //相对接听数
        users[index].answerFailRate = Math.round(parseFloat(users[index].answerfailnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%"; //相对呼叫成功数
        users[index].answerFailRate2 = Math.round(parseFloat(users[index].answerfailnum) / parseFloat(users[index].answersuccessnum + users[index].answerfailnum) * 10000) / 100.00 + "%"; //相对接听数
        users[index].chatSuccessRate = Math.round(parseFloat(users[index].chatsuccessnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%"; //相对接听总数
        users[index].chatSuccessRate2 = Math.round(parseFloat(users[index].chatsuccessnum) / parseFloat(users[index].chatsuccessnum + users[index].chatfailnum) * 10000) / 100.00 + "%"; //相对接通数
        users[index].chatFailRate = Math.round(parseFloat(users[index].chatfailnum) / parseFloat(users[index].callnum) * 10000) / 100.00 + "%"; //相对接听总数
        users[index].chatFailRate2 = Math.round(parseFloat(users[index].chatfailnum) / parseFloat(users[index].chatsuccessnum + users[index].chatfailnum) * 10000) / 100.00 + "%"; //相对接通数
        users[index].auviyesRate2 = Math.round(parseFloat(users[index].auviyes) / parseFloat(users[index].auviyes + users[index].auvino) * 10000) / 100.00 + "%"; //相对正常与异常
        users[index].auvinoRate2 = Math.round(parseFloat(users[index].auvino) / parseFloat(users[index].auviyes + users[index].auvino) * 10000) / 100.00 + "%"; //相对正常与异常
        users[index].callsuccessnum2 = users[index].callsuccessnum + '/' + users[index].callSuccessRate;
        users[index].callfailnum2 = users[index].callfailnum + '/' + users[index].callFailRate;
        users[index].answersuccessnum2 = users[index].answersuccessnum + '/' + users[index].answerSuccessRate2;
        users[index].answerfailnum2 = users[index].answerfailnum + '/' + users[index].answerFailRate2;
        users[index].chatsuccessnum2 = users[index].chatsuccessnum + '/' + users[index].chatSuccessRate2;
        users[index].chatfailnum2 = users[index].chatfailnum + '/' + users[index].chatFailRate2;
        users[index].auviyes2 = users[index].auviyes + '/' + users[index].auviyesRate2;
        users[index].auvino2 = users[index].auvino + '/' + users[index].auvinoRate2;
        users[index].duration = common.sec_to_time(users[index].duration);

    }
    ctx.response.body = { records: users, total: total };
});
router.get('/getCountBlind2Friend', async(ctx, next) => {
    let key = ctx.query.key;
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined' && key != '') {
        key1 = moment(key).add(8, 'h').utc().format('YYYY-MM-DD');
        key2 = moment(key1).add('1', 'd');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
    }
    key1 = key1.toString();
    let total = await CountBlind2Friend.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        }
    });
    ctx.response.body = { records: total, total: total.length };
});
router.get('/getCountAnswerFailReason', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let userType = ctx.query.userType; //是否去除测试用户数据
    let searchReason = ctx.query.searchReason; //需要去除的原因
    let result = [];
    let failnumsum = 0;
    let searchReasonArray = [];
    let chatIdArray = [];
    let answeredIdArray = [];
    let userArray = [];
    let answeredFailArray = [];
    let allCount = 0;
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    if (userType == 'true') {
        userArray = [0, 1];
    } else {
        userArray = [0];
    }
    if (typeof(searchReason) != 'undefined') {
        searchReasonArray = searchReason.split(';');
    }
    //呼通的chat_id
    let chatIds = await CountSignal.findAll({
        attributes: ['chat_id'],
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
        },
        raw: true,
    });
    for (let i in chatIds) {
        chatIdArray.push(chatIds[i].chat_id);
    }
    //接听的chat_id
    let answerIds = await CountAnswerDetail.findAll({
        attributes: ['chat_id'],
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
        },
        raw: true,
    });
    for (let i in answerIds) {
        answeredIdArray.push(answerIds[i].chat_id);
    }
    for (let q in chatIdArray) {
        if (answeredIdArray.indexOf(chatIdArray[q]) == -1) {
            answeredFailArray.push(chatIdArray[q]);
        }
    }
    //呼叫成功数
    let answernum = await CountCallDetail.count({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'callSuccessNum']
        ],
        where: {
            'createdAt': {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
            'chat_id': {
                [Sequelize.Op.in]: chatIdArray
            },
            'hangup_reason': {
                [Sequelize.Op.notIn]: searchReasonArray
            },
            'test': {
                [Sequelize.Op.or]: userArray
            },
        },
        raw: true,
    });
    //接听失败统计
    let answerFail = await CountCallDetail.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'failnum'],
            ['hangup_reason', 'reason']
        ],
        where: {
            'createdAt': {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
            'chat_id': {
                [Sequelize.Op.in]: answeredFailArray
            },
            'hangup_reason': {
                [Sequelize.Op.notIn]: searchReasonArray
            },
            'test': {
                [Sequelize.Op.or]: userArray
            },
        },
        raw: true,
        group: 'hangup_reason',
        order: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']
        ]
    });
    for (let index in answerFail) {
        allCount += answerFail[index].failnum;
    }
    if (allCount > 0) {
        for (let k in answerFail) {
            //相对接听失败总数
            answerFail[k].proportion = Math.round(parseFloat(answerFail[k].failnum) / parseFloat(allCount) * 10000) / 100.00 + "%";
            answerFail[k].createdAt = moment(answerFail[k].createdAt).format('YYYY-MM-DD HH:mm:ss');
            if (answernum > 0) {
                answerFail[k].proportion2 = Math.round(parseFloat(answerFail[k].failnum) / parseFloat(answernum) * 10000) / 100.00 + "%";
            } else {
                answerFail[k].proportion2 = 0;
            }
        }
    }
    ctx.response.body = { records: answerFail };
});
router.get('/calldetail', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let type = ctx.query.type;
    let userType = ctx.query.userType;
    let key1 = '';
    let key2 = '';
    let $where = {};
    let chatIdArray = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    if (type == 'success') {
        //查询呼叫成功的明细
        let chatIds = await CountSignal.findAll({
            attributes: ['chat_id'],
            where: {
                createdAt: {
                    [Sequelize.Op.between]: [key1, key2]
                }
            },
            raw: true
        });
        for (let index in chatIds) {
            chatIdArray.push(chatIds[index].chat_id);
        }
        $where = {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            chat_id: {
                [Sequelize.Op.in]: chatIdArray
            }
        };
    } else {
        $where = {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        };
    }
    if (userType == 'true' || userType == true) {
        $where.test = {
            [Sequelize.Op.in]: [0, 1]
        };
    } else {
        $where.test = {
            [Sequelize.Op.in]: [0]
        };
    }
    let total = await CountCallDetail.findAll({
        where: $where
    });

    let users = await CountCallDetail.findAll({
        where: $where,
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['callAt', 'DESC']
        ]
    });
    for (let index in users) {
        users[index].dataValues.createdAt = moment(users[index].dataValues.createdAt).format('YYYY-MM-DD HH:mm:ss');
        users[index].dataValues.call_time = moment(users[index].dataValues.call_time).format('YYYY-MM-DD HH:mm:ss');
        users[index].dataValues.hangup_time = moment(users[index].dataValues.hangup_time).format('YYYY-MM-DD HH:mm:ss');
    }
    ctx.response.body = { records: users, total: total.length };

});

router.get('/chatdetail', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let type = ctx.query.type;
    let userType = ctx.query.userType;
    let key1 = '';
    let key2 = '';
    let $where = '';
    let $w = {};
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    if (type == 'success') {
        //接通并且音视频都正常
        $where = {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            first_audioa: {
                [Sequelize.Op.ne]: 0
            },
            first_audiob: {
                [Sequelize.Op.ne]: 0
            },
            first_videob: {
                [Sequelize.Op.ne]: 0
            }
        };
    } else {
        //接通
        $where = {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        };
    }
    if (userType == "true" || userType == true) {
        $w = {
            test: {
                [Sequelize.Op.in]: [0, 1]
            }
        };
    } else {
        $w = {
            test: {
                [Sequelize.Op.in]: [0]
            }
        }
    }
    console.log($where)
    CountChatDetail.hasOne(CountCallDetail, { foreignKey: 'chat_id' });
    let users = await CountChatDetail.findAll({
        include: [{
            model: CountCallDetail,
            attributes: ['callee_tel', 'hangup_reason', 'call_time', 'hangup_time', ],
            where: $w,
            // required: false,
        }],
        where: $where,
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['callAt', 'DESC']
        ],
        raw: true
    });
    for (let index in users) {
        users[index].callee_tel = users[index]['CountCallDetail.callee_tel'];
        users[index].hangup_reason = users[index]['CountCallDetail.hangup_reason'];
        users[index].call_time = moment(users[index]['CountCallDetail.call_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].hangup_time = moment(users[index]['CountCallDetail.hangup_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].createdAt = moment(users[index].createdAt).format('YYYY-MM-DD HH:mm:ss');
        users[index].start_time = moment(users[index].start_time * 1000).format('YYYY-MM-DD HH:mm:ss');
        users[index].end_time = moment(users[index].end_time * 1000).format('YYYY-MM-DD HH:mm:ss');
        users[index].duration = common.sec_to_time(users[index].duration);
        users[index].flowa = users[index].flowa / 1024;
        users[index].flowb = users[index].flowb / 1024;

    }
    ctx.response.body = { records: users };

});

router.get('/answerFailDetail', async(ctx, next) => {
    let page = parseInt(ctx.query.pageNo);
    let pagenum = parseInt(ctx.query.pageSize);
    let key = ctx.query['key[]'];
    let key1 = '';
    let key2 = '';
    let ids = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
        key2 = moment(Date.now()).format('YYYY-MM-DD');
    }
    let chat_ids = await CountChatDetail.findAll({
        attributes: ['chat_id'],
        where: {
            callAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        }
    });
    for (let k in chat_ids) {
        ids.push(chat_ids[k].dataValues.chat_id);
    }
    let total = await CountCallDetail.findAll({
        where: {
            callAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            chat_id: {
                [Sequelize.Op.notIn]: ids
            }
        }
    });
    let result = await CountCallDetail.findAll({
        where: {
            callAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            chat_id: {
                [Sequelize.Op.notIn]: ids
            }
        },
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['callAt', 'DESC']
        ]
    });
    ctx.response.body = { records: result, total: total.length };


});
router.get('/chatdetailexcel', async(ctx, next) => {
    let key = ctx.query['searchKey[]'];
    console.log(key);
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');

        let result = await CountChatDetail.findAll({
            where: {
                callAt: {
                    [Sequelize.Op.between]: [key1, key2]
                }
            },
            order: [
                ['callAt', 'DESC']
            ]
        });
        let datas = [
            ['接通id', '呼叫者电话', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间', '挂断时间', '通话时长', '亲友端APP版本号', '盲人端APP版本号', '呼叫日期']
        ];
        for (let index in result) {
            let data = [result[index].chat_id, result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].call_time, result[index].hangup_time, result[index].duration, result[index].ua, result[index].ub, result[index].callAt]
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/chatdetail.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            data: 'uploads/chatdetail.xlsx'
        };
    } else {
        let result = await CountChatDetail.findAll({
            attributes: ['id', 'chat_id', 'caller_tel', 'caller_name', 'callee_tel', 'hangup_reason', 'call_time', 'hangup_time', 'duration', 'ua', 'ub', 'callAt'],
            order: [
                ['callAt', 'DESC']
            ]
        });
        let datas = [
            ['接通id', '呼叫者电话', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间', '挂断时间', '通话时长', '亲友端APP版本号', '盲人端APP版本号', '呼叫日期']
        ];
        for (let index in result) {
            let data = [result[index].chat_id, result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].call_time, result[index].hangup_time, result[index].duration, result[index].ua, result[index].ub, result[index].callAt]
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/chatdetail.xlsx', buffer, { 'flag': 'w' }); //生成excel
        // ctx.attachment('public/uploads/test1.xlsx');
        // let test = await send(ctx, 'public/uploads/test1.xlsx');
        // console.log(test);
        ctx.response.body = {
            code: 200,
            data: 'uploads/chatdetail.xlsx'
        };
    }
});

router.get('/calldetailexcel', async(ctx, next) => {
    let key = ctx.query['searchKey[]'];
    let dd = moment(Date.now()).format('YYYYMMDD');
    console.log(key);
    let key1 = '';
    let key2 = '';
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        let result = await CountCallDetail.findAll({
            where: {
                callAt: {
                    [Sequelize.Op.between]: [key1, key2]
                }
            },
            order: [
                ['callAt', 'DESC']
            ]
        });
        let datas = [
            ['呼叫者电话', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间']
        ];
        for (let index in result) {
            let data = [result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].callAt];
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/calldetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            data: 'uploads/calldetail' + dd + '.xlsx'
        };

    } else {
        let result = await CountCallDetail.findAll({
            order: [
                ['callAt', 'DESC']
            ]
        });
        let datas = [
            ['呼叫者电话', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间']
        ];
        for (let index in result) {
            let data = [result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].callAt];
            datas.push(data);
        }

        let buffer = xlsx.build([{
            name: 'sheet1',
            data: datas
        }]);

        fs.writeFileSync('public/uploads/calldetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
        ctx.response.body = {
            code: 200,
            data: 'uploads/calldetail' + dd + '.xlsx'
        };
    }
});

router.get('/countCallFailReasonExcel', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let result = [];
    let allCount = 0;
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    let callnum = await CountCallDetail.findAll({
        where: {
            callAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
    });
    let callnumtotal = callnum.length;
    let total = await Sequelize.query('select count(*) as callFailNum,hangup_reason from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.callAt > ? and count_calldetail.callAt < ? group by count_calldetail.hangup_reason', {
        replacements: [key1, key2]
    });
    let re = await Sequelize.query('select count(*) as callFailNum,hangup_reason from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.callAt > ? and count_calldetail.callAt < ? group by count_calldetail.hangup_reason order by callFailNum desc limit ?,?', {
        replacements: [key1, key2, (page - 1) * pagenum, pagenum]
    });
    for (let index in total[0]) {
        allCount += total[0][index].callFailNum;
    }
    if (allCount > 0) {
        for (let k in re[0]) {
            re[0][k].proportion = Math.round(parseFloat(re[0][k].callFailNum) / parseFloat(allCount) * 10000) / 100.00 + "%";
            re[0][k].proportion2 = Math.round(parseFloat(re[0][k].callFailNum) / parseFloat(callnumtotal) * 10000) / 100.00 + "%";
            let temp = await Sequelize.query('select distinct caller_id from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.callAt > ? and count_calldetail.callAt < ? and hangup_reason=?', {
                replacements: [key1, key2, re[0][k].hangup_reason]
            });
            re[0][k].usernum = temp[0].length;
        }
    }
    let datas = [
        ['数量', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间']
    ];
    for (let index in result) {
        let data = [result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].callAt];
        datas.push(data);
    }

    let buffer = xlsx.build([{
        name: 'sheet1',
        data: datas
    }]);

    fs.writeFileSync('public/uploads/calldetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
    ctx.response.body = {
        code: 200,
        data: 'uploads/calldetail' + dd + '.xlsx'
    };
});

router.get('/getCountAnswerFailReasonExcel', async(ctx, next) => {
    let key = ctx.query['searchKey[]'];
    let dd = moment(Date.now()).format('YYYYMMDD');
    let failnumsum = 0;
    if (typeof(key) != 'undefined') {
        key1 = key[0];
        key2 = key[1];
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
    }
    let result = await CountAnswerFailReason.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
        order: [
            ['failnum', 'DESC']
        ]
    });
    let datas = [
        ['数量', '比例', '原因', '统计时间']
    ];
    if (result.length > 0) {
        for (let i in result) {
            failnumsum += parseInt(result[i].failnum);
        }
        for (let index in result) {
            let proportion = Math.round(parseFloat(result[index].failnum) / parseFloat(failnumsum) * 10000) / 100.00 + "%";
            let data = [result[index].failnum, proportion, result[index].reason, result[index].createdAt];
            datas.push(data);
        }
    }

    let buffer = xlsx.build([{
        name: 'sheet1',
        data: datas
    }]);

    fs.writeFileSync('public/uploads/answerfailreason' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
    ctx.response.body = {
        code: 200,
        data: 'uploads/answerfailreason' + dd + '.xlsx'
    };

});
router.get('/getCountAnswerFailDetailExcel', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let dd = moment(Date.now()).format('YYYYMMDD');
    let key1 = '';
    let key2 = '';
    let ids = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
        key2 = moment(Date.now()).format('YYYY-MM-DD');
    }
    let chat_ids = await CountChatDetail.findAll({
        attributes: ['chat_id'],
        where: {
            callAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        }
    });
    for (let k in chat_ids) {
        ids.push(chat_ids[k].dataValues.chat_id);
    }
    let result = await CountCallDetail.findAll({
        where: {
            callAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            chat_id: {
                [Sequelize.Op.notIn]: ids
            }
        },
        order: [
            ['callAt', 'DESC']
        ]
    });
    let datas = [
        ['呼叫者电话', '呼叫者姓名', '被呼叫者电话', '挂断原因', '呼叫时间']
    ];
    for (let index in result) {
        let data = [result[index].caller_tel, result[index].caller_name, result[index].callee_tel, result[index].hangup_reason, result[index].callAt];
        datas.push(data);
    }

    let buffer = xlsx.build([{
        name: 'sheet1',
        data: datas
    }]);

    fs.writeFileSync('public/uploads/answerfaildetail' + dd + '.xlsx', buffer, { 'flag': 'w' }); //生成excel
    ctx.response.body = {
        code: 200,
        data: 'uploads/answerfaildetail' + dd + '.xlsx'
    };

});

// router.get('/customer', async(ctx, next) => {
//     let result = await new Promise((resolve, reject) => {
//         con.query('select * from users where role=8', [], function(err, re) {
//             console.log(err);
//             console.log(re);
//             resolve(re);
//         });
//     });
//     let datas = [
//         ['用户id', '电话', '姓名', '性别', '角色', '生日', '地址', '视力']
//     ];
//     for (let index in result) {
//         let data = [result[index].id, result[index].tel, result[index].name, result[index].gender, result[index].role, result[index].birthday, result[index].address, result[index].eyesight];
//         datas.push(data);
//     }

//     let buffer = xlsx.build([{
//         name: 'sheet1',
//         data: datas
//     }]);

//     fs.writeFileSync('public/uploads/customer.xlsx', buffer, { 'flag': 'w' }); //生成excel
//     ctx.response.body = {
//         code: 200,
//         data: 'uploads/customer.xlsx'
//     };

// });

router.get('/getCountSignal', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let result = [];
    if (typeof(key) != 'undefined') {
        key1 = key[0];
        key2 = key[1];
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
    }
    let total = await CountSignal.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        }
    });
    let rows = await CountSignal.findAll({
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['call_time', 'DESC']
        ]
    });
    for (let index in rows) {
        if (rows[index].call_type == 0) {
            rows[index].call_type = '全部';
        }
        if (rows[index].call_type == 1) {
            rows[index].call_type = '亲友';
        }
        if (rows[index].call_type == 2) {
            rows[index].call_type = '志愿者';
        }
        if (rows[index].call_type == 3) {
            rows[index].call_type = '客服';
        }
        if (rows[index].dataValues.arrived_time > 0) {
            rows[index].dataValues.call_arrived = rows[index].dataValues.arrived_time - rows[index].dataValues.call_time;
        } else {
            rows[index].dataValues.call_arrived = 0;
        }
        if (rows[index].dataValues.answer_time > 0) {
            rows[index].dataValues.call_answer = rows[index].dataValues.answer_time - rows[index].dataValues.call_time;
        } else {
            rows[index].dataValues.call_answer = 0;
        }
        if (rows[index].dataValues.hangup_time > 0) {
            rows[index].dataValues.call_hangup = rows[index].dataValues.hangup_time - rows[index].dataValues.call_time;
        } else {
            rows[index].dataValues.call_hangup = 0;
        }
    }
    ctx.response.body = { records: rows, total: total.length };
});

router.get('/countCallFailDetail', async(ctx, next) => {
    let page = parseInt(ctx.query.pageNo);
    let pagenum = parseInt(ctx.query.pageSize);
    let key = ctx.query['key[]'];
    let result = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    let total = await Sequelize.query('select count_calldetail.*,count_signal.chat_id as cid from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.callAt > ? and count_calldetail.callAt < ?', {
        replacements: [key1, key2]
    });
    let re = await Sequelize.query('select count_calldetail.*,count_signal.chat_id as cid from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.callAt > ? and count_calldetail.callAt < ?  order by callAt DESC limit ?,?', {
        replacements: [key1, key2, (page - 1) * pagenum, pagenum]
    });

    ctx.response.body = { records: re[0], total: total[0].length };
});

router.get('/countCallFailReason', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let userType = ctx.query.userType; //是否去除测试用户数据
    let searchReason = ctx.query.searchReason; // 需要去除的原因
    let result = [];
    let allCount = 0;
    let searchReasonArray = [];
    let chatIdArray = [];
    let userArray = [];
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    if (userType == 'true') {
        userArray = [0, 1];
    } else {
        userArray = [0];
    }
    if (typeof(searchReason) != 'undefined') {
        searchReasonArray = searchReason.split(';');
    }
    let callnum = await CountCallDetail.count({
        where: {
            'hangup_reason': {
                [Sequelize.Op.notIn]: searchReasonArray
            },
            'test': {
                [Sequelize.Op.or]: userArray
            },
            'createdAt': {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        },
    });
    //呼通的chat_id
    let chatIds = await CountSignal.findAll({
        attributes: ['chat_id'],
        where: {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
        },
        raw: true,
    });
    for (let i in chatIds) {
        chatIdArray.push(chatIds[i].chat_id);
    }
    let re = await CountCallDetail.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'callFailNum'], 'hangup_reason'
        ],
        where: {
            'createdAt': {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            },
            'chat_id': {
                [Sequelize.Op.notIn]: chatIdArray
            },
            'hangup_reason': {
                [Sequelize.Op.notIn]: searchReasonArray
            },
            'test': {
                [Sequelize.Op.or]: userArray
            },
        },
        raw: true,
        group: 'hangup_reason',
        order: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']
        ]
    });
    for (let index in re) {
        allCount += re[index].callFailNum;
    }
    if (allCount > 0) {
        for (let k in re) {
            re[k].proportion = Math.round(parseFloat(re[k].callFailNum) / parseFloat(allCount) * 10000) / 100.00 + "%";
            re[k].proportion2 = Math.round(parseFloat(re[k].callFailNum) / parseFloat(callnum) * 10000) / 100.00 + "%";
            let temp = await CountCallDetail.count({
                col: 'caller_id',
                where: {
                    'createdAt': {
                        [Sequelize.Op.gt]: key1,
                        [Sequelize.Op.lt]: key2
                    },
                    'chat_id': {
                        [Sequelize.Op.notIn]: chatIdArray
                    },
                    'test': {
                        [Sequelize.Op.or]: userArray
                    },
                    'hangup_reason': re[k].hangup_reason
                },
                distinct: true,
                raw: true
            });
            re[k].usernum = temp;
        }
    }
    ctx.response.body = { records: re };
});

router.get('/callFailReasonDetail', async(ctx, next) => {
    let page = parseInt(ctx.query.pageNo);
    let pagenum = parseInt(ctx.query.pageSize);
    // let key = ctx.query['key[]'];
    let key1 = ctx.query.key1;
    let key2 = ctx.query.key2;
    let reason = ctx.query.reason;
    if (typeof(key1) != 'undefined' && typeof(key2) != 'undefined') {
        key1 = moment(key1).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key2).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    let re = await Sequelize.query('select count_calldetail.* from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is null and count_calldetail.createdAt > ? and count_calldetail.createdAt < ? and count_calldetail.hangup_reason=? order by callAt desc limit ?,?', {
        replacements: [key1, key2, reason, (page - 1) * pagenum, pagenum]
    });
    for (let index in re[0]) {
        re[0][index].createdAt = moment(re[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].callAt = moment(re[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].call_time = moment(re[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].hangup_time = moment(re[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
    }
    ctx.response.body = { records: re[0] };
});

router.get('/answerFailReasonDetail', async(ctx, next) => {
    let page = parseInt(ctx.query.pageNo);
    let pagenum = parseInt(ctx.query.pageSize);
    // let key = ctx.query['key[]'];
    let key1 = ctx.query.key1;
    let key2 = ctx.query.key2;
    let reason = ctx.query.reason;
    if (typeof(key1) != 'undefined' && typeof(key2) != 'undefined') {
        key1 = moment(key1).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key2).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }
    let re = await Sequelize.query('select count_calldetail.* from count_calldetail left join count_signal on count_calldetail.chat_id = count_signal.chat_id where count_signal.chat_id is not null and count_calldetail.chat_id not in(select chat_id from count_answerdetail) and count_calldetail.createdAt > ? and count_calldetail.createdAt < ? and count_calldetail.hangup_reason=? order by callAt desc limit ?,?', {
        replacements: [key1, key2, reason, (page - 1) * pagenum, pagenum]
    });
    for (let index in re[0]) {
        re[0][index].createdAt = moment(re[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].callAt = moment(re[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].call_time = moment(re[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
        re[0][index].hangup_time = moment(re[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
    }
    ctx.response.body = { records: re[0] };
});

router.get('/chatFailReasonDetail', async(ctx, next) => {
    let page = parseInt(ctx.query.pageNo);
    let pagenum = parseInt(ctx.query.pageSize);
    let key = ctx.query.date;
    let audioa = ctx.query.audioa;
    let videoa = ctx.query.videoa;
    let audiob = ctx.query.audiob;
    let videob = ctx.query.videob;
    if (typeof(key) != 'undefined') {
        key1 = moment(key).format('YYYY-MM-DD 00:00:00');
        key2 = moment(key).add(1, 'days').format('YYYY-MM-DD 00:00:00');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    if (parseInt(audioa) > 0) {
        var re1 = await Sequelize.query('select count_chatdetail.chat_id ,count_chatdetail.caller_tel,count_chatdetail.caller_name,count_calldetail.callee_tel,count_calldetail.hangup_reason,count_calldetail.callAt,count_calldetail.user_agent,count_calldetail.call_time,count_calldetail.hangup_time from count_chatdetail left join count_calldetail on count_chatdetail.chat_id=count_calldetail.chat_id where count_chatdetail.first_audioa = 0 and count_calldetail.callAt > ? and count_calldetail.callAt < ?', {
            replacements: [key1, key2]
        });
        for (let index in re1[0]) {
            re1[0][index].createdAt = moment(re1[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
            re1[0][index].callAt = moment(re1[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
            re1[0][index].call_time = moment(re1[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
            re1[0][index].hangup_time = moment(re1[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re1[0][index].type = "亲友端音频问题";
        }
    } else {
        var re1 = [
            []
        ];
    }
    if (parseInt(videoa) > 0) {
        var re2 = await Sequelize.query('select count_chatdetail.chat_id ,count_chatdetail.caller_tel,count_chatdetail.caller_name,count_calldetail.callee_tel,count_calldetail.hangup_reason,count_calldetail.callAt,count_calldetail.user_agent,count_calldetail.call_time,count_calldetail.hangup_time from count_chatdetail left join count_calldetail on count_chatdetail.chat_id=count_calldetail.chat_id where count_chatdetail.first_videoa = 0 and count_calldetail.callAt > ? and count_calldetail.callAt < ?', {
            replacements: [key1, key2]
        });
        for (let index in re2[0]) {
            re2[0][index].createdAt = moment(re2[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
            re2[0][index].callAt = moment(re2[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
            re2[0][index].call_time = moment(re2[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
            re2[0][index].hangup_time = moment(re2[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re2[0][index].type = "亲友端视频问题";
        }
    } else {
        var re2 = [
            []
        ];
    }
    if (parseInt(audiob) > 0) {
        var re3 = await Sequelize.query('select count_chatdetail.chat_id ,count_chatdetail.caller_tel,count_chatdetail.caller_name,count_calldetail.callee_tel,count_calldetail.hangup_reason,count_calldetail.callAt,count_calldetail.user_agent,count_calldetail.call_time,count_calldetail.hangup_time from count_chatdetail left join count_calldetail on count_chatdetail.chat_id=count_calldetail.chat_id where count_chatdetail.first_audiob = 0 and count_calldetail.callAt > ? and count_calldetail.callAt < ?', {
            replacements: [key1, key2]
        });
        for (let index in re3[0]) {
            re3[0][index].createdAt = moment(re3[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
            re3[0][index].callAt = moment(re3[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
            re3[0][index].call_time = moment(re3[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
            re3[0][index].hangup_time = moment(re3[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re3[0][index].type = "盲人端音频问题";
        }
    } else {
        var re3 = [
            []
        ];
    }
    if (parseInt(videob) > 0) {
        var re4 = await Sequelize.query('select count_chatdetail.chat_id ,count_chatdetail.caller_tel,count_chatdetail.caller_name,count_calldetail.callee_tel,count_calldetail.hangup_reason,count_calldetail.callAt,count_calldetail.user_agent,count_calldetail.call_time,count_calldetail.hangup_time from count_chatdetail left join count_calldetail on count_chatdetail.chat_id=count_calldetail.chat_id where count_chatdetail.first_videob = 0 and count_calldetail.callAt > ? and count_calldetail.callAt < ?', {
            replacements: [key1, key2]
        });
        for (let index in re4[0]) {
            re4[0][index].createdAt = moment(re4[0][index].createdAt).format('YYYY-MM-DD HH:mm:ss');
            re4[0][index].callAt = moment(re4[0][index].callAt).format('YYYY-MM-DD HH:mm:ss');
            re4[0][index].call_time = moment(re4[0][index].call_time).format('YYYY-MM-DD HH:mm:ss');
            re4[0][index].hangup_time = moment(re4[0][index].hangup_time).format('YYYY-MM-DD HH:mm:ss');
            re4[0][index].type = "盲人端视频问题";
        }
    } else {
        var re4 = [
            []
        ];
    }
    let result = [];
    result = re1[0].concat(re2[0], re3[0], re4[0]);
    ctx.response.body = { records: result };
});
router.get('/callFailTimeDura', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let rh0 = 0,
        rh1 = 0,
        rh2 = 0,
        rh3 = 0,
        rh4 = 0,
        rh5 = 0,
        rh6 = 0;
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    let re = await Sequelize.query('select (hangup_time-call_time)/1000 as durah from count_calldetail where chat_id not in (select chat_id from count_signal) and callAt > ? and callAt < ? order by callAt desc', {
        replacements: [key1, key2]
    });
    for (let index in re[0]) {
        //挂断时间范围分布,(0,10],(10,20],(20,30],(30,40],(40,50],(50,60],>60
        if (0 < re[0][index].durah && re[0][index].durah <= 10) {
            rh0 += 1;
        }
        if (10 < re[0][index].durah && re[0][index].durah <= 20) {
            rh1 += 1;
        }
        if (20 < re[0][index].durah && re[0][index].durah <= 30) {
            rh2 += 1;
        }
        if (30 < re[0][index].durah && re[0][index].durah <= 40) {
            rh3 += 1;
        }
        if (40 < re[0][index].durah && re[0][index].durah <= 50) {
            rh4 += 1;
        }
        if (50 < re[0][index].durah && re[0][index].durah <= 60) {
            rh5 += 1;
        }
        if (re[0][index].durah > 60) {
            rh6 += 1;
        }

    }
    ctx.response.body = { durah: [rh0, rh1, rh2, rh3, rh4, rh5, rh6] };
});

/**
 * 用户主动挂断时间统计 
 */
router.get('/callFailBySelfTimeDura', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let rh0 = 0,
        rh1 = 0,
        rh2 = 0,
        rh3 = 0,
        rh4 = 0,
        rh5 = 0,
        rh6 = 0;
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    let re = await Sequelize.query("select (hangup_time-call_time)/1000 as durah from count_calldetail where chat_id not in (select chat_id from count_signal) and (hangup_reason='眼镜主动挂断' or hangup_reason='主动挂断') and callAt > ? and callAt < ? order by callAt desc", {
        replacements: [key1, key2]
    });
    for (let index in re[0]) {
        //挂断时间范围分布,(0,10],(10,20],(20,30],(30,40],(40,50],(50,60],>60
        if (0 < re[0][index].durah && re[0][index].durah <= 10) {
            rh0 += 1;
        }
        if (10 < re[0][index].durah && re[0][index].durah <= 20) {
            rh1 += 1;
        }
        if (20 < re[0][index].durah && re[0][index].durah <= 30) {
            rh2 += 1;
        }
        if (30 < re[0][index].durah && re[0][index].durah <= 40) {
            rh3 += 1;
        }
        if (40 < re[0][index].durah && re[0][index].durah <= 50) {
            rh4 += 1;
        }
        if (50 < re[0][index].durah && re[0][index].durah <= 60) {
            rh5 += 1;
        }
        if (re[0][index].durah > 60) {
            rh6 += 1;
        }

    }
    ctx.response.body = { durah: [rh0, rh1, rh2, rh3, rh4, rh5, rh6] };
});
router.get('/answerFailTimeDura', async(ctx, next) => {
    let key = ctx.query['key[]'];
    let ra0 = 0,
        ra1 = 0,
        ra2 = 0,
        ra3 = 0,
        ra4 = 0,
        ra5 = 0,
        ra6 = 0;
    let rs0 = 0,
        rs1 = 0,
        rs2 = 0,
        rs3 = 0,
        rs4 = 0,
        rs5 = 0,
        rs6 = 0;
    let rh0 = 0,
        rh1 = 0,
        rh2 = 0,
        rh3 = 0,
        rh4 = 0,
        rh5 = 0,
        rh6 = 0;
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now() - 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
    }
    let re = await Sequelize.query('select chat_id,(arrived_time-call_time)/1000 as duraa,(showed_time-call_time)/1000 as duras,(hangup_time-call_time)/1000 as durah from count_signal where chat_id not in (select chat_id from count_answerdetail) and callAt > ? and callAt < ? order by callAt desc;', {
        replacements: [key1, key2]
    });
    for (let index in re[0]) {
        //到达信令服务器时间范围分布,<=0,(0,1],(1,2],(2,3],(3,4],(4,5],>5
        if (re[0][index].duraa <= 0) {
            ra0 += 1;
        }
        if (0 < re[0][index].duraa && re[0][index].duraa <= 1) {
            ra1 += 1;
        }
        if (1 < re[0][index].duraa && re[0][index].duraa <= 2) {
            ra2 += 1;
        }
        if (2 < re[0][index].duraa && re[0][index].duraa <= 3) {
            ra3 += 1;
        }
        if (3 < re[0][index].duraa && re[0][index].duraa <= 4) {
            ra4 += 1;
        }
        if (4 < re[0][index].duraa && re[0][index].duraa <= 5) {
            ra5 += 1;
        }
        if (re[0][index].duraa > 5) {
            ra6 += 1;
        }
        //到达响铃时间范围分布,<=0,(0,1],(1,2],(2,3],(3,4],(4,5],>5
        if (re[0][index].duras <= 0) {
            rs0 += 1;
        }
        if (0 < re[0][index].duras && re[0][index].duras <= 1) {
            rs1 += 1;
        }
        if (1 < re[0][index].duras && re[0][index].duras <= 2) {
            rs2 += 1;
        }
        if (2 < re[0][index].duras && re[0][index].duras <= 3) {
            rs3 += 1;
        }
        if (3 < re[0][index].duras && re[0][index].duras <= 4) {
            rs4 += 1;
        }
        if (4 < re[0][index].duras && re[0][index].duras <= 5) {
            rs5 += 1;
        }
        if (re[0][index].duras > 5) {
            rs6 += 1;
        }

        //挂断时间范围分布,(0,10],(10,20],(20,30],(30,40],(40,50],(50,60],>60
        if (0 < re[0][index].durah && re[0][index].durah <= 10) {
            rh0 += 1;
        }
        if (10 < re[0][index].durah && re[0][index].durah <= 20) {
            rh1 += 1;
        }
        if (20 < re[0][index].durah && re[0][index].durah <= 30) {
            rh2 += 1;
        }
        if (30 < re[0][index].durah && re[0][index].durah <= 40) {
            rh3 += 1;
        }
        if (40 < re[0][index].durah && re[0][index].durah <= 50) {
            rh4 += 1;
        }
        if (50 < re[0][index].durah && re[0][index].durah <= 60) {
            rh5 += 1;
        }
        if (re[0][index].durah > 60) {
            rh6 += 1;
        }

    }
    ctx.response.body = { duraa: [ra0, ra1, ra3, ra4, ra5, ra6], duras: [rs0, rs1, rs2, rs3, rs4, rs5, rs6], durah: [rh0, rh1, rh2, rh3, rh4, rh5, rh6] };
});

/**
 * 用户活跃度 
 * */
router.get('/userActivity', async(ctx, next) => {
    let key = ctx.query.key;
    let key1 = '';
    let key2 = '';
    let userType = ctx.query.userType;
    let $where = {};
    console.log(typeof(key));
    if (typeof(key) != 'undefined' && key != "") {
        key1 = moment(key).format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    } else {
        console.log(Date.now());
        key1 = moment(Date.now()).format('YYYY-MM-DD');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD');
    }
    if (userType == "true" || userType == true) {
        //全部用户
        $where = {
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        };
        var re1 = await Sequelize.query('select count(distinct caller_id) as callUserNum from count_calldetail where createdAt > ? and createdAt< ?', {
            replacements: [key1, key2],
            raw: true
        });
        var re2 = await Sequelize.query('select count(distinct caller_id) as callSuccessUserNum from count_calldetail where chat_id in (select chat_id from count_signal) and createdAt>? and createdAt<? ', {
            replacements: [key1, key2],
            raw: true
        });
        var re3 = await Sequelize.query('select count(distinct count_calldetail.caller_id) as chatUserNum from count_calldetail,count_chatdetail where count_calldetail.chat_id=count_chatdetail.chat_id and count_calldetail.createdAt>? and count_calldetail.createdAt<?', {
            replacements: [key1, key2],
            raw: true
        });
        var re4 = await Sequelize.query('select count(distinct count_calldetail.caller_id) as chatSuccessUserNum from count_calldetail,count_chatdetail where count_calldetail.chat_id=count_chatdetail.chat_id and count_calldetail.createdAt>? and count_calldetail.createdAt<? and count_chatdetail.first_audioa !=0 and count_chatdetail.first_audiob !=0 and count_chatdetail.first_videob!=0', {
            replacements: [key1, key2],
            raw: true
        });
    } else {
        //真实用户
        $where = {
            test: 0,
            createdAt: {
                [Sequelize.Op.gt]: key1,
                [Sequelize.Op.lt]: key2
            }
        };
        var re1 = await Sequelize.query('select count(distinct caller_id) as callUserNum from count_calldetail where createdAt > ? and createdAt< ? and test=0', {
            replacements: [key1, key2],
            raw: true
        });
        var re2 = await Sequelize.query('select count(distinct caller_id) as callSuccessUserNum from count_calldetail where chat_id in (select chat_id from count_signal) and createdAt>? and createdAt<? and test=0', {
            replacements: [key1, key2],
            raw: true
        });
        var re3 = await Sequelize.query('select count(distinct count_calldetail.caller_id) as chatUserNum from count_calldetail,count_chatdetail where count_calldetail.chat_id=count_chatdetail.chat_id and count_calldetail.createdAt>? and count_calldetail.createdAt<? and count_calldetail.test=0', {
            replacements: [key1, key2],
            raw: true
        });
        var re4 = await Sequelize.query('select count(distinct count_calldetail.caller_id) as chatSuccessUserNum from count_calldetail,count_chatdetail where count_calldetail.chat_id=count_chatdetail.chat_id and count_calldetail.createdAt>? and count_calldetail.createdAt<? and count_calldetail.test=0 and count_chatdetail.first_audioa !=0 and count_chatdetail.first_audiob !=0 and count_chatdetail.first_videob!=0', {
            replacements: [key1, key2],
            raw: true
        });
    }
    //用户与呼叫次数
    let callUser = await CountCallDetail.findAll({
        attributes: ['caller_id', 'caller_tel', 'caller_name', [Sequelize.fn('COUNT', Sequelize.col('*')), 'callnum']],
        where: $where,
        group: ['caller_id', 'caller_tel', 'caller_name'],
        order: [
            [Sequelize.fn('COUNT', Sequelize.col('*')), 'DESC']
        ],
        raw: true,
    });

    for (let index in callUser) {
        //用户与呼叫失败数
        let chatIds = await CountSignal.findAll({
            attributes: ['chat_id'],
            where: {
                caller_uid: callUser[index].caller_id,
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            }
        });
        let chatIdArray = [];
        for (let k in chatIds) {
            chatIdArray.push(chatIds[k].chat_id);
        }

        let callFailNum = await CountCallDetail.count({
            where: {
                caller_id: callUser[index].caller_id,
                chat_id: {
                    [Sequelize.Op.notIn]: chatIdArray
                },
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            },
        });
        callUser[index].callfailnum = callFailNum;
        //用户与未接通数
        let chatIds2 = await CountChatDetail.findAll({
            attributes: ['chat_id'],
            where: {
                caller_uid: callUser[index].caller_id,
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            }
        });
        let chatIdArray2 = [];
        for (let k in chatIds2) {
            chatIdArray2.push(chatIds2[k].chat_id);
        }

        let chatFailNum = await CountCallDetail.count({
            where: {
                caller_id: callUser[index].caller_id,
                chat_id: {
                    [Sequelize.Op.notIn]: chatIdArray2
                },
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            },
        });
        //用户与接通数
        let chatNum =


            await CountChatDetail.count({
                where: {
                    caller_uid: callUser[index].caller_id,
                    createdAt: {
                        [Sequelize.Op.gt]: key1,
                        [Sequelize.Op.lt]: key2
                    }
                },
            });
        callUser[index].chatnum = chatNum;
        //用户与重复数
        let callTimes = await CountCallDetail.findAll({
            attributes: ['call_time'],
            where: {
                caller_id: callUser[index].caller_id,
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            },
            order: [
                ['call_time', 'DESC']
            ],
            raw: true,
        });
        let n = callTimes.length;
        let recallnum = 0;
        for (let i = 0; i < n; i++) {
            for (let y = 1; y < n + 1; y++) {
                if (callTimes[y].call_time - callTimes[i].call_time <= 30000) {
                    recallnum++
                }
            }
        }
        callUser[index].recallnum = recallnum;
        //用户与总时长
        let duration = await CountChatDetail.findAll({
            attributes: [
                [sequelize.fn('sum', sequelize.col('duration')), 'totalduration']
            ],
            where: {
                caller_id: callUser[index].caller_id,
                createdAt: {
                    [Sequelize.Op.gt]: key1,
                    [Sequelize.Op.lt]: key2
                }
            },
        });
        callUser[index].totalduration = duration.totalduration;
        //用户与平钧时长
        // callUser[index] =
        //用户与接通率

    }

    ctx.response.body = { callUser: callUser, callUserNum: re1[0], callSuccessUserNum: re2[0], chatUserNum: re3[0], chatSuccessUserNum: re4[0] };
});

/**
 * 接听明细
 */
router.get('/countAnswerDetail', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let key1 = '';
    let key2 = '';
    let userType = ctx.query.userType;
    let $where = {};
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }

    if (userType == 'true' || userType == true) {
        $where = {
            test: {
                [Sequelize.Op.in]: [0, 1]
            }
        };
    } else {
        $where = {
            test: {
                [Sequelize.Op.in]: [0]
            }
        };
    }
    CountAnswerDetail.hasOne(CountCallDetail, { foreignKey: 'chat_id' })
    let users = await CountAnswerDetail.findAll({
        include: [{
            model: CountCallDetail,
            attributes: [
                ['caller_name', 'caller_name'],
                ['callee_tel', 'callee_tel'],
                ['hangup_reason', 'hangup_reason'],
                ['call_time', 'call_time'],
                ['hangup_time', 'hanup_time']
            ],
            where: $where
        }],
        where: {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        },
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['callAt', 'DESC']
        ],
        raw: true
    });
    for (let index in users) {
        users[index].createdAt = moment(users[index].createdAt).format('YYYY-MM-DD HH:mm:ss');
        users[index].call_time = moment(users[index]['CountCallDetail.call_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].hangup_time = moment(users[index]['CountCallDetail.hanup_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].answer_time = moment(users[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
        users[index].callee_tel = users[index]['CountCallDetail.callee_tel'];
        users[index].caller_name = users[index]['CountCallDetail.caller_name'];
        users[index].hangup_reason = users[index]['CountCallDetail.hangup_reason'];

    }
    ctx.response.body = { records: users };
});

router.get('/countChatFailDetail', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let key = ctx.query['key[]'];
    let key1 = '';
    let key2 = '';
    let chatIdArray = [];
    let userType = ctx.query.userType;
    let $where = {};
    if (typeof(key) != 'undefined') {
        key1 = moment(key[0]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
        key2 = moment(key[1]).add(8, 'h').utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        key1 = moment(Date.now()).format('YYYY-MM-DD 00:00:00');
        key2 = moment(Date.now() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00');
    }

    if (userType == "true" || userType == true) {
        //全部用户
        $where = {
            test: {
                [Sequelize.Op.in]: [0, 1]
            }
        };
    } else {
        //全部用户
        $where = {
            test: {
                [Sequelize.Op.in]: [0]
            }
        };
    }
    let chatIds = await CountChatDetail.findAll({
        attributes: ['chat_id'],
        where: {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            }
        }
    });
    for (let k in chatIds) {
        chatIdArray.push(chatIds[k].chat_id);
    }
    CountAnswerDetail.hasOne(CountCallDetail, { foreignKey: 'chat_id' });
    let users = await CountAnswerDetail.findAll({
        include: [{
            model: CountCallDetail,
            attributes: [
                ['caller_name', 'caller_name'],
                ['callee_tel', 'callee_tel'],
                ['hangup_reason', 'hangup_reason'],
                ['call_time', 'call_time'],
                ['hangup_time', 'hanup_time']
            ],
            where: $where,
            required: false
        }],
        where: {
            createdAt: {
                [Sequelize.Op.between]: [key1, key2]
            },
            chat_id: {
                [Sequelize.Op.notIn]: chatIdArray
            }
        },
        offset: (parseInt(page) - 1) * parseInt(pagenum),
        limit: parseInt(pagenum),
        order: [
            ['callAt', 'DESC']
        ],
        raw: true
    });
    for (let index in users) {
        users[index].createdAt = moment(users[index].createdAt).format('YYYY-MM-DD HH:mm:ss');
        users[index].call_time = moment(users[index]['CountCallDetail.call_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].hangup_time = moment(users[index]['CountCallDetail.hanup_time']).format('YYYY-MM-DD HH:mm:ss');
        users[index].answer_time = moment(users[index].answer_time).format('YYYY-MM-DD HH:mm:ss');
        users[index].callee_tel = users[index]['CountCallDetail.callee_tel'];
        users[index].caller_name = users[index]['CountCallDetail.caller_name'];
        users[index].hangup_reason = users[index]['CountCallDetail.hangup_reason'];

    }
    ctx.response.body = { records: users };
});
module.exports = router;
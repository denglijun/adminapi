'use strict';
module.exports = (sequelize, DataTypes) => {
    const CountCallDetail = sequelize.define('CountCallDetail', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '记录投递者id'
        },
        chat_id: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "接通id",
        },
        call_from: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '呼叫方式： 0未知; 1眼境;2手机按钮'
        },
        caller_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '呼叫者id'
        },

        caller_tel: {
            type: DataTypes.STRING(16),
            allowNull: false,
            comment: "呼叫者电话",
        },
        caller_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "呼叫者名字",
        },
        callee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '被呼叫者id'
        },
        callee_tel: {
            type: DataTypes.STRING(16),
            allowNull: false,
            comment: "被呼叫者电话",
        },
        hangup_reason: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "挂断原因",
        },
        call_time: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            comment: "呼叫时间",
        },
        answer_time: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            comment: '接听时间',
        },
        first_vframe_time: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            comment: '第一视频帧解析成功的时间戳',
        },
        hangup_time: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            comment: "挂断电话",
        },
        //计费时长
        duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        //费用
        fee: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        service_type: {
            type: DataTypes.INTEGER,
            defaultValue: 1, //1呼叫对象为亲友, 2:呼叫对象为志愿者, 3:呼叫对象为志愿者
        },
        user_agent: {
            type: DataTypes.STRING(64),
            defaultValue: "",
        },
        //1为测试用户数据
        test: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        callAt: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "呼叫日期",
        }
    }, {
        tableName: 'count_calldetail',
        comment: 'APP端呼叫明细表',
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });
    return CountCallDetail;
};
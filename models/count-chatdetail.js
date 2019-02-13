'use strict';
module.exports = (sequelize, DataTypes) => {
    const CountChatDetail = sequelize.define('CountChatDetail', {
        chat_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        caller_uid: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        caller_tel: {
            type: DataTypes.STRING(16),
            allowNull: false,
            comment: "呼叫者电话"
        },
        caller_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "呼叫者名字",
        },
        callee_uid: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        start_time: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '开始时间'
        },
        end_time: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '结束时间',
        },
        duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '计费时长'
        },
        duration2: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        first_audioa: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        first_videoa: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        quality_a: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        first_audiob: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        first_videob: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        quality_b: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        ua: {
            type: DataTypes.STRING(64),
            defaultValue: "",
        },
        ub: {
            type: DataTypes.STRING(64),
            defaultValue: "",
        },
        flowa: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '亲友端消费的流量数,单位字节'
        },
        flowb: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '盲人端消费的流量数,单位字节'
        },
        callAt: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "呼叫日期",
        }
    }, {
        tableName: 'count_chatdetail',
        comment: 'APP端接通明细表',
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });

    return CountChatDetail;
};
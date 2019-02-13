'use strict';
module.exports = (sequelize, DataTypes) => {
    const CountAnswerDetail = sequelize.define('CountAnswerDetail', {
        chat_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        caller_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "呼叫者id"
        },
        caller_tel: {
            type: DataTypes.STRING(16),
            allowNull: false,
            comment: "呼叫者电话"
        },
        callee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "被呼叫者id"
        },
        service_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "服务类型"
        },
        answer_time: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            comment: "接听时间",
        },
        callAt: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "呼叫日期",
        }
    }, {
        tableName: 'count_answerdetail',
        comment: 'APP端接听明细表',
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });

    return CountAnswerDetail;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
    const CountCallanswerchat = sequelize.define('CountCallanswerchat', {
        callnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫次数",
        },
        callfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫失败次数"
        },
        callsuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫成功次数",
        },
        answersuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "接听成功次数",
        },
        answerfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "接听成功次数",
        },
        chatsuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "接通成功次数"
        },
        chatfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "接通失败次数"
        },
        callfriendnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫亲友的次数",
        },
        callvolunteernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫志愿者的次数",
        },
        callcustomernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫客服的次数",
        },
        usernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫的用户数",
        },
        auviyes: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "音视频正常"
        },
        auvino: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "音视频异常"
        },
        duration: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "总共通话时长"
        },
        tcallnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫次数",
        },
        tcallfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫失败次数"
        },
        tcallsuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫成功次数",
        },
        tanswersuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实接听成功次数",
        },
        tanswerfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实接听成功次数",
        },
        tchatsuccessnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实接通成功次数"
        },
        tchatfailnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实接通失败次数"
        },
        tcallfriendnum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫亲友的次数",
        },
        tcallvolunteernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫志愿者的次数",
        },
        tcallcustomernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "呼叫客服的次数",
        },
        tusernum: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实呼叫的用户数",
        },
        tauviyes: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实音视频正常"
        },
        tauvino: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实音视频异常"
        },
        tduration: {
            type: DataTypes.INTEGER,
            defaultValues: 0,
            comment: "真实总共通话时长"
        },
    }, {
        tableName: 'count_callanswerchat',
        comment: 'APP端用户呼叫接听接通统计表',
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });
    return CountCallanswerchat;
};
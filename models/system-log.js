'use strict';
module.exports = (sequelize, DataTypes) => {
    const SystemLog = sequelize.define('SystemLog', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "操作者id",
        },
        ip: {
            type: DataTypes.STRING(30),
            allowNull: false,
            comment: "登录ip",
        },
        type: {
            type: DataTypes.STRING(30),
            allowNull: false,
            comment: "操作类型"
        },
        operation: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '操作内容'
        },
        changeJson: {
            type: DataTypes.STRING(225),
            default: '',
            comment: '操作影响的表与id'
        },
        remark: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '备注'
        }
    }, {
        tableName: 'system-log',
        comment: '系统操作日志表',
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });
    // User.sync({force:true}).then(() => console.log('User同步数据库模型成功...'));

    return SystemLog;
};
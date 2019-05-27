const SystemLog = require('../models').SystemLog;

let saveLog = async function(user_id, ip, type, operation, remark, changeJson) {
    let re = await SystemLog.create({ user_id: user_id, ip: ip, type: type, operation: operation, remark: remark, changeJson: changeJson });
    if (re.dataValues) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    saveLog
}
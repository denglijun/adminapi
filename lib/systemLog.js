const SystemLog = require('../models').SystemLog;

let saveLog = async function(user_id, ip, type, operation, remark) {
    let re = await SystemLog.create({ user_id: user_id, ip: ip, type: type, operation: operation, remark: remark });
    if (re.dataValues) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    saveLog
}
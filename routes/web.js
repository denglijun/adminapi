const router = require('koa-router')();
const sequelize = require('../models').sequelize;
// const con = require('../webdb'); //服务器正式库
const con = require('../webdb2')(); //本地测试

const moment = require('moment');
const common = require('../lib/common.js');
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const xlsx = require('node-xlsx');
const send = require('koa-send');
const fs = require('fs');

router.prefix('/web');
/**
 * 设备购买人信息列表
 */
router.get('/buyerInfo', async(ctx, next) => {
    let page = ctx.query.pageNo;
    let pagenum = ctx.query.pageSize;
    let sql = "select * from buyinfo order by createdAt DESC limit ?,?";
    let re = await new Promise((resolve, reject) => {
        con.query(sql, [(parseInt(page) - 1) * parseInt(pagenum), parseInt(pagenum)], function(err, result) {
            if (err) {
                resolve({
                    code: 10004,
                    msg: '网络出错',
                    data: ''
                });
            } else {
                resolve(result);
            }
        });
    });
    for (let index in re) {
        if (re[index].is_deal == 0) {
            re[index].deal_text = "未处理";
        }
        if (re[index].is_deal == 1) {
            re[index].deal_text = "已联系";
        }
        if (re[index].is_deal == 2) {
            re[index].deal_text = "已发货";
        }
        if (re[index].is_deal == 3) {
            re[index].deal_text = "已退款";
        }
    }
    ctx.response.body = re;
});

/**
 * 更新购买人信息
 */
router.post('/updateBuyerInfo', async(ctx, next) => {

})

module.exports = router;
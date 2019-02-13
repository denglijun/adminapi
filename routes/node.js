'use strict';
const router = require('koa-router')();
const Node = require('../models').node;
const UserRole = require('../models').user_role;
const Role = require('../models').role;

const Sequelize = require('../models').sequelize;
const jwt = require('jsonwebtoken');
const secret = 'wenhuaiyunxiang';

router.prefix('/node');


router.post('/add', async(ctx, next) => {
    let params = ctx.request.body;
    let re = await Node.create({ nodename: params.nodename, pid: params.pid, sort: params.sort, isshow: params.isshow, link: params.link, type: params.type, icon: params.icon, mark: params.mark });
    if (re.dataValues) {
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: re.dataValues
        };

    } else {
        ctx.response.body = {
            code: 10002,
            msg: '操作失败',
            data: ''
        };
    }

});
router.get('/delete', async(ctx, next) => {
    let params = ctx.query.NodeIds;
    let re = await Node.destroy({
        where: {
            id: params
        }
    });
    if (re > 0) {
        ctx.response.body = {
            code: 200,
            msg: '操作成功',
            data: re
        };
    } else {
        ctx.response.body = {
            code: 10003,
            msg: '操作失败',
            data: re
        };
    }
});
router.post('/update', async(ctx, next) => {
    let params = ctx.request.body;
    let re = await Node.update({
        nodename: params.nodename,
        pid: params.pid,
        sort: params.sort,
        isshow: params.isshow,
        link: params.link,
        type: params.type,
        icon: params.icon,
        mark: params.mark
    }, {
        where: {
            id: params.id
        }
    });
    if (re.length > 0) {
        ctx.response.body = {
            code: 200,
            msg: '操作成功'
        };
    } else {
        ctx.response.body = {
            code: 10005,
            msg: '更新失败'
        };
    }
});
router.get('/resourceList', async(ctx, next) => {
    let result = [];
    let temp = [];
    let node = await Node.findAll({
        attributes: ['id', 'nodename', 'pid', 'isshow', 'link', 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'],
        where: {
            pid: 0
        }
    });
    for (let index in node) {
        let n = await Node.findAll({
            attributes: ['id', 'nodename', 'pid', 'isshow', 'link', 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'],
            where: {
                pid: node[index].id
            }
        });
        if (n.length > 0) {
            node[index].dataValues.children = n;
        }
        for (let i in n) {
            let nn = await Node.findAll({
                attributes: ['id', 'nodename', 'pid', 'isshow', 'link', 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'],
                where: {
                    pid: n[i].id
                }
            });
            if (nn.length > 0) {
                node[index].dataValues.children.children = nn;
            }
        }
    }

    ctx.response.body = node;
});
router.get('/menuList', async(ctx, next) => {
    // let token = ctx.headers.authorization.split(' ');
    // token = token[1];
    // let userInfo = jwt.decode(token, secret);
    let uid = ctx.query.userId;
    let rids = [];
    let nodes = [];
    let rid = await UserRole.findAll({
        attributes: ['rid'],
        where: {
            uid: uid
        }
    });
    for (let index in rid) {
        rids.push(rid[index].rid);
    }
    let nodeIds = await Role.findAll({
        where: {
            id: rids
        }

    });
    for (let i in nodeIds) {
        if (nodeIds[i].NIDS != null) {
            let temp = nodeIds[i].NIDS.split(',');
            for (let t in temp) {
                if (nodes.indexOf(temp[t]) == -1) {
                    nodes.push(temp[t]);
                }
            }
        }
    }

    let node = await Node.findAll({
        attributes: ['id', ['nodename', 'name'],
            ['pid', 'parentId'],
            ['isshow', 'isShow'],
            ['link', 'href'], 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'
        ],
        where: {
            pid: 0,
            type: 1,
            id: nodes
        },
        order: [
            ['sort', 'ASC']
        ]
    });
    for (let index in node) {
        let n = await Node.findAll({
            attributes: ['id', ['nodename', 'name'],
                ['pid', 'parentId'],
                ['isshow', 'isShow'],
                ['link', 'href'], 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'
            ],
            where: {
                pid: node[index].id,
                type: 1,
                id: nodes
            },
            order: [
                ['sort', 'ASC']
            ]
        });
        if (n.length > 0) {
            node[index].dataValues.children = n;
        }
        for (let i in n) {
            let nn = await Node.findAll({
                attributes: ['id', ['nodename', 'name'],
                    ['pid', 'parentId'],
                    ['isshow', 'isShow'],
                    ['link', 'href'], 'sort', 'type', 'icon', 'mark', 'createdAt', 'updatedAt'
                ],
                where: {
                    pid: n[i].id,
                    type: 1,
                    id: nodes
                },
                order: [
                    ['sort', 'ASC']
                ]
            });
            if (nn.length > 0) {
                node[index].dataValues.children.children = nn;
            }
        }
    }
    ctx.response.body = node;
});

module.exports = router;
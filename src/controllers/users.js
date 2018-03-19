const _ = require('lodash');
const jwt = require('jsonwebtoken')
const knex = require('knex')({
    client: 'mysql',
    connection: global.config.database
});
const SMSClient = require('@alicloud/sms-sdk');
const accessKeyId = global.config.aliyunAccessKeyId;
const secretAccessKey = global.config.aliyunSecretAccessKey;
let smsClient = new SMSClient({
    accessKeyId,
    secretAccessKey
});

module.exports = {
    sendVc: async (ctx, next) => {
        let request = JSON.parse(ctx.request.body);

        let code = Math.floor(Math.random() * 900000 + 99999).toString();
        let result = await smsClient.sendSMS({
            PhoneNumbers: request.phone,
            SignName: '岚川方圆',
            TemplateCode: 'SMS_127990048',
            TemplateParam: '{"code":' + code + '}'
        });

        if (result.Code == 'OK') {
            let vc = await knex('vc').where({
                phone: request.phone
            }).select('id');

            if (_.isEmpty(vc)) {
                await knex('vc').insert({
                    phone: request.phone,
                    vc: code,
                    created_date: new Date()
                });
            } else {
                await knex('vc')
                    .where({
                        id: vc[0].id
                    })
                    .update({
                        vc: code,
                        created_date: new Date()
                    });
            }
            ctx.body = {
                message: 'OK'
            };
        } else {
            throw Error('验证码发送失败');
        }
    },

    signinVc: async (ctx, next) => {
        let request = JSON.parse(ctx.request.body);

        const token = jwt.sign({
            phone: request.phone
        }, global.config.jwtSecret, {
            expiresIn: 36000
        })

        let vc = await knex('vc').where({
            phone: request.phone,
            vc: request.vc
        }).select('id');

        if (_.isEmpty(vc)) {
            throw Error('验证码错误');
        }

        ctx.body = {
            token: token
        };
    },

    signinPw: async (ctx, next) => {
        let request = JSON.parse(ctx.request.body);

        const token = jwt.sign({
            phone: request.phone
        }, global.config.jwtSecret, {
            expiresIn: 36000
        })

        let user = await knex('users').where({
            phone: request.phone
        }).select('id');

        if (_.isEmpty(user)) {
            throw Error('请先注册');
        } else {
            let user = await knex('users').where({
                phone: request.phone,
                password: request.password
            }).select('id');

            if (_.isEmpty(user)) {
                throw Error('密码错误');
            } 
        }

        ctx.body = {
            token: token
        };
    },

    signup: async (ctx, next) => {
        let request = JSON.parse(ctx.request.body);

        const token = jwt.sign({
            phone: request.phone
        }, global.config.jwtSecret, {
            expiresIn: 36000
        })

        let vc = await knex('vc').where({
            phone: request.phone,
            vc: request.vc
        }).select('id');

        if (_.isEmpty(vc)) {
            throw Error('验证码错误');
        }

        await knex('users').insert({
            created_date: new Date(),
            phone: request.phone,
            password: request.password
        });

        ctx.body = {
            token: token
        };
    },

    getProfile: async (ctx, next) => {
        let token = ctx.state.user;

        let user = await knex('users').where({
            phone: token.phone
        }).select('*');

        ctx.body = user[0];
    },

    updateProfile: async (ctx, next) => {
        let request = JSON.parse(ctx.request.body);

        await knex('users')
            .where({
                phone: request.phone
            })
            .update(_.omit(request, ['id']));

        let user = await knex('users').where({
            phone: request.phone
        }).select('*');

        ctx.body = user[0];


    },
};
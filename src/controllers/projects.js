const _ = require('lodash');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const knex = require('knex')({
    client: 'mysql',
    connection: global.config.database
});

module.exports = {
    createPayment: async (ctx, next) => {

        ctx.body = {};
    },

    getComodities: async (ctx, next) => {
        let newComodities = [];
        let comodities = await knex('comodities').where({state: 'ACTIVE'}).select('*');

        await Promise.map(comodities, async comodity => {
            let user = await knex('users').where({
                phone: comodity.owner
            }).select('*');

            comodity.owner = user[0].name;

            newComodities.push(comodity);
        });
        
        newComodities = _.sortBy(newComodities, ['id']);

        ctx.body = newComodities;
    },

    getProperties: async (ctx, next) => {
        let token = jwt.verify(ctx.header.authorization.split(' ')[1], global.config.jwtSecret);   

        let properties = await knex('comodities').where({
            owner: token.phone
        }).select('*');
        
        properties = _.sortBy(properties, ['id']);

        ctx.body = properties;
    },

    getComodity: async (ctx, next) => {
        let id = ctx.params.id;
        let comodity = await knex('comodities').where({
            id: id
        }).select('*');

        let user = await knex('users').where({
            phone: comodity[0].owner
        }).select('*');

        comodity[0].owner = user[0].name;

        ctx.body = comodity[0];
    },

    getLogs: async (ctx, next) => {
        let token = jwt.verify(ctx.header.authorization.split(' ')[1], global.config.jwtSecret);  
        let newLogs = [];

        let logs = await knex('logs').where({
            owner: token.phone
        }).select('*');
        await Promise.map(logs, async log => {
            let comodity = await knex('comodities').where({
                id: log.comodity_id
            }).select('*');

            newLogs.push({
                created_date: log.created_date,
                date: moment(log.created_date).format('YYYY-MM-DD HH:MM'),
                comodity: comodity[0].title,
                action: log.action,
                price: log.price + '元',
                description: log.description,
            });
        });
        newLogs = _.sortBy(newLogs, ['created_date']);

        ctx.body = newLogs;
    },

    trade: async (ctx, next) => {
        let token = jwt.verify(ctx.header.authorization.split(' ')[1], global.config.jwtSecret);  
        let request = JSON.parse(ctx.request.body);

        await knex('transactions').insert({
            created_date: new Date(),
            phone: token.phone,
            project_id: request.project_id,
            action: request.action,
            quantity: request.quantity,
            price: request.price,
        });

        ctx.body = {};
    }
};
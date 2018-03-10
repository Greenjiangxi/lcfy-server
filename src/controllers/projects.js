const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const knex = require('knex')({
    client: 'mysql',
    connection: global.config.database
});

module.exports = {
    getProjects: async (ctx, next) => {
        let projects = await knex('projects').select('*');
        let newProjects = [];

        await Promise.map(projects, async project => {
            let boughtQuantity = await knex('transactions').where({
                project_id: project.id
            }).sum('quantity as quantity');
            project.boughtQuantity = _.isNil(boughtQuantity[0].quantity) ? 0 : boughtQuantity[0].quantity;
            project.boughtProgress = Math.floor(_.toNumber(project.boughtQuantity) * 100 / _.toNumber(project.quantity));
            newProjects.push(project);
        });
        newProjects = _.sortBy(newProjects, ['id']);

        ctx.body = newProjects;
    },

    getProject: async (ctx, next) => {
        let id = ctx.params.id;
        let project = await knex('projects').where({
            id: id
        }).select('*');

        ctx.body = project[0];
    },

    getTransactions: async (ctx, next) => {
        let token = ctx.state.user;
        let newTransactions = [];

        let transactions = await knex('transactions').where({
            phone: token.phone
        }).select('*');
        await Promise.map(transactions, async transaction => {
            let project = await knex('projects').where({
                id: transaction.project_id
            }).select('*');

            newTransactions.push({
                created_date: transaction.created_date,
                date: moment(transaction.created_date).format('YYYY-MM-DD HH:MM'),
                project: project[0].title,
                action: transaction.action,
                quantity: transaction.quantity + project[0].unit,
                price: transaction.price + '元',
            });
        });
        newTransactions = _.sortBy(newTransactions, ['created_date']);

        ctx.body = newTransactions;
    },

    trade: async (ctx, next) => {
        let token = ctx.state.user;
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
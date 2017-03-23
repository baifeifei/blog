var path = require('path');
var model = require('../model');
var stort = require('../store');


/**
 * 新建文章
 */
var createArticle = async (ctx, next) => {
    try {
        let book = await model.book.create({
            username: JSON.parse(ctx.session.user).username,
            title: ctx.request.body.title,
            note: ctx.request.body.content
        });
        await ctx.redirect('/');
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    'POST /create': createArticle,
}
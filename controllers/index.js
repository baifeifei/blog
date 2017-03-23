var path = require('path');
var model = require('../model');
var stort = require('../store');
var mditor = require('mditor');
const nodemailer = require('nodemailer');
const parser = new mditor.Parser();

//首页
var fs_index = async (ctx, next) => {
    let books = [];
    books = await model.book.findAll();
    for (let book of books) {
        book.note = parser.parse(book.note);
    }
    await ctx.render('index', {
        books: books,
        user: ctx.session.user
    });
};

//文章发表
var fs_write = async (ctx, next) => {
    if (JSON.stringify(ctx.session) == '{}') {
        ctx.redirect('/login');
    }
    await ctx.render('bookedit',{
        user: ctx.session.user
    });
}

//聊天
var fs_chat = async (ctx, next) => {
    if (JSON.stringify(ctx.session) == '{}') {
        ctx.redirect('/login');
    } else {
        await ctx.render('chat', {
            user:ctx.session.user,
            session:JSON.stringify(ctx.session.user)
        })
    }
}


module.exports = {

}

module.exports = {
    'GET /': fs_index,
    'GET /write': fs_write,
    'GET /chat': fs_chat,
    'GET /index':fs_index
}
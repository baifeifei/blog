
var path = require('path');
var model = require('../model');
var stort = require('../store');
var nodemailer=require('nodemailer');
var jwt=require('jsonwebtoken');
var redis = new stort();

//登陆页面
var fn_login = async (ctx, next) => {
    await ctx.render('login');
}

//登陆
var fn_signin = async (ctx, next) => {
    try {
        var
            email = ctx.request.body.email,
            password = ctx.request.body.password;
        if (email == "" || email == undefined || password == "" || password == undefined) {
            await ctx.render('login', { msg: '邮箱或密码不能为空' });
            return;
        }
        //查询
        var u = await model.user.findAll({
            where: {
                email: email,
                password: password,
            }
        });
        if(u.length==0){
            await ctx.render('login', { msg: '邮箱或密码错误!' });
            return;
        }
        var isvalidate=JSON.parse(JSON.stringify(u[0])).isvalidate;
        if(isvalidate==0){ //未激活
            await ctx.render('login', { msg: '账号未激活,请进邮箱激活后登陆!' });
            return;
        }
        if (u.length == 1) {
            //设置session
            ctx.session = {
                user: JSON.parse(JSON.stringify(u[0]))
            };
            //存入redis
            redis.set(u, u);
            ctx.redirect('/');
        }else{
            await ctx.render('login', { msg: '邮箱或密码错误' });
            return;
        }
    } catch (err) {
        console.log(err);
    }
};

//退出
var fn_logout=async(ctx,next)=>{
    ctx.session=null;
    await ctx.redirect('/');
}

//注册页面
var fn_reg = async (ctx, next) => {
    await ctx.render("register");
}

//注册
var fn_reg_save = async (ctx, next) => {
    var name = ctx.request.body.username,
        pwd = ctx.request.body.password;
        email = ctx.request.body.email;
        ispwd=ctx.request.body.confirmpwd;
    if (name == "" || name == undefined || pwd == "" || pwd == undefined|| ispwd == "" || ispwd == undefined|| email == "" || email == undefined) {
       await ctx.render('register', { msg: '请输入必填字段' });
        return;
    };
    if(pwd!=ispwd){
       await ctx.render('register', { msg: '两次输入密码不一致' });
        return;
    }
    try {
        //验证邮箱是否存在
        var user=await model.user.findAll({
             where: {
                email: email,
            }
        });
        if(user.length>0){
           await ctx.render('register', { msg: '邮箱已存在' });
            return;
        };
        //创建用户，设置未激活
        var user = await model.user.create({
            username: name,
            password: pwd,
            email: email,
            isvalidate:0
        });
        //发送邮箱
        let transporter = nodemailer.createTransport({
            service: 'QQ',
            auth: {
                user: '38942692@qq.com',
                pass: 'pppzuwucdggccabg'
            }
        });
        //生成激活token
        var content = { msg: email };
        var secretOrPrivateKey = "welcome my blog";
        var token = jwt.sign(content, secretOrPrivateKey, {
            expiresIn: 60*60*15
        });

        //设置邮件内容
        let mailOptions = {
            from: '38942692@qq.com', // sender address
            to: email, // list of receivers
            subject: 'blog 激活邮件', // Subject line
            text: 'blog 激活邮件', // plain text body
            html: '<a href="http://127.0.0.1:3000/isvalidate/token/'+token+'">猛戳激活</a>'
        };
        //发送邮件
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
        await ctx.render('register',{msg:"邮件发送成功,请激活"});
    } catch (err) {
        console.log(err);
        await ctx.render('register', { msg: "注册失败" });
    }


}

var fn_qqLogin=async(ctx,next)=>{
    await ctx.render("qqLogin");
}

module.exports = {
    'POST /signin': fn_signin,
    'GET /login': fn_login,
    'GET /signup': fn_reg,
    'POST /signup': fn_reg_save,
    'GET /logout': fn_logout,
    'GET /qqLogin':fn_qqLogin
}
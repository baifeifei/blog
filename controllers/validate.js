var stort = require('../store');
var jwt = require('jsonwebtoken');
var models = require('../model')
var stort = new stort();

//邮箱链接验证
var isValidate = async (ctx, next) => {
    var message;
    //解析token
    try {
        var decoded = jwt.verify(ctx.params.token, "welcome my blog");
    } catch (err) {
        console.log(err);
        message = "链接已失效"
    }
    //认证成功修改用户状态为1
    try {
        var user = models.user.update({
            isvalidate: 1
        }, {
                where: {
                    email: decoded.msg
                }
            });
        message = "激活成功";
    } catch (err) {
        console.log(err);
        message = "激活失败";
    }
    await ctx.render('message', { msg: message });
}



module.exports = {
    'GET /isvalidate/token/:token': isValidate
}
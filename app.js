const Koa = require('koa');
const bodyparse = require('koa-bodyparser');
const controller = require('./controller')
const stort = require('./store');
const session = require('koa-session-minimal');
const staticFiles = require('koa-static');
const convert = require('koa-convert');
const views = require('koa-views');
const app = new Koa();
const http=require('http').Server(app.callback());
const io=require('socket.io')(http);

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
	console.log('a user connected');
	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+'加入了聊天室');
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});
  
});

//设置cookie
let cookie = {
    maxAge: '', // cookie有效时长
    expires: '',  // cookie失效时间
    path: '', // 写cookie所在的路径
    domain: '', // 写cookie所在的域名
    httpOnly: '', // 是否只用于http请求中获取
    overwrite: '',  // 是否允许重写
    secure: '',
    sameSite: '',
    signed: '',

}

//设置session
app.use(session({
    key: "sessionId",
    stort: new stort(),
    cookie: cookie
}))


//记录url及页面执行时间
app.use(async (ctx, next) => {
    var start = new Date();
    await next();
    var ms=new Date()-start;
    console.log(`${ctx.method} ${ctx.url}`, `${ms}ms`);
});


//设置ejs模板
// 设置渲染引擎
app.use(views(__dirname + '/views', {//这里应该是包含了ejs和别的一些，这里把扩展给限定为ejs
  extension: 'ejs'
}))

//静态资源
//使用convert 转换过时的generator中间件到anync中间件
app.use(convert(staticFiles(__dirname + '/static')));

//解析post请求
app.use(bodyparse());

//处理路由  
app.use(controller());



http.listen(3000);
console.log('strat port 3000...');

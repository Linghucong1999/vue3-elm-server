const express = require("express");
const router = require('./routers/index.js');
const config = require('config-lite');  //用于读取配置文件并将其转换为JavaScript对象
const cors = require("cors");
const session = require("express-session"); //使用express-session可以很方便地实现用户认证和权限控制等功能，同时也可以有效地防止跨站请求伪造（CSRF）攻击和会话劫持等安全问题.它提供了一个基于会话（session）的用户认证和状态管理解决方案
const MongoStore = require("connect-mongo");   //将Express应用中的Session信息存储到MongoDB数据库中
const cookieParser = require("cookie-parser");
const history = require("connect-history-api-fallback");
const db = require('./mongodb/db.js');
// import chalk from "chalk";
const chalk = require('chalk');
const winston = require('winston');
const expressWinston = require('express-winston');





const app = express();
app.use(express.urlencoded({ extended: false }));   //解析表单信息
app.use(express.json());     //解析json信息
app.use(cors());        //解决跨域问题

const store = new MongoStore({
    mongoUrl: config.url
})
app.use(cookieParser());   //解析cookie
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: config.session.cookie,
    store: store
}))


app.get('/', (req, res) => {
    res.send('欢迎来到厨鲜生');
})

router(app);



app.use(history())
app.use(express.static('./public'))
app.listen(config.port, () => {
    console.log(chalk.bold(`成功监听端口:http://127.0.0.1:${config.port}`))
})
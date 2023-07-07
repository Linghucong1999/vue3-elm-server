const AddressComponent = require('../../prototype/addressComponent.js');
const UserInfoModel = require('../../models/v2/userinfo.js');
const UserModel = require('../../models/v2/user.js');
const dtime = require('time-formater');
const bcrypt = require('bcryptjs');

//用户信息
class User extends AddressComponent {
    constructor() {
        super();
        this.login = this.login.bind(this);
    }

    async login(req, res, next) {
        const cap = req.cookies.cap;
        if (!cap) {
            res.send({
                status: 0,
                type: 'ERROR_CAPTCHA',
                message: '验证码失败'
            })
            return
        }

        const { username, password, captcha_code } = req.body;
        try {
            if (!username) {
                throw new Error('用户名参数错误');
            } else if (!password) {
                throw new Error('密码参数出错');
            } else if (!captcha_code) {
                throw new Error('请输入验证码');
            }
        } catch (err) {
            res.send({
                status: 0,
                type: 'ERROR_QUERY',
                message: err.message
            })
            return
        }

        if (cap.toString() !== captcha_code.toString()) {
            res.send({
                status: 0,
                type: 'ERROR_CAPTCHA',
                message: '验证码不正确'
            })
            return
        }

        const salt = await bcrypt.genSalt(10);
        try {
            const user = await UserModel.findOne({ username });
            //如果用户名不存在直接创建一个新用户
            if (!user) {
                const newpassword = await bcrypt.hash(password, salt);
                const user_id = await this.getId('user_id');
                const cityInfo = await this.guessPostion(req);
                const registe_time = dtime().format('YYYY-MM-DD HH:mm');
                const newUser = { username, password: newpassword, user_id };
                const newUserInfo = { username, user_id, id: user_id, city: cityInfo.city, registe_time };

                UserModel.create(newUser);
                const createUser = new UserInfoModel(newUserInfo);
                const userinfo = await createUser.save();
                req.session.user_id = user_id;
                res.send(userinfo);

            } else if (!bcrypt.compare(password, user.password)) {
                res.send({
                    status: 0,
                    type: 'ERROR_PASSWORD',
                    message: "密码错误"
                })
                return
            } else {
                req.session.user_id = user_id;
                res.send({
                    status: 1,
                    success: '登录成功'
                })
            }
        } catch (err) {
            res.send({
                status: 0,
                type: 'ERROR_USER_FAILED',
                message: '登录失败'
            })
        }

    }

    async getInfo(req, res, next) {
        const sid = req.session.user_id;
        const qid = req.query.user_id;
        const user_id = sid || qid;
        
    }

}

module.exports = new User();
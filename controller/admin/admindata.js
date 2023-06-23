const AdminModel = require('../../models/admin/admin.js');
const AddressComponent = require('../../prototype/addressComponent.js');
const bcrypt = require('bcryptjs');
const formidable = require('formidable');
const dtime = require('time-formater');

class AdminAxios extends AddressComponent {
    constructor() {
        super();
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    async login(req, res, next) {
        const { user_name, password, status = 1 } = req.body;
        try {
            if (!user_name) {
                throw new Error('用户名参数错误');
            } else if (!password) {
                throw new Error('密码参数错误');
            }
        } catch (err) {
            res.send({
                status: 0,
                type: 'GET_ERROR_PARAM',
                message: err.message
            })
            return
        }

        const salt = await bcrypt.genSalt(10);

        try {
            const admin = await AdminModel.findOne({ user_name });
            if (!admin) {
                const newpassword = await bcrypt.hash(password, salt);
                const adminTip = status == 1 ? '管理员' : '超级管理员';
                const admin_id = await this.getId('admin_id');
                const cityInfo = await this.guessPostion(req);
                const newAdmin = {
                    user_name,
                    password: newpassword,
                    id: admin_id,
                    creat_time: dtime().format('YYYY-MM-DD HH:mm'),
                    admin: adminTip,
                    status,
                    city: cityInfo.city
                }
                await AdminModel.create(newAdmin);
                req.session.admin_id = admin_id;
                res.send({
                    status: 1,
                    success: '注册管理员成功'
                })
            } else if (!bcrypt.compare(password, admin.password)) {
                res.send({
                    status: 0,
                    type: 'ERROR_PASSWORD',
                    message: '该用户已存在,密码错误'
                })
            } else {
                req.session.admin_id = admin.id;
                res.send({
                    status: 1,
                    success: '登录成功',
                })
            }
        } catch (err) {
            res.send({
                status:0,
                type:'ERROR_ADMIN_FAILED',
                message:'登录失败'
            })
        }

    }
    async register(req, res, next) {

    }
}

module.exports = new AdminAxios();
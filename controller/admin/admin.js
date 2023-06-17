const AdminModel = require('../../models/admin/admin.js');
const AddressComponent = require('../../prototype/addressComponent.js');
const crypto = require('crypto');
const formidable = require('formidable');
const dtime = require('time-formater');

class Admin extends AddressComponent {
    constructor() {
        super();
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.encryption = this.encryption.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
    }

    async login(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send({
                    status: 0,
                    type: 'FORM_DATA_ERROR',
                    message: '表单信息错误'
                })
                return
            }

            const { user_name, password, status = 1 } = fields;
            try {
                if (!user_name) {
                    throw new Error('用户名参数错误');
                } else if (!password) {
                    throw new Error('密码参数错误');
                }
            } catch (err) {
                console.log(err.message, err);
                res.send({
                    status: 0,
                    type: 'GET_ERROR_PARAM',
                    message: err.message
                })
                return
            }

            const newpassword = this.encryption(password);
            try {
                const admin = await AdminModel.findOne({ user_name });
                if (!admin) {
                    const adminTip = status == 1 ? '管理员' : '超级管理员';
                    const admin_id = await this.getId('admin_id');
                    const cityInfo = await this.guessPostion(req);
                    const newAdmin = {
                        user_name,
                        password: newpassword,
                        id: admin_id,
                        create_time: dtime().format('YYYY-MM-DD HH:mm'),
                        admin: adminTip,
                        status,
                        city: cityInfo
                    }
                    await AdminModel.create(newAdmin);
                    req.session.admin_id = admin_id;
                    res.send({
                        status: 1,
                        success: '注册管理员成功'
                    })
                } else if (newpassword.toString() != admin.password.toString()) {
                    console.log('管理员密码错误');
                    res.send({
                        status: 0,
                        type: 'ERROR_PASSWORD',
                        message: '该用户已存在,密码错误'
                    })
                } else {
                    req.session.admin_id = admin.id;
                    res.send({
                        status: 1,
                        success: '登录成功'
                    })
                }
            } catch (err) {
                console.log('登录失败', err);
                res.send({
                    status: 0,
                    type: 'ERROR_ADMIN_FAILED',
                    message: '登录失败'
                })
            }

        })

    }

    async register(req, res, next) {
        const form=new formidable.IncomingForm();
        form.parse(req,async (err,fields,files)=>{
            
        })
    }


    encryption(password) {
        const newpassword = this.Md5(this.Md5(password).substring(2, 7)) + this.Md5(password);
        return newpassword;
    }
    Md5(password) {
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }


}

module.exports = new Admin();
//验证码生成保存到cookie传给客户端

const captchapng = require('captchapng');

class Captchas {
    constructor() {

    }

    //验证码
    async getCaptchas(req, res, next) {
        const cap = parseInt(Math.random() * 9000 + 1000);
        const p = new captchapng(80, 30, cap);
        p.color(0, 0, 0, 0);
        p.color(80, 80, 80, 255);
        const base64 = p.getBase64();
        res.cookie('cap', cap, { maxAge: 300000, httpOnly: true });
        res.send({
            status: 1,
            code: 'data:image/png;base64,' + base64
        })
    }
}

module.exports = new Captchas();
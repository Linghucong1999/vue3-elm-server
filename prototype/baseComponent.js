const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const Ids = require('../models/ids.js');
const formidable = require('formidable');
// import formidable from 'formidable';
const qiniu = require('qiniu');
const gm = require('gm');

qiniu.conf.ACCESS_KEY = 'csn9x6TTRJUoZcH3WRIzYq6oHalGvscT6hHHpDLJ';
qiniu.conf.SECRET_KEY = 'rs5ucKu52fgDmTZGss-98WCOycRB0Ibjv-bmU1VB';

class BaseComponent {
    constructor() {
        this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'cart_id', 'img_id', 'category_id', 'item_id', 'sku_id', 'admin_id', 'statis_id'];
        this.imgTypeList = ['shop', 'food', 'avatar', 'default'];
        this.uploadImg = this.uploadImg.bind(this);
        this.qiniucon = this.qiniucon.bind(this);
        this.getPath = this.getPath.bind(this);
    }

    //连接api
    async fetchDate(url = '', data = {}, type = 'GET', resType = 'JSON') {
        type = type.toUpperCase();
        resType = resType.toUpperCase();
        if (type == 'GET') {
            let dataStr = ''; //数据拼接字符串
            Object.keys(data).forEach(key => {
                dataStr += key + '=' + data[key] + '&';
            })

            if (dataStr !== '') {
                dataStr = dataStr.substring(0, dataStr.lastIndexOf('&'));
                url = url + '?' + dataStr;
            }
        }

        let requestConfig = {
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }

        if (type == 'POST') {
            Object.defineProperty(requestConfig, 'body', { value: JSON.stringify(data) });
        }

        let responseJson;
        try {
            let response = await fetch(url, requestConfig);
            if (resType === 'TEXT') {
                responseJson = await response.text();
            } else {
                responseJson = await response.json();
            }
        } catch (err) {
            console.log('获取https数据失败', err);
            throw new Error(err);
        }

        return responseJson;

    }

    //获取id列表
    async getId(type) {
        if (!this.idList.includes(type)) {
            console.log('id类型错误');
            throw new Error('id类型错误');
            return
        }
        try {
            const idData = await Ids.findOne();
            idData[type]++;
            await idData.save();
            return idData[type];
        } catch (err) {
            console.log('获取id数据失败');
            throw new Error(err);
        }
    }

    //上传照片
    async uploadImg(req, res, next) {
        const type = req.params.type;
        try {
            const image_path = await this.qiniucon(req, type);  //上传到云服务器
            // const image_path=await this.getPath(req,res);    //直接存到本地
            res.send({ status: 1, image_path });
        } catch (err) {
            console.log('上传图片失败:' + err);
            res.send({
                status: 0,
                type: 'ERROR_UPLOAD_IMG',
                message: '上传图片失败'
            })
        }
    }

    async getPath(req, res) {
        return new Promise((resolve, reject) => {
            const form = formidable({});
            form.uploadDir = './public/img';
            form.parse(req, async (err, fields, files) => {
                let img_id;
                try {
                    img_id = await this.getId('img_id');
                } catch (err) {
                    console.log('获取图片id失败');
                    fs.unlinkSync(files.file.filepath);
                    reject('获取图片id失败');
                }

                const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16) + img_id;
                const extname = path.extname(files.file.originalFilename);
                if (!['.jpg', '.jpeg', '.png'].includes(extname)) {
                    fs.unlinkSync(files.file.filepath);
                    res.send({
                        status: 0,
                        type: 'ERROR_EXTNAME',
                        message: '文件格式错误'
                    });
                    reject('上传失败');
                    return
                }

                const fullName = hashName + extname;
                const repath = './public/img/' + fullName;
                try {
                    await fs.rename(files.file.filepath, repath, (err) => {
                        if (err) throw new Error(err);
                    });
                    gm(repath).size(200, 200, '!').write(repath, async (err) => {
                        resolve(fullName);
                    })
                } catch (err) {
                    console.log('保存图片失败！');
                    if (fs.existsSync(repath)) {
                        fs.unlinkSync(repath);
                    } else {
                        fs.unlinkSync(files.file.filepath);
                    }
                    reject('保存图片失败');
                }
            })
        })
    }


    async qiniucon(req, type = 'default') {
        return new Promise((resolve, reject) => {
            const form = formidable({});
            form.uploadDir = './public/img';
            form.parse(req, async (err, fields, files) => {
                let img_id;
                try {
                    img_id = await this.getId('img_id');

                } catch (err) {
                    console.log('获取图片id失败');
                    fs.unlinkSync(files.file.path);
                    reject('获取图片id失败');
                }
                const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16) + img_id;
                const extname = path.extname(files.file.originalFilename);
                const repath = './public/img/' + hashName + extname;

                try {
                    const key = hashName + extname;
                    await fs.rename(files.file.filepath, repath, (err) => {
                        if (err) throw new Error(err);
                    });
                    const token = this.uptoken('v3--elm-image-upload', key);
                    resolve(token);
                    // const qiniuImg = await this.uploadFile(token.toString(), key, repath);
                    // fs.unlinkSync(repath);
                    // resolve(qiniuImg);
                } catch (err) {
                    console.log('图片保存至七牛失败:', err);
                    fs.unlinkSync(repath);
                    reject('保存至七牛失败');
                }
            })
        })
    }

    uptoken(bucket, key) {
        let putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
        return putPolicy.token();
    }

    async uploadFile(uptoken, key, localFile) {
        return new Promise((resolve, reject) => {
            let extra = new qiniu.io.PutExtra();
            qiniu.io.putFile(uptoken, key, localFile, extra, (err, ret) => {
                if (!err) {
                    resolve(ret.key);
                } else {
                    // console.log('图片上传失败', err);
                    fs.unlinkSync(localFile)
                    reject('图片上传失败');
                }
            })
        })
    }

}


module.exports = BaseComponent;
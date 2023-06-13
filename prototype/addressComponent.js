const BaseComponent = require('./baseComponent.js');


/**
 * 腾讯、百度地图API统一调用配件
 */

class AddressComponent extends BaseComponent {
    constructor() {
        super();
        this.baidukey = 'H4M0rI9fGBCs6DxZp3viPhdWYk4sKq1l';
        this.tencentkey = 'RR7BZ-3TC3V-TAOPK-5EEA6-QG3IS-VXFH4';
        this.tencentkey2 = 'W23BZ-WGFCW-5LAR2-3OGIT-GIZOT-JRBYG';
        this.tencentkey3 = 'S2XBZ-5VBKB-FO3UD-NSM3Q-GXXS2-VEF63';
        this.tencentkey4 = '3CLBZ-CTY3Q-JPJ5E-4EGWO-EEWFK-NCB3N';
    }


    //获取定位地址
    async guessPostion(req) {
        return new Promise(async (resolve, reject) => {
            let ip;
            const defaultIp = '183.9.231.139';
            if (process.env.NODE_ENV == 'development') {
                ip = defaultIp;
            } else {
                try {
                    //如果客户端使用了代理服务器，那么 X-Forwarded-For 头部中会包含多个 IP 地址，其中第一个 IP 地址就是客户端的真实 IP 地址 ==>req.headers['x-forwarded-for']?.split(',')[0] 
                    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress;
                    ip = ip || defaultIp;
                } catch (err) {
                    ip = defaultIp;
                }
            }


            try {
                let result = await this.fetchDate('https://apis.map.qq.com/ws/location/v1/ip', { ip, key: this.tencentkey });

                if (result.status != 0) {
                    result = await this.fetchDate('https://apis.map.qq.com/ws/location/v1/ip', { ip, key: this.tencentkey2 });
                }

                if (result.status != 0) {
                    result = await this.fetchDate('https://apis.map.qq.com/ws/location/v1/ip', { ip, key: this.tencentkey3 });
                }

                if (result.status != 0) {
                    result = await this.fetchDate('https://apis.map.qq.com/ws/location/v1/ip', { ip, key: this.tencentkey4 });
                }

                if (result.status == 0) {
                    const cityInfo = {
                        lat: result.result.location.lat,
                        lng: result.result.location.lng,
                        city: result.result.ad_info.city
                    };
                    cityInfo.city = cityInfo.city.replace(/市$/, '');
                    resolve(cityInfo);
                } else {
                    console.log('定位失败', result);
                    reject('定位失败');
                }
            } catch (err) {
                reject(err);
            }

        })
    }

    //搜索地址
    async searchPlace(keyword, cityName, type = 'search') {
        try {
            const resObj = await this.fetchDate('https://apis.map.qq.com/ws/place/v1/search', {
                boundary: 'nearby(' + encodeURIComponent(cityName) + ',0)',
                keyword: encodeURIComponent(keyword),
                page_size: 10,
                page_index: 1,
                key: this.tencentkey

            })

            if (resObj.status == 0) {
                return resObj;
            } else {
                throw new Error('搜索位置信息失败');
            }
        } catch (err) {
            throw new Error(err);
        }
    }




}

module.exports = AddressComponent;
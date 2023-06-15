const ShopModel = require('../../models/shopping/shop.js');
const AddressConpont = require('../../prototype/addressComponent.js');
const Food = require('./food.js');
const formidable = require('formidable');
const CategoryHandle = require('./category.js');


class Shop extends AddressConpont {
    constructor() {
        super()
        this.addShop = this.addShop.bind(this);
        this.getRestaurants = this.getRestaurants.bind(this);
        this.searchRestaurant = this.searchRestaurant.bind(this);
    }

    //添加商铺
    async addShop(req, res, next) {
        let restaurant_id;
        try {
            restaurant_id = await this.getId('restaurant_id');
        } catch (err) {
            console.log('获取餐厅id失败');
            res.send({
                status: 1,
                type: 'ERROR_DATA',
                message: '获取数据失败'
            })
            return
        }

        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            try {
                if (!fields.name) {
                    throw new Error('必须填写商铺名称');
                } else if (!fields.address) {
                    throw new Error('必须填写商店地址');
                } else if (!fields.phone) {
                    throw new Error('必须填写联系电话');
                } else if (!fields.latitude || !fields.longitude) {
                    throw new Error('商品位置信息错误');
                } else if (!fields.image_path) {
                    throw new Error('必须上传图片');
                } else if (!fields.category) {
                    throw new Error('必须上传食品种类');
                }
            } catch (err) {
                console.log('客户端参数出错', err.message);
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: err.message
                })
                return
            }
            const exists = await ShopModel.findOne({ name: fields.name });
            if (exists) {
                res.send({
                    status: 0,
                    type: 'RESTURANT_EXISTS',
                    message: '店铺已经存在,请尝试其他店铺名称'
                })
                return
            }

            const opening_hours = fields.startTime && fields.endTime ? fields.startTime + '/' + fields.endTime : '8:30/20:30';
            const newShop = {
                name: fields.name,
                address: fields.address,
                description: fields.description || '',
                float_delivery_fee: fields.float_delivery_fee || 0,
                float_minimum_order_amount: fields.float_minimum_order_amount || 0,
                id: restaurant_id,
                is_premium: fields.is_premium || false,
                is_new: fields.new || false,
                latitude: fields.latitude,
                longitude: fields.longitude,
                location: [fields.longitude, fields.latitude],
                opening_hours: [opening_hours],
                phone: fields.phone,
                promotion_info: fields.promotion_info || '欢迎光临,用餐高峰期请提前下单,谢谢',
                rating: (4 + Math.random()).toFixed(1),
                rating_count: Math.ceil(Math.random() * 1000),
                recent_order_num: Math.ceil(Math.random() * 1000),
                status: Math.round(Math.random()),
                image_path: fields.image_path,
                category: fields.category,
                piecewise_agent_fee: {
                    tips: '配送费￥' + (fields.float_delivery_fee || 0),
                },
                activities: [],
                suppprts: [],
                license: {
                    business_license_image: fields.business_license_image || '',
                    catering_service_license_image: fields.catering_service_license_image || ''
                },
                identification: {
                    company_name: '',
                    identificate_agency: '',
                    identificate_date: '',
                    legal_person: '',
                    licenses_date: '',
                    licenses_number: '',
                    licenses_scope: '',
                    operation_period: '',
                    registered_address: '',
                    registered_number: ''
                }

            }

            //配送方式
            if(fields.delivery_mode){
                Object
            }
        })

    }
}
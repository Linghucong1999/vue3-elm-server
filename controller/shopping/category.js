const CategoryModel = require('../../models/shopping/category.js');
const DeliveryModel = require('../../models/shopping/delivery.js');
const ActivityModel = require('../../models/shopping/activity.js');
const BaseComponent = require('../../prototype/baseComponent.js');

class Category extends BaseComponent {
    constructor() {
        super();
    }

    //获取所有餐馆分类和数量
    async getCategories(req, res, next) {
        try {
            const categories = await CategoryModel.find({}, '-_id');
            res.send(categories);
        } catch (err) {
            console.log('获取categories失败');
            res.send({
                status: 0,
                type: 'ERROR_DATA',
                message: '获取categories失败'
            })
        }
    }

    async addCategory(type) {
        try {
            await CategoryModel.addCategory(type);
        } catch (err) {
            console.log('增加catergory数量失败');
        }
    }

    async findById(id) {
        try {
            const CateEntity = await CategoryModel.findOne({ 'sub_categories.id': id });
            let categoName = CateEntity.name;
            CateEntity.sub_categories.forEach(item => {
                if (item.id == id) {
                    categoName += '/' + item.name;
                }
            })
            return categoName;
        } catch (err) {
            console.log("通过category id获取数据失败");
            throw new Error(err);
        }
    }

}

module.exports = new Category();
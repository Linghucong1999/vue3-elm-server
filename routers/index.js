const shopping = require('./shopping.js');
const admin=require('./admin.js');
const statis=require('./statis.js');
module.exports = app => {
    app.use('/shopping', shopping);
    app.use('/admin',admin);
    app.use('/statis',statis);
}
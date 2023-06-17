const shopping = require('./shopping.js');
const admin=require('./admin.js');
module.exports = app => {
    app.use('/shopping', shopping);
    app.use('/admin',admin);
}
const shopping = require('./shopping.js');
module.exports = app => {
    app.use('/shopping', shopping);
}
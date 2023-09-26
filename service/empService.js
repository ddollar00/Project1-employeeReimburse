const dao = require('../DAO/empdao.js');
const uuid = require('uuid');

function postLogin(username, password) {
    return dao.postLogin(username, password);
}
function postRegister(username, password) {
    return dao.postRegister(uuid.v4(), username, password);
}
function putChangeAdminStatus(user, newRole) {
    return dao.putChangeAdminStatus(user, newRole);
}
module.exports = {
    postLogin,
    postRegister,
    putChangeAdminStatus
}
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
function makeToken(username, role) {
    return jwt.sign({
        username,
        role
    },
        'secretstash', {
        expiresIn: '1d'
    })

}

jwt.verify = Promise.promisify(jwt.verify);
function verifyTokenAndReturnPayload(token) {
    return jwt.verify(token, 'secretstash');
}
module.exports = {
    makeToken,
    verifyTokenAndReturnPayload
};
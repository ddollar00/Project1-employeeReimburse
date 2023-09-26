const express = require('express')
const router = express.Router()
const empService = require('../service/empService.js');
const jwt = require('../utility/jwt.js');
const bodyParser = require('body-parser');
router.use(bodyParser.json());


function validateNewUser(req, res, next) {
    if (!req.body.username || !req.body.password) {
        req.body.valid = false;
        res.send({ message: 'Username or password are invalid' })
    } else {
        req.body.valid = true;
        next();
    }
}

router.post('/login', validateNewUser, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    empService.postLogin(username, password)
        .then((data) => {
            if (data) {
                const role = data.admin === false ? 'employee' : 'admin';
                const token = jwt.makeToken(username, role);
                res.send({
                    message: `login successful ${role}`,
                    token: token
                })
            } else {
                res.statusCode = (401);
                res.send({
                    message: 'login unsuccessful'
                });
            }
        })
        .catch(err => {
            res.statusCode = (500);

            console.error(err);
        })
});
router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    empService.postRegister(username, password)
        .then(data => {
            if (data[1].register === false) {

                res.statusCode = 400;
                res.send({
                    message: 'username taken!'
                });
            } else {
                res.send({
                    message: 'successfully registered user'
                });
            }
        })
        .catch(err => {
            res.statusCode = (500);
            console.error(err);
        })
});
router.put('/change', (req, res) => {
    const user = req.body.username;
    const newRole = req.body.newRole;
    const token = req.headers.authorization.split(' ')[1];
    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                empService.putChangeAdminStatus(user, newRole)
                    .then((data) => {
                        console.log(data);
                        res.send({ message: `user: ${user} is now an ${data.admin === true ? 'admin' : 'employee'}` })
                    })
                    .catch((err) => {
                        res.statusCode = 400;
                        console.err(err);
                    })

            } else {
                res.statusCode = 400;
                res.send({ message: `This action is for admins you are an ${payload.role}` });
            }
        }
        ).catch((err) => {
            console.error(err);
        })
})
module.exports = router;
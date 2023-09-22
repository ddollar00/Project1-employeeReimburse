// HTTP Methods

const PORT = 3000;
const express = require('express');
const server = express();
const dao = require('./DAO/empdao.js');
const bodyParser = require('body-parser');
const uuid = require('uuid')
const cookieParser = require('cookie-parser');
const jwt = require('./utility/jwt.js');
server.use(cookieParser());
server.use(bodyParser.json());


function validateNewUser(req, res, next) {
    if (!req.body.username || !req.body.password) {
        req.body.valid = false;
        next();
    } else {
        req.body.valid = true;
        next();
    }
}
function validateNewTicket(req, res, next) {
    if (!req.body.description || !req.body.name || !req.body.amount || !req.body.type) {
        req.body.valid = false;
        next();
    } else {
        req.body.valid = true;
        next();
    }
}
server.get('/getuser', (req, res) => {
    const body = req.body;
    dao.getUser(body.username)
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.error(err);
        })
});
server.post('/login', (req, res) => {
    const body = req.body;
    const username = body.username;
    const password = body.password;

    dao.postLogin(username, password)
        .then((data) => {

            if (data) {

                const role = data.admin == false ? 'employee' : 'admin';
                const token = jwt.makeToken(username, role)
                res.send({
                    message: `Login Successful ${role}`,
                    token: token
                });
            } else {
                res.statusCode = 400;
                res.send({
                    message: "Login Unsuccessful"
                });
            }

        })
        .catch((err) => {
            res.send({
                message: "Incorrect username or password"
            });
            console.error(err);
        })



});


server.post('/register', validateNewUser, (req, res) => {
    const body = req.body;
    if (req.body.valid) {
        dao.postRegister(uuid.v4(), body.username, body.password)
            .then((data) => {
                if (data[1].register === false) {
                    res.send({
                        message: "Username taken"
                    });
                } else {
                    res.send({
                        message: "Successfully registered User!"
                    });
                }

            })
            .catch((err) => {

                console.error(err);
            })
    } else {
        res.send({
            message: "Invalid Item properties"
        })
    }
});
server.post('/submitTicket', validateNewTicket, (req, res) => {
    const body = req.body;
    if (req.body.valid) {
        dao.postSubTicket(uuid.v4(), body.amount, body.description, body.name, body.type)
            .then((data) => {

                res.send({
                    message: "Ticket submitted successfully"
                });


            })
            .catch((err) => {
                res.send({
                    message: "Ticket not submitted"
                });
                console.error(err);
            })
    } else {
        res.send('missing ticket information')
    }

});

server.get('/tickets', (req, res) => {
    const status = req.query.status;
    dao.getUnResolvedTickets(status)
        .then((data) => {
            res.send(data.Items);
        })
        .catch((err) => {
            res.send({
                message: 'no pending tickets'
            });
        })
});
server.get('/tickets/old', (req, res) => {
    const name = req.query.name;

    dao.getPreviousTickets(name)
        .then((data) => {
            res.send(data.Items);
        })
        .catch((err) => {
            res.send({
                message: 'no pending tickets'
            });
        })
});
server.put('/tickets/:id', (req, res) => {
    const ticket_id = req.params.id;
    const status = req.query.status;
    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {


                dao.putUpdateTicketStatus(ticket_id, status)
                    .then((data) => {
                        if (data[1].changed == false) {
                            res.send(`status was updated to ${status}`);
                        } else {
                            res.send(`This ticket was already updated`);
                        }
                    })
                    .catch((error) => {
                        res.send('ticket not found')
                    })


            } else {
                res.send(
                    `This action is for admins you are an ${payload.role}`
                );
            }
        }
        ).catch((err) => {
            console.error(err);
        })

});
server.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
});




module.exports = server;
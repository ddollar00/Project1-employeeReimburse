// HTTP Methods

const PORT = 3000;
const express = require('express');
const server = express();
const dao = require('./DAO/empdao.js');
const daot = require('./DAO/ticketdao.js');
const bodyParser = require('body-parser');
const uuid = require('uuid')
const cookieParser = require('cookie-parser');
const jwt = require('./utility/jwt.js');
server.use(cookieParser());
server.use(bodyParser.json());


function validateNewUser(req, res, next) {
    if (!req.body.username || !req.body.password) {
        req.body.valid = false;
        res.send({ message: 'Username or password are invalid' })
    } else {
        req.body.valid = true;
        next();
    }
}
function validateNewTicket(req, res, next) {
    if (!req.body.description || !req.body.name || !req.body.amount || !req.body.type) {
        req.body.valid = false;
        res.send({ message: 'missing information, enter name . description, amount, and type' })
    } else {
        req.body.valid = true;
        next();
    }
}

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
            res.statusCode = 400;
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
                    res.statusCode = 400;
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
        daot.postSubTicket(uuid.v4(), body.amount, body.description, body.name, body.type)
            .then((data) => {

                res.send({
                    message: "Ticket submitted successfully"
                });


            })
            .catch((err) => {
                res.statusCode = 400;
                res.send({
                    message: "Ticket not submitted"
                });
                console.error(err);
            })
    } else {
        res.send({ message: 'missing ticket information , enter description,name,amount , and type' })
    }

});
server.get('/tickets/type', (req, res) => {
    const type = (req.body.type).toLowerCase();
    daot.getTicketsByType(type)
        .then((data) => {
            res.send(data.Items)
        })
        .catch((err) => {
            res.statusCode = 400;
            console.error(err);
        })
})

server.get('/tickets/new', (req, res) => {

    const status = (req.body.status).toLowerCase();
    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                daot.getUnResolvedTickets(status)
                    .then((data) => {
                        res.send(data.Items);
                    })
                    .catch((err) => {
                        res.statusCode = 400;
                        res.send({
                            message: `no ${status}  tickets`
                        });
                    })

            } else {
                res.send({ message: `This action is for admins you are an ${payload.role}` }

                );
            }
        }
        ).catch((err) => {
            console.error(err);
        })

});
server.get('/tickets', (req, res) => {


    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                daot.retrieveAllTickets()
                    .then((data) => {
                        res.send(data.Items);
                    })
                    .catch((err) => {
                        res.statusCode = 400;
                        res.send({
                            message: 'no  tickets'
                        });
                    })

            } else {
                res.statusCode = 400;
                res.send({ message: `This action is for admins you are an ${payload.role}` }

                );
            }
        }
        ).catch((err) => {
            console.error(err);
        })

});
server.get('/tickets/old', (req, res) => {
    const name = 'default';

    daot.getPreviousTickets(name)
        .then((data) => {
            res.send(data.Items);
        })
        .catch((err) => {
            res.statusCode = 400;
            res.send({
                message: 'no pending tickets'
            });
        })
});
server.put('/tickets/:id', (req, res) => {
    const ticket_id = req.params.id;
    const status = (req.body.status).toLowerCase();
    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {


                daot.putUpdateTicketStatus(ticket_id, status)
                    .then((data) => {
                        if (data[1].changed == false) {
                            res.send({ message: `status was updated to ${status}` });
                        } else {
                            res.statusCode = 400;
                            res.send({ message: 'This ticket was already updated' });
                        }
                    })
                    .catch((error) => {
                        res.statusCode = 400;
                        res.send({ message: 'ticket not found' })
                    })


            } else {
                res.statusCode = 400;
                res.send({ message: `This action is for admins you are an ${payload.role}` });
            }
        }
        ).catch((err) => {
            console.error(err);
        })

});
server.put('/admin/change', (req, res) => {
    const user = req.body.username;
    const newRole = req.body.newRole;
    const token = req.headers.authorization.split(' ')[1];
    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                dao.putChangeAdminStatus(user, newRole)
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
server.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
});




module.exports = server;
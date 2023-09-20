// HTTP Methods

const PORT = 3000;
const express = require('express');
const server = express();
const dao = require('./DAO/empdao.js');
const bodyParser = require('body-parser');
const uuid = require('uuid')


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

server.post('/login', (req, res) => {
    const body = req.body;

    dao.postLogin(body.username, body.password)
        .then((data) => {
            if (data.authenticated) {
                res.send({
                    message: "Login Successful"
                });
            } else {
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
                if (data[1].register == false) {
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

})
server.put('/update', (req, res) => {
    const body = req.body;

    dao.putItem(body.grocery_item_id, body.newName)
        .then((data) => {
            res.send({
                message: "Successfully updated Item!"
            })
        })
        .catch((err) => {
            res.send({
                message: "Failed to update Item!"
            });
            console.error(err);
        })

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
    const adminStat = req.headers.currentemployee;
    console.log(req.headers);
    if (adminStat == 1) {


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
            "This is forbidden for employees"
        );
    }
});
server.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
});




module.exports = server;
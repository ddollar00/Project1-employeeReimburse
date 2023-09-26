const express = require('express')
const server = express.Router()
const ticService = require('../service/ticketService.js');
const jwt = require('../utility/jwt.js');
const bodyParser = require('body-parser');
const uuid = require('uuid')
server.use(bodyParser.json());


function validateNewTicket(req, res, next) {
    if (!req.body.description || !req.body.name || !req.body.amount || !req.body.type) {
        req.body.valid = false;
        res.send({ message: 'missing information, enter name . description, amount, and type' })
    } else {
        req.body.valid = true;
        next();
    }
}
server.post('/submitTicket', validateNewTicket, (req, res) => {
    const body = req.body;
    if (req.body.valid) {
        ticService.postSubTicket(uuid.v4(), body.amount, body.description, body.name, body.type)
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
server.get('/type', (req, res) => {
    const type = (req.body.type).toLowerCase();
    ticService.getTicketsByType(type)
        .then((data) => {
            res.send(data.Items)
        })
        .catch((err) => {
            res.statusCode = 400;
            console.error(err);
        })
})

server.get('/new', (req, res) => {

    const status = (req.body.status).toLowerCase();
    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                ticService.getUnResolvedTickets(status)
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
server.get('/', (req, res) => {


    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {

                ticService.retrieveAllTickets()
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
server.get('/old', (req, res) => {
    const name = 'default';

    ticService.getPreviousTickets(name)
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
server.put('/:id', (req, res) => {
    const ticket_id = req.params.id;
    const status = (req.body.status).toLowerCase();
    const token = req.headers.authorization.split(' ')[1];

    jwt.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if (payload.role === 'admin') {


                ticService.putUpdateTicketStatus(ticket_id, status)
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
module.exports = server;
const express = require('express');
const app = express();
const port = 3000;
const authController = require('./controller/authcon.js');
const tickController = require('./controller/ticketController.js');

app.use('/auth', authController);
app.use('/tickets', tickController);
app.use('/admin', authController);

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})

const daot = require('../DAO/ticketdao.js');
const uuid = require('uuid');

function postSubTicket(amount, description, name, type) {
    return daot.postSubTicket(uuid.v4(), amount, description, name, type);
}
function getTicketsByType(type) {
    return daot.getTicketsByType(type);
}
function getUnResolvedTickets(status) {
    return daot.getUnResolvedTickets(status);
}
function retrieveAllTickets() {
    return daot.retrieveAllTickets();
}
function getPreviousTickets(name) {
    return daot.getPreviousTickets(name);
}
function putUpdateTicketStatus(ticket_id, status) {
    return daot.putUpdateTicketStatus(ticket_id, status);
}
module.exports = {
    postSubTicket,
    getTicketsByType,
    getUnResolvedTickets,
    retrieveAllTickets,
    getPreviousTickets,
    putUpdateTicketStatus
}
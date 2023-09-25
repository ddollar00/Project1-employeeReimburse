const AWS = require('aws-sdk');

// In order to perform AWS operations using the aws-sdk library,
// we need to actually "log in" to AWS through an IAM user
// This would require you to create an IAM user with the appropriate permissions
// for using DynamoDB, and you would need to generate an access key to use to log into that user
// from here

// As previously mentioned a few days ago, aws-sdk will automatically look
// for the access key and secret access key from the following 2 environment variables
// 1. AWS_ACCESS_KEY_ID=<access key value>
// 2. AWS_SECRET_ACCESS_KEY=<secret access key>
// It will use the values of those two environment variables to log in as the IAM user

// You should also set the AWS_DEFAULT_REGION environment variable to the AWS region you are using

AWS.config.update({
    region: 'us-east-2'
});

const docClient = new AWS.DynamoDB.DocumentClient();





function getUnResolvedTickets(status) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'status'
        },
        ExpressionAttributeValues: {
            ':value': status
        }
    };

    return docClient.scan(params).promise();
}
function getTicketsByType(type) {
    const params = {
        TableName: 'tickets',
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'type'
        },
        ExpressionAttributeValues: {
            ':value': type
        }
    };

    return docClient.scan(params).promise();
}
function getPreviousTickets(name) {
    const params = {
        TableName: 'tickets',
        IndexName: 'name-index',
        KeyConditionExpression: '#name = :value',
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ':value': name,
        }
    };

    return docClient.query(params).promise();
}


function postSubTicket(ticket_id, amount, description, name, type) {

    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            amount,
            description,
            status: 'pending',
            type,
            name
        }
    }

    return docClient.put(params).promise();
};
function putUpdateTicketStatus(ticket_id, newStatus) {
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #n = :value,#name = :valuee',
        ExpressionAttributeNames: {
            '#n': 'status',
            '#name': 'name'
        },
        ExpressionAttributeValues: {
            ':value': newStatus,
            ':valuee': 'default'
        }
    }
    const paramss = {
        TableName: 'tickets',
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'ticket_id'
        },
        ExpressionAttributeValues: {
            ':value': ticket_id
        }
    };
    return docClient.scan(paramss).promise()
        .then((data) => {
            const ticketStat = data.Items[0].status
            if (ticketStat === 'approved' || ticketStat === 'denied') {
                return [0, { changed: true }]
            } else {
                return [docClient.update(params).promise(), { changed: false }]
            }
        })
        .catch(err => {
            console.error('Error updating ticket:', err);
            throw err;
        })


}
function retrieveAllTickets() {
    const params = {
        TableName: 'tickets'
    }

    return docClient.scan(params).promise();
}




module.exports = {
    putUpdateTicketStatus,     //done
    postSubTicket,            //done
    //done
    getUnResolvedTickets,
    getPreviousTickets,   //done


    retrieveAllTickets,

    getTicketsByType
};
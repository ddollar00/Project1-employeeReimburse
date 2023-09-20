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


function postLogin(username, password) {
    const params = {
        TableName: 'user',
        IndexName: 'username-index', // Specify the secondary index name
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username,
        },
    };

    try {
        // Try to query the user based on the username
        return docClient.query(params).promise()
            .then(data => {
                const user = data.Items[0]; // Assuming usernames are unique

                // Check if the user exists and if the provided password matches
                if (user && user.password === password) {
                    return { authenticated: true, user };
                } else {
                    return { authenticated: false };
                }
            })
            .catch(err => {
                console.error('Error retrieving user:', err);
                throw err; // Rethrow the error for handling elsewhere if needed
            });
    } catch (err) {
        console.error('Error:', err);
        throw err; // Rethrow the error for handling elsewhere if needed
    }
}



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

function postRegister(user_id, username, password) {

    const params = {
        TableName: 'user',
        Item: {
            user_id,
            admin: false,
            username,
            password
        }
    };
    const paramss = {
        TableName: 'user',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username,
        },
    };
    return docClient.query(paramss).promise()
        .then(data => {
            const user = data.Items[0];


            if (user) {
                return [0, { register: false }];
            } else {
                return [docClient.put(params).promise(), { register: true }];
            }
        })
        .catch(err => {
            console.error('Error retrieving user:', err);
            throw err; // Rethrow the error for handling elsewhere if needed
        });

};
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
            if (ticketStat == 'Approved' || ticketStat == 'Denied') {
                return [0, { changed: true }]
            } else {
                return [docClient.update(params).promise(), { changed: false }]
            }
        })
        .catch(err => {
            console.error('Error updating ticket:', err);
            throw err; // Rethrow the error for handling elsewhere if needed
        })


}



module.exports = {
    putUpdateTicketStatus,     //done
    postSubTicket,            //done
    postRegister,            //done
    getUnResolvedTickets,
    getPreviousTickets,   //done
    postLogin             //done

};
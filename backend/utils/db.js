const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: `${process.env.REGION}` });
const client = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
const tableName = `${process.env.TABLE_NAME}`;


const checkClaimed = async (emailAddress, walletAddress) => {
    const authParamsGet = {
        TableName: tableName,
    };
    const AuthDynamodbDataRaw = await client.scan(authParamsGet).promise();
    let result = false;
    AuthDynamodbDataRaw.Items.some(dbData => {
        if (dbData.email === emailAddress && dbData.wallet) {
            result = 'NFT already claimed by this email address.';
            return;
        }
        else if (dbData.wallet === walletAddress) {
            result = 'NFT already claimed by this wallet address.';
            return;
        }
    });
    return result;
};

const addClaimed = async (emailAddress, walletAddress) => {
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset()
    const ISTOffset = 330;   // IST offset UTC +5:30
    const date = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            "email": emailAddress
        },
        UpdateExpression: "set #wallet = :val1, #timestamp = :val2",
        ExpressionAttributeNames: {
            '#wallet': 'wallet',
            '#timestamp': 'timestamp'
        },
        ExpressionAttributeValues: {
            ":val1": walletAddress,
            ":val2": date.toString()
        },
        ReturnValues: "UPDATED_NEW"
    };
    await client.update(params).promise();
}


module.exports = { checkClaimed, addClaimed };

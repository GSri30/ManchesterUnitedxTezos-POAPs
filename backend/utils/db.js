const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESSKEYID,  // Optional if you are using AWS CLI or IAM roles
    secretAccessKey: process.env.SECRETACCESSKEY,  // Optional if you are using AWS CLI or IAM roles
});
const dynamodb = new AWS.DynamoDB({ region: `${process.env.REGION}` });
const client = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
const tableName = `${process.env.TABLE_NAME}`;


const checkClaimed = async (walletAddress) => {
    const authParamsGet = {
        TableName: tableName,
    };
    const AuthDynamodbDataRaw = await client.scan(authParamsGet).promise();
    let result = false;
    AuthDynamodbDataRaw.Items.some(dbData => {
        if (dbData.wallet === walletAddress) {
            result = 'NFT already claimed by this wallet address.';
            return;
        }
    });
    return result;
};

const addClaimed = async (walletAddress) => {
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset()
    const ISTOffset = 330;   // IST offset UTC +5:30
    const date = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            "wallet": walletAddress
        },
        UpdateExpression: "set #timestamp = :val1",
        ExpressionAttributeNames: {
            '#timestamp': 'timestamp'
        },
        ExpressionAttributeValues: {
            ":val1": date.toString()
        },
        ReturnValues: "UPDATED_NEW"
    };
    await client.update(params).promise();
}


module.exports = { checkClaimed, addClaimed };

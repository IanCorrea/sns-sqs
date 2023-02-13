'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto')

AWS.config.update({region: 'us-east-1'});

let sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.publisherLambda = async (event) => {
  let body = JSON.parse(event.body);
  console.log(body);

  let params = {
    MessageGroupId: `vacancy-${crypto.randomUUID()}`,
		MessageDeduplicationId: `vacancy-${crypto.randomUUID()}`,
    Subject: body.subject,
    Message: JSON.stringify(body.message),
    TopicArn: 'arn:aws:sns:us-east-1:343610824237:Vacancy-SNS-Topic-develop.fifo'
  }

  let publishMessage = await sns.publish(params).promise();

  console.log(publishMessage);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
      status: 'SUCCESS',
      message: publishMessage,
      },
      null,
      2
    ),
  }
};

module.exports.subscriberLambda = async (event) => {
  console.log('hello from Subscriber Lambda');
  console.log(event);
  let message = event.Records[0].body;
  if(message.includes('"error1"')) throw new Error();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        status: 'SUCCESS',
        message
      },
      null,
      2
    ),
  }  
};

module.exports.dlqLambda = async (event) => {
  console.log('hello form DLQ Lambda');
  console.log(event)
  let message = event.Records[0].body;
  if(message.includes('"error1"')) throw new Error();
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        status: 'SUCCESS',
        message
      },
      null,
      2
    ),
  }  
}

import 'source-map-support/register';
import log from 'lambda-log';
//import {log} from "lambda-log/index";
import {SQSEvent} from 'aws-lambda';

export const messagereceiver = async (event:SQSEvent) => {
  //log.info("printing event in handler fn :", event);
  var msgReceiverResponseCode : number = 200;
  var msgReceiverResponseMessage: string=''; 
  try {
    for(const {messageId, body} of event.Records) {
      log.info("message from queue :" +messageId+ ", body: "+body);

      if (body) {
        msgReceiverResponseCode = 200;
      } else {
          msgReceiverResponseCode = 500;
          msgReceiverResponseMessage = JSON.stringify({
          errorCode: 500,
          errorDescription: 'service invocation error'
        })
      }
    }
    return  {
      statusCode:msgReceiverResponseCode,
      body: msgReceiverResponseMessage
    };
  } catch (err) {
    return  {
      statusCode:500,
      body: JSON.stringify({
        errorCode: 500,
        errorDescription: 'Failed in attempting message consumption from the queue'
      })
    };
  }
};

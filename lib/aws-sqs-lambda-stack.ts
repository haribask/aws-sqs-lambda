import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Queue, DeadLetterQueue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration } from 'aws-cdk-lib';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { aws_iam as iam} from 'aws-cdk-lib';

export class AwsSqsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const messageConsumerFunction = new Function(this, 'AwsSqsLambdaConsumerStack', {
      functionName: 'AWS-SQS-LAMBDA-CONSUMER',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("build"),
      handler: "handler/aws_sqs_lambda_consumer.messagereceiver",
      layers: [
          LayerVersion.fromLayerVersionArn(this, 'LambdaLayer', '<<LAMBDA_LAYER_ARN>>')
      ]
    })

    const deadLetterQueue: DeadLetterQueue = {
      maxReceiveCount: 5,
      queue: new Queue(this, 'dlqSqsLambdaConsumer', {
        queueName: 'dlq-SQS-LAMBDA-CONSUMER'
      }),
    };

    const queue = new Queue(this, 'QueueSqsLambdaConsumer',{
      queueName: 'Queue-SQS-LAMBDA-CONSUMER',
      deadLetterQueue: deadLetterQueue,
    });
    messageConsumerFunction.addEventSource(new SqsEventSource(queue, {
      batchSize: 1, // default
      maxBatchingWindow: Duration.minutes(5),
      reportBatchItemFailures: true, // default to false
    }));

    messageConsumerFunction.addToRolePolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["secretsmanager:*", "ssm:*"],
            resources: ["<<SecretsmanagerSecretArn>>"],
        })
    );
  }
}

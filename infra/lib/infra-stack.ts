import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket } from "aws-cdk-lib/aws-s3";

type Props = cdk.StackProps & {
  invoicesBucket: Bucket;
};

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // Dead Letter Queue
    const dlq = new sqs.Queue(this, "ReservationDLQ", {
      retentionPeriod: cdk.Duration.days(14),
    });

    // Main Queue
    const reservationQueue = new sqs.Queue(this, "ReservationQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 5,
      },
    });

    // Lambda
    const paymentLambda = new lambda.Function(this, "PaymentLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambdas/payment"),
      timeout: cdk.Duration.seconds(30),
      reservedConcurrentExecutions: 10,
      environment: {
        QUEUE_URL: reservationQueue.queueUrl,
        INVOICES_BUCKET_NAME: props.invoicesBucket.bucketName,
      },
    });

    // allow lambda to consume messages from the queue
    reservationQueue.grantConsumeMessages(paymentLambda);

    // allow bucket to be accessed by lambda
    props.invoicesBucket.grantReadWrite(paymentLambda);

    // connect sqs to lambda
    paymentLambda.addEventSource(
      new eventSources.SqsEventSource(reservationQueue, {
        batchSize: 5,
        maxBatchingWindow: cdk.Duration.seconds(5),
        reportBatchItemFailures: true,
      }),
    );
  }
}

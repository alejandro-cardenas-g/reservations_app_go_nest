import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

import { Fn } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";

export class StorageStack extends cdk.Stack {
  private stackSuffix: string;
  public bucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.initializeSuffix();

    const bucketName = `invoices-bucket-ac-${this.stackSuffix}`;

    const photosBucket = new Bucket(this, "invoices", {
      bucketName: bucketName,
    });

    this.bucket = photosBucket;
  }

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split("/", this.stackId));
    this.stackSuffix = Fn.select(4, Fn.split("-", shortStackId));
  }
}

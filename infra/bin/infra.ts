#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { InfraStack } from "../lib/infra-stack";
import { StorageStack } from "../lib/storage-stack";

const app = new cdk.App();

const storageStack = new StorageStack(app, "StorageStack", {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
});

new InfraStack(app, "InfraStack", {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
  invoicesBucket: storageStack.bucket,
});

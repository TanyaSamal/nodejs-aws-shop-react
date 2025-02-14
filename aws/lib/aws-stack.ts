import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';

export class AwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const websiteBucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: 'my-aws-shop-rs-tatiana',
      versioned: false,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'ShopDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      enabled: true,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Deploy website contents
    new s3deploy.BucketDeployment(this, 'BucketDeployment', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'Website URL',
    });
  }
}

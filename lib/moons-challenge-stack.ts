import {Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Ec2Construct } from '../custom_constructs/ec2-construct';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class MoonsChallengeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domain: string = 'task-management-challenge.click';

    const hosted_zone = route53.HostedZone.fromLookup(this, 'HostedZoneMoonChallenge', {
      domainName: domain
    });

    const certificate = new acm.Certificate(this, 'CertificateMoonsChallenge', {
      domainName: `challenge.${domain}`,
      validation: acm.CertificateValidation.fromDns(hosted_zone),
    });

    const app = new Ec2Construct(this, 'EC2MoonsChallenge', {
      vpcId: "vpc-06fb8b61edb15d13f",
      vpcSubnetsZones: [
        'us-east-2a',
        'us-east-2b',
        'us-east-2c',
      ],
      sshKeyName: 'moons_challenge_scaling',
      certificateArn: certificate.certificateArn,
      instanceType: "t3.micro",
      instancePort: 80,
      healthCheckPath: "/",
      healthCheckPort: "80",
      healthCheckHttpCodes: "200",
      desiredInstances: 1,
      minInstances:0,
      maxInstances:3
    });




    new route53.ARecord(this, 'ScalingGroupAliasRecord', {
      zone: hosted_zone,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(app.loadBalancer)),
      recordName: 'challenge.task-management-challenge.click'
    });

  }
}

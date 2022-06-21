# CDK Autoscaling inventory infrastructure

## Pre-requirements
    
### Network infrastructure

The infrastucture below is requiered
* Vpc
* 3 public subnets (auto assign public ip enabled)
* 1 Internet gateway
* 1 route table to comunicate all subnets
* 1 key_pair for ssh access
* hostedzone (route53)

![Alt text](NetworkChallenge.png?raw=true "Title")

For VPC and subnets, you can deploy `NetworkProductionAppsMoons.yaml` Cloudformation template
    
## Requirements
* Node >=14.15.0
* CDK >=2.28.1
* awscli >=2.7.4


## How to use it?

>Make sure you have an awscli profile properly configured

### Install dependencies
Install cdk

```
npm i -g cdk
```


#### Config env variables

Open the `lib/const/InfrastructureConstants.ts` and replace the values for the following variables
```typescript
public static DEFAULT_ACCOUNT_ID: string = (process.env.CDK_DEFAULT_ACCOUNT_ID || 'my_aws_account_id');

public static DEFAULT_REGION: string = (process.env.CDK_DEFAULT_REGION || 'my_region');
```
>This is mandatory 


#### Bootstrap CDK
In order to manage infrastructure is mandatory to bootstrap the cdk stack in the aws profile region

```
cdk boostrap --profile my_profile
```


Install project dependencies: 
```
npm install 
```

#### Project variables
Make sure you change the following values in the `moons-challenge-stack.ts` file according to your aws account:
```typescript
//...
const domain: string = 'mydomain.com';
//...
//...
const app = new Ec2Construct(this, 'EC2MoonsChallenge', {
    vpcId: "vpc-xxxxxxxxxxxxxxxx",
    vpcSubnetsZones: [
        'my_regiona',
        'my_regionb',
        'my_regionc',
    ],
    sshKeyName: 'key_pair_name',
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
//...
```

Synthesize and generate the template and make sure everything is fine
```
cdk synth --profile my_profile
```

If everything is ok run the following to deploy the stack

```bash
cdk deploy --profile my_profile
```


## Script Bash

```bash
./search_words.sh filename.txt word1 word2 ...wordn
```
import {Construct} from "constructs";
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';

interface ICdkEc2Props {
    vpcId: string;
    vpcSubnetsZones: string[];
    sshKeyName: string;
    certificateArn: string;
    instanceType: string;
    instancePort: number;
    healthCheckPath: string;
    healthCheckPort: string;
    healthCheckHttpCodes: string;
    desiredInstances: number;
    minInstances: number;
    maxInstances: number;
}

export class Ec2Construct extends Construct {

    readonly loadBalancer: elbv2.ApplicationLoadBalancer

    constructor(scope: Construct, id: string, props: ICdkEc2Props) {
        super(scope, id);

        let iamRole = new iam.Role(this, 'Ec2IamBaseRole', {
            description: "Ec2 Autoscaling app role",
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });

        const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
            vpcId: props.vpcId
        });

        const loadBalancerSg = new ec2.SecurityGroup(this, 'moons-autoscaling-balancer-sg', {
            vpc,
            allowAllOutbound: true,
            description: 'security group for loadbalancer autoscaling',
        });
        loadBalancerSg.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow HTTPS traffic from load balancer',
        );

        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `ApplicationLoadBalancer`, {
            vpc,
            internetFacing: true,
            securityGroup: loadBalancerSg
        });

        const httpsListener = this.loadBalancer.addListener('ALBListener', {
            certificates: [
                elbv2.ListenerCertificate.fromArn(props.certificateArn)
            ],
            protocol: elbv2.ApplicationProtocol.HTTPS,
            port: 443,
            sslPolicy: elbv2.SslPolicy.TLS12
        });

        const autoscalingSG = new ec2.SecurityGroup(this, 'moons-autoscaling-sg', {
            vpc,
            allowAllOutbound: true,
            description: 'security group for moons autoscaling',
        });

        autoscalingSG.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere',
        );

        autoscalingSG.addIngressRule(
            ec2.Peer.securityGroupId(loadBalancerSg.securityGroupId),
            ec2.Port.tcp(80),
            'allow HTTP traffic from load balancer',
        );

        const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'AutoScalingGroup', {
            vpc,
            instanceType: new ec2.InstanceType(props.instanceType),
            machineImage: new ec2.AmazonLinuxImage(),
            allowAllOutbound: true,
            role: iamRole,
            healthCheck: autoscaling.HealthCheck.ec2(),
            keyName: props.sshKeyName,
            vpcSubnets: {
                availabilityZones: props.vpcSubnetsZones,
                subnetType: ec2.SubnetType.PUBLIC
            },
            desiredCapacity: props.desiredInstances,
            minCapacity: props.minInstances,
            maxCapacity: props.maxInstances,
            securityGroup: autoscalingSG
        });

        autoScalingGroup.addUserData('sudo yum install -y https://s3.region.amazonaws.com/amazon-ssm-region/latest/linux_amd64/amazon-ssm-agent.rpm')
        autoScalingGroup.addUserData('sudo systemctl enable amazon-ssm-agent')
        autoScalingGroup.addUserData('sudo systemctl start amazon-ssm-agent')
        autoScalingGroup.addUserData('sudo update-motd --disable')
        autoScalingGroup.addUserData('sudo sed -i \'s/#Banner /etc/issue.net/Banner /etc/issue.net/\' /etc/ssh/sshd_config')
        autoScalingGroup.addUserData('INSTANCE_ID=$(wget -q -O - http://169.254.169.254/latest/meta-data/instance-id)')
        autoScalingGroup.addUserData('echo "Welcome Instance: $INSTANCE_ID" | sudo tee -a /etc/motd')
        autoScalingGroup.addUserData('echo "Hello World" | sudo tee -a /var/www/html/index.html')

        httpsListener.addTargets('TargetGroup', {
            port: props.instancePort,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [autoScalingGroup],
            healthCheck: {
                path: props.healthCheckPath,
                port: props.healthCheckPort,
                healthyHttpCodes: props.healthCheckHttpCodes
            }
        })
    }
}
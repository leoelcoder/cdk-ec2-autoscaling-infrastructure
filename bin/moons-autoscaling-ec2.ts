#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MoonsChallengeStack } from '../lib/moons-challenge-stack';
import {InfrastructureConstants} from "../lib/const/InfrastructureConstants";

const stackProperties = {
    env: {
        account: InfrastructureConstants.DEFAULT_ACCOUNT_ID,
        region: InfrastructureConstants.DEFAULT_REGION
    }
}

const app = new cdk.App();
new MoonsChallengeStack(app, 'MoonsChallengeStack', stackProperties);
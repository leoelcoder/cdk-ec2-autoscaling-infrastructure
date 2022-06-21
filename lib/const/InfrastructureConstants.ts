export class InfrastructureConstants {

    public static ENVIRONMENT:string = (process.env.ENVIRONMENT || 'development');

    public static OWNER: string = (process.env.OWNER || "infrastructure");

    public static DEFAULT_ACCOUNT_ID: string = (process.env.CDK_DEFAULT_ACCOUNT_ID || '092520804297');

    public static DEFAULT_REGION: string = (process.env.CDK_DEFAULT_REGION || 'us-east-2');

}
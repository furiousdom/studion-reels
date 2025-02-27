import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';
import { Database, Project, WebServer } from '@studion/infra-code-blocks';
import { ecs } from '@pulumi/aws';

const config = new pulumi.Config();
const stack = pulumi.getStack();

const project = new Project(`studion-reels-${stack}`, {
  services: [],
  enableSSMConnect: true
});

const dbUsername = config.requireSecret('dbUsername');

const cluster = new ecs.Cluster(`reels-${stack}-cluster`, {
  name: `reels-${stack}-cluster`,
  tags: {
    Stack: stack
  }
});

const database = new Database(`reels-db-${stack}`, {
  vpcId: project.vpc.vpcId,
  vpcCidrBlock: project.vpc.vpc.cidrBlock,
  isolatedSubnetIds: project.vpc.isolatedSubnetIds,
  dbName: 'reels',
  username: dbUsername,
  instanceClass: 'db.t4g.micro'
});

const webServerImage = createWebServerImage(stack);

const server = new WebServer(`reels-server-${stack}`, {
  image: webServerImage.imageUri,
  port: 2800,
  clusterId: cluster.id,
  clusterName: cluster.name,
  vpcId: project.vpc.vpcId,
  vpcCidrBlock: project.vpc.vpc.cidrBlock,
  publicSubnetIds: project.vpc.privateSubnetIds,
  environment: [
    { name: 'PORT', value: '2800' },
    { name: 'DATABASE_HOST', value: database.instance.address },
    { name: 'DATABASE_PORT', value: `${database.instance.port}` },
    { name: 'DATABASE_NAME', value: database.instance.dbName },
    { name: 'DATABASE_USER', value: database.instance.username },
    { name: 'DATABASE_PASSWORD', value: `${database.instance.password}` },
    {
      name: 'POSTGRES_SSL_ENABLED',
      value: 'true'
    }
  ]
});

export {
  database,
  server
};

function createWebServerImage(stack: string) {
  const imageRepository = new awsx.ecr.Repository('studion-reels-repository', {
    forceDelete: true
  });
  return new awsx.ecr.Image(`reels-server-${stack}`, {
    repositoryUrl: imageRepository.url,
    context: '../.',
    platform: 'linux/amd64'
  });
}

# GrooveGlass Backend - Azure DevOps Pipeline Setup

This repository contains Azure DevOps pipeline configurations for deploying the GrooveGlass backend API to Azure.

## Pipeline Files

1. **azure-pipelines.yml** - Basic single-environment pipeline
2. **azure-pipelines-multi-env.yml** - Multi-environment pipeline (dev/staging/production)
3. **deployment-steps.yml** - Reusable deployment template
4. **azure-pipelines-variables.yml** - Variable configuration guide

## Prerequisites

### Azure Resources
1. **Azure Web Apps** (one per environment)
   - Development: `grooveglass-dev`
   - Staging: `grooveglass-staging`
   - Production: `grooveglass-prod`

2. **Azure SQL Database**
   - Server: `grooveglass-sql-server.database.windows.net`
   - Databases: `grooveglass-dev`, `grooveglass-staging`, `grooveglass-prod`

3. **Azure Service Connection** in Azure DevOps
   - Service Principal with contributor access to your resource group

### Azure DevOps Setup

#### 1. Create Variable Groups
Create the following variable groups in Azure DevOps Library:

**grooveglass-development**
```
AZURE_SERVICE_CONNECTION: your-service-connection-name
DEV_WEB_APP_NAME: grooveglass-dev
DEV_RESOURCE_GROUP_NAME: grooveglass-dev-rg
CONNECTION_STRING: Server=your-server.database.windows.net;Database=grooveglass-dev;...
SPOTIFY_CLIENT_ID: your-dev-spotify-client-id
SPOTIFY_CLIENT_SECRET: your-dev-spotify-client-secret (mark as secret)
SPOTIFY_REDIRECT_URI: https://grooveglass-dev.azurewebsites.net/callback
OPENAI_API_KEY: your-openai-key (mark as secret)
JWT_KEY: your-jwt-key (mark as secret)
JWT_ISSUER: grooveglass-dev
ENCRYPTION_KEY: your-encryption-key (mark as secret)
```

**grooveglass-staging**
```
AZURE_SERVICE_CONNECTION: your-service-connection-name
STAGING_WEB_APP_NAME: grooveglass-staging
STAGING_RESOURCE_GROUP_NAME: grooveglass-staging-rg
CONNECTION_STRING: Server=your-server.database.windows.net;Database=grooveglass-staging;...
SPOTIFY_CLIENT_ID: your-staging-spotify-client-id
SPOTIFY_CLIENT_SECRET: your-staging-spotify-client-secret (mark as secret)
SPOTIFY_REDIRECT_URI: https://grooveglass-staging.azurewebsites.net/callback
OPENAI_API_KEY: your-openai-key (mark as secret)
JWT_KEY: your-jwt-key (mark as secret)
JWT_ISSUER: grooveglass-staging
ENCRYPTION_KEY: your-encryption-key (mark as secret)
```

**grooveglass-production**
```
AZURE_SERVICE_CONNECTION: your-service-connection-name
PROD_WEB_APP_NAME: grooveglass-prod
PROD_RESOURCE_GROUP_NAME: grooveglass-prod-rg
CONNECTION_STRING: Server=your-server.database.windows.net;Database=grooveglass-prod;...
SPOTIFY_CLIENT_ID: your-prod-spotify-client-id
SPOTIFY_CLIENT_SECRET: your-prod-spotify-client-secret (mark as secret)
SPOTIFY_REDIRECT_URI: https://grooveglass-prod.azurewebsites.net/callback
OPENAI_API_KEY: your-openai-key (mark as secret)
JWT_KEY: your-jwt-key (mark as secret)
JWT_ISSUER: grooveglass-prod
ENCRYPTION_KEY: your-encryption-key (mark as secret)
```

#### 2. Create Environments
Create environments in Azure DevOps:
- **development** - Automatic deployment from `develop` branch
- **staging** - Automatic deployment from `main` branch
- **production** - Manual approval required

#### 3. Set Up Pipeline
1. In Azure DevOps, go to Pipelines ? Create Pipeline
2. Choose "Azure Repos Git" and select your repository
3. Choose "Existing Azure Pipelines YAML file"
4. Select `/azure-pipelines-multi-env.yml` (recommended) or `/azure-pipelines.yml` (simple)
5. Save and run

## Pipeline Features

### Build Stage
- ? .NET 8 SDK setup
- ? NuGet package restoration
- ? Solution build
- ? Unit test execution
- ? Code coverage reporting
- ? Application packaging

### Deployment Stages
- ? Multi-environment support (dev/staging/production)
- ? Environment-specific configurations
- ? Azure Web App deployment
- ? Application settings configuration
- ? Health check validation
- ? Rollback capability

### Security Features
- ? Secrets management via variable groups
- ? Environment-specific variables
- ? Secure connection strings
- ? TLS 1.2 enforcement
- ? Always On configuration for production

## Branching Strategy

- **feature/*** ? No deployment
- **develop** ? Deploys to development environment
- **main** ? Deploys to staging ? production (with approval)

## Health Checks

The pipeline includes health check endpoints:
- `/health` - Basic health status
- `/health/detailed` - Detailed health information

## Monitoring

After deployment, monitor:
- Application Insights logs
- Azure Web App metrics
- Health check endpoints
- Application performance

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Verify Azure service connection permissions
   - Check resource group access

2. **Health check fails**
   - Check application logs in Azure Portal
   - Verify connection strings and app settings
   - Ensure database is accessible

3. **Tests fail in pipeline**
   - Run tests locally first
   - Check test project references
   - Verify in-memory database setup

### Getting Help

- Check Azure DevOps pipeline logs
- Review Azure Web App logs
- Monitor Application Insights
- Check health endpoints

## Next Steps

1. Set up Application Insights for monitoring
2. Configure alerts for health check failures
3. Set up automated database migrations
4. Add integration tests
5. Configure blue-green deployments
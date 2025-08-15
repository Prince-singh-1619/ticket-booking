# Render Deployment Guide

## Overview
This backend service is configured to deploy on Render with automatic TypeScript compilation.

## Build Process
1. **Install Dependencies**: `npm install`
2. **Compile TypeScript**: `npm run build`
3. **Verify Output**: Ensures `dist/server.js` exists
4. **Start Server**: `node dist/server.js`

## Render Configuration
- **Build Command**: Multi-line script that installs, builds, and verifies
- **Start Command**: Verifies build output and starts the server
- **Health Check**: `/health` endpoint for monitoring

## Troubleshooting

### Common Issues

1. **Module not found error**
   - Ensure build command runs successfully
   - Check that `dist/server.js` exists after build
   - Verify working directory is correct

2. **Build failures**
   - Check TypeScript compilation errors
   - Ensure all dependencies are installed
   - Verify `tsconfig.json` configuration

3. **Start command failures**
   - Verify `dist/server.js` exists
   - Check file permissions
   - Ensure proper working directory

### Debug Commands
The build and start commands include extensive logging to help diagnose issues:
- Directory contents before and after build
- Build verification steps
- File existence checks
- Detailed error messages

## Environment Variables
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `10000`
- Database credentials should be configured in Render dashboard

## Manual Deployment Test
To test locally before deploying:
```bash
npm run render-build
npm run render-start
```

## Support
If deployment issues persist, check the Render build logs for detailed error messages from the build and start commands.

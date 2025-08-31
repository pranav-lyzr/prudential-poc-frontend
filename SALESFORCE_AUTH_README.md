# Salesforce Authentication Implementation

## Overview

This implementation adds Salesforce OAuth2 authentication to the Prudential POC Frontend application, allowing users to connect to Salesforce and access case management data.

## Features

- **OAuth2 Authentication Flow**: Secure authentication using Salesforce OAuth2
- **Automatic Session Management**: Sessions automatically expire after 1 hour
- **Real-time Countdown Timer**: Shows remaining session time
- **Persistent Authentication**: Authentication state persists across page refreshes
- **Automatic Logout**: Automatic logout when session expires
- **Error Handling**: Comprehensive error handling and user feedback

## API Endpoints

The implementation uses the following backend endpoints:

- `GET /api/v1/salesforce/login` - Get Salesforce login URL
- `POST /api/v1/salesforce/callback` - Handle OAuth callback
- `POST /api/v1/salesforce/logout` - Logout from Salesforce

## Components

### SalesforceAuth Component

Located at `src/components/SalesforceAuth.tsx`, this component provides:

- Login/Logout buttons
- Authentication status display
- Session countdown timer
- Error message display
- Connection status indicators

### API Service Integration

The `src/services/api.ts` file includes:

- `getSalesforceLoginUrl()` - Retrieves login URL from backend
- `handleSalesforceCallback()` - Processes OAuth callback
- `logoutSalesforce()` - Handles logout
- `getSalesforceAuthStatus()` - Gets current auth status
- `refreshSalesforceAuthStatus()` - Refreshes auth status

## Authentication Flow

1. **User clicks "Connect to Salesforce"**
   - Frontend calls `/api/v1/salesforce/login`
   - Backend returns OAuth URL and state parameter
   - Frontend stores state and redirects to Salesforce

2. **User authenticates on Salesforce**
   - Salesforce redirects back with authorization code
   - Frontend extracts code and state from URL
   - Frontend calls `/api/v1/salesforce/callback` with code

3. **Backend processes callback**
   - Backend exchanges code for access token
   - Backend stores token securely
   - Frontend sets authentication status with 1-hour expiration

4. **Session Management**
   - Frontend starts countdown timer
   - Automatic logout after 1 hour
   - Persistent authentication across page refreshes

## Security Features

- **State Parameter Validation**: Prevents CSRF attacks
- **Automatic Session Expiry**: Sessions expire after 1 hour
- **Secure Token Storage**: Tokens stored securely on backend
- **Local State Management**: Minimal sensitive data stored locally

## Usage

The SalesforceAuth component is automatically included in the EmailActions sidebar, providing:

- **Connection Status**: Shows if connected to Salesforce
- **Session Timer**: Countdown to session expiration
- **Quick Actions**: Connect/disconnect buttons
- **Error Display**: Shows authentication errors

## Configuration

### Backend Configuration

Ensure your backend has the following configured:

- Salesforce OAuth2 app credentials
- Redirect URI: `http://localhost:8000/api/v1/salesforce/callback`
- Proper CORS settings for frontend domain

### Frontend Configuration

The frontend automatically:

- Detects authentication state on page load
- Handles OAuth callback URLs
- Manages session timers
- Persists authentication state

## Error Handling

The implementation handles various error scenarios:

- **Network Errors**: API call failures
- **Authentication Errors**: Invalid credentials or expired tokens
- **Callback Errors**: Invalid state parameters
- **Session Expiry**: Automatic logout on expiration

## Browser Compatibility

- **Local Storage**: Used for persistent authentication state
- **Custom Events**: Used for session expiry notifications
- **URL Parameters**: Used for OAuth callback handling
- **Timers**: Used for session countdown

## Testing

To test the authentication:

1. Start the application
2. Click "Connect to Salesforce" in the right sidebar
3. Complete Salesforce authentication
4. Verify connection status and timer
5. Wait for session expiry or manually logout

## Troubleshooting

### Common Issues

1. **"Failed to get login URL"**
   - Check backend connectivity
   - Verify API endpoint configuration

2. **"Invalid state parameter"**
   - Clear browser storage
   - Restart authentication flow

3. **Session not persisting**
   - Check browser local storage
   - Verify localStorage permissions

4. **Timer not updating**
   - Check browser console for errors
   - Verify component mounting

### Debug Information

The component includes comprehensive logging:

- Authentication state changes
- API call results
- Timer updates
- Error details

Check the browser console for detailed debugging information.

## Future Enhancements

Potential improvements:

- **Refresh Token Support**: Extend session duration
- **Multiple Org Support**: Connect to multiple Salesforce orgs
- **Permission Scopes**: Request specific Salesforce permissions
- **User Profile Display**: Show connected user information
- **Activity Logging**: Track authentication events

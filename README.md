# Prudential Email Dashboard Frontend

A modern React TypeScript application for managing and viewing email processing status and actions.

## Features

- **Email List View**: Display all emails with key information (subject, sender, timestamp, attachments, action status)
- **Email Detail View**: Show complete email content, attachments, and action details
- **Responsive Design**: Works on both desktop and mobile devices
- **Clean UI**: Simple gray and black color scheme with no gradients
- **Action Tracking**: Visual indicators for different email processing actions

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── EmailList.tsx   # Email list display
│   ├── EmailDetail.tsx # Email detail view
│   └── Header.tsx      # Application header
├── types/              # TypeScript type definitions
│   └── email.ts        # Email data types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## API Integration

The application is fully integrated with the Prudential POC backend at [https://prudential-poc-backend.ca.lyzr.app/](https://prudential-poc-backend.ca.lyzr.app/). The system automatically connects to the backend and displays real-time connection status.

### Backend Endpoints

- `GET /api/v1/webhook/emails/all` - List all emails (✅ **ACTIVE** - Real API endpoint)
- `GET /api/v1/email/{id}` - Get specific email details
- `POST /api/v1/email` - Create new email record
- `GET /health` - Health check endpoint for backend status

### Real-time Status Monitoring

The dashboard includes real-time backend connection monitoring:
- **Webhook connection status** displayed in header
- **Prudential logo** in header branding
- Automatic health checks every 30 seconds
- Visual status indicators (Connected/Disconnected/Checking)
- **Real email data from Microsoft Graph API** via backend webhook
- **Auto-refresh every 5 seconds** for latest emails (silent updates)
- **Manual refresh button** with loading indicator
- **Emails sorted by latest first** for better user experience
- Fallback to mock data when backend is unavailable

## Email Actions

The system supports the following email actions:

- **Processed**: Email has been processed and archived
- **Archived**: Email stored for long-term retention
- **Forwarded**: Email forwarded to another department/team
- **Replied**: Response sent to the sender
- **Pending**: Awaiting action or approval

## Customization

### Colors
The application uses a simple gray and black color scheme as requested. Colors can be customized in the Tailwind configuration.

### Layout
The dashboard uses a modern three-panel layout:
- **Left Sidebar**: Email list with compact email previews and refresh button
- **Center Panel**: Full email content with HTML rendering and individual scrolling
- **Right Panel**: Available actions and action history for selected email
- **Individual scrolling** for each section with proper height calculations
- **End-to-end header** with Prudential branding and webhook connection status
- **Clean interface** without irrelevant status indicators

## Development

### Adding New Features
1. Create new components in the `components/` directory
2. Add new types in the `types/` directory
3. Update the main App component as needed

### Styling
All styling is done through Tailwind CSS classes. The design follows a clean, professional aesthetic suitable for business applications.

## Future Enhancements

- Real-time email updates via WebSocket
- Email filtering and search functionality
- Bulk email operations
- User authentication and role-based access
- **Email action API integration** (actions panel ready for real API)
- Email action history tracking
- Export functionality for reports

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new code
3. Ensure responsive design works on all screen sizes
4. Test thoroughly before submitting changes

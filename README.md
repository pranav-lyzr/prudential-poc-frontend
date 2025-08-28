# Prudential POC Frontend

A React-based frontend application for managing and analyzing emails with AI-powered insights.

## Features

- **Email Management**: View, search, and manage emails
- **AI-Powered Analysis**: Integration with Lyzr AI for intelligent email classification and routing
- **Real-time Updates**: Auto-refresh functionality for email data
- **Responsive Design**: Modern UI built with Tailwind CSS

## New: Lyzr AI Integration

The application now integrates with the Lyzr AI API to provide intelligent email analysis:

### API Endpoint
```
GET /api/v1/webhook/emails/{email_id}/lyzr-data
```

### Features
- **Automatic Classification**: Emails are automatically classified (e.g., CLAIMS, FINANCIAL, TECHNICAL)
- **Confidence Scoring**: AI confidence level for each classification
- **Priority Assessment**: Automatic priority level assignment
- **Routing Recommendations**: Suggested routing actions for each email
- **Entity Extraction**: Key information extraction (customer names, issue types, etc.)
- **Salesforce Integration**: Suggested Salesforce actions and auto-acknowledgment templates

### Data Structure
The Lyzr API returns structured data including:
- Classification and confidence scores
- Key indicators and routing actions
- Priority levels and review requirements
- Extracted entities and technical details

## Getting Started

### Prerequisites
- Node.js 16+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd prudential-poc-frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Variables
The application connects to the Prudential POC backend at:
```
https://prudential-poc-backend.ca.lyzr.app
```

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── EmailActions.tsx # Email actions and Lyzr data display
│   ├── EmailDetail.tsx  # Email detail view
│   ├── EmailList.tsx    # Email list component
│   └── ...
├── hooks/               # Custom React hooks
│   └── useEmails.ts     # Email management logic
├── services/            # API services
│   └── api.ts          # API client with Lyzr integration
├── types/               # TypeScript type definitions
│   └── email.ts        # Email and Lyzr data types
└── ...
```

### Key Components

#### EmailActions.tsx
Displays AI analysis results from Lyzr, including:
- Classification results with confidence scores
- Priority levels and routing recommendations
- Extracted entities and key indicators
- Salesforce action suggestions

#### useEmails.ts
Manages email state and automatically fetches Lyzr data when emails are selected.

#### api.ts
Handles API communication including the new Lyzr data endpoint.

## API Integration

### Lyzr Data Fetching
When an email is selected, the application automatically fetches Lyzr analysis data:

```typescript
// Fetch Lyzr data for a specific email
const lyzrData = await apiService.getLyzrData(emailId);
```

### Error Handling
The application gracefully handles API failures and displays appropriate loading/error states.

## Styling
Built with Tailwind CSS for consistent, responsive design.

## Building for Production
```bash
pnpm build
pnpm preview
```

## Contributing
1. Follow the existing code style
2. Add TypeScript types for new features
3. Test API integrations thoroughly
4. Update documentation as needed

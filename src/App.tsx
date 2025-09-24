
import React, { useState } from 'react';
import Header from './components/Header';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import EmailActions from './components/EmailActions';
import Dashboard from './components/Dashboard';
import { useEmails } from './hooks/useEmails';

// Extract existing email view to separate component
const EmailsView: React.FC = () => {
  const { emails, selectedEmail, loading, error, selectEmail, refreshEmails, fetchLyzrData } = useEmails();

  return (
    <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Email List */}
      <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0">
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmail?.id || null}
          loading={loading}
          error={error}
          onEmailSelect={selectEmail}
          onRetry={refreshEmails}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email Detail Section */}
        <div className="flex-1 border-r border-gray-200 overflow-hidden">
          <EmailDetail email={selectedEmail} />
        </div>

        {/* Actions Section */}
        <div className="w-80 bg-gray-50 flex-shrink-0 overflow-hidden">
          <EmailActions email={selectedEmail} onFetchLyzrData={fetchLyzrData} />
        </div>
      </div>
    </main>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<'emails' | 'dashboard'>('emails');

  const handleViewChange = (view: 'emails' | 'dashboard') => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {currentView === 'emails' ? <EmailsView /> : <Dashboard />}
    </div>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { BusinessInfoProvider } from './hooks/useBusinessInfo';
import { migrateToSecureStorage } from './utils/secureStorage';
import { detectMemoryLeaks } from './utils/cleanup';

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./components/pages/LandingPage'));
const Dashboard = React.lazy(() => import('./components/pages/Dashboard'));
const AuditResults = React.lazy(() => import('./components/pages/AuditResults'));
const OAuthCallback = React.lazy(() => import('./components/pages/OAuthCallback'));
const About = React.lazy(() => import('./components/pages/About'));
const Contact = React.lazy(() => import('./components/pages/Contact'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background-page flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-body-regular text-text-grey-600">Loading...</p>
    </div>
  </div>
);

// Main App Component
function App() {
  useEffect(() => {
    // Migrate existing localStorage to secure storage
    migrateToSecureStorage();
    
    // Enable memory leak detection in development
    const cleanup = detectMemoryLeaks();
    
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <BusinessInfoProvider>
        <div className="App">
          <BrowserRouter>
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ErrorBoundary>
                      <LandingPage />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/oauth/callback" 
                  element={
                    <ErrorBoundary>
                      <OAuthCallback />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/audit/:sessionId" 
                  element={
                    <ErrorBoundary>
                      <AuditResults />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/about" 
                  element={
                    <ErrorBoundary>
                      <About />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/contact" 
                  element={
                    <ErrorBoundary>
                      <Contact />
                    </ErrorBoundary>
                  } 
                />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </div>
      </BusinessInfoProvider>
    </ErrorBoundary>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Check for OAuth success/failure in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else if (sessionId) {
          setStatus('success');
          // Redirect to dashboard with session_id
          navigate(`/dashboard?session_id=${sessionId}`, { replace: true });
        } else {
          // No clear success or error, redirect to home
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    // Small delay to show loading state
    setTimeout(handleCallback, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-page flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <LoadingSpinner size="large" message="Connecting to Salesforce..." />
            <p className="text-caption text-text-grey-600 mt-md">
              Please wait while we establish the connection.
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-h2 font-semibold text-text-primary mb-2">
              Connection Successful!
            </h2>
            <p className="text-body-regular text-text-grey-600">
              Redirecting to your dashboard...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-h2 font-semibold text-text-primary mb-2">
              Connection Failed
            </h2>
            <p className="text-body-regular text-text-grey-600 mb-md">
              There was an issue connecting to Salesforce. Please try again.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/apiService';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import SecureStorage from '../../utils/secureStorage';
import { logger, usePolling } from '../../utils/cleanup';
import SessionCard from '../dashboard/SessionCard';
import OrgProfileModal from '../modals/OrgProfileModal';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

const Dashboard = () => {
  const [sessionId, setSessionId] = useState(SecureStorage.getItem('salesforce_session_id'));
  const [connected, setConnected] = useState(!!SecureStorage.getItem('salesforce_session_id'));
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
  const [error, setError] = useState(null);
  
  const { businessInfo, hasBusinessInfo } = useBusinessInfo();
  const navigate = useNavigate();

  // Load sessions when connected
  useEffect(() => {
    if (connected && sessionId) {
      loadSessions();
    }
  }, [connected, sessionId]);

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newSessionId = urlParams.get('session_id');
    
    if (newSessionId) {
      SecureStorage.setItem('salesforce_session_id', newSessionId);
      setSessionId(newSessionId);
      setConnected(true);
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSessions();
      setSessions(response || []);
      logger.info('Sessions loaded successfully', response);
    } catch (error) {
      logger.error('Failed to load sessions:', error);
      setError('Failed to load audit sessions. Please try again.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    try {
      window.location.href = api.getOAuthUrl();
    } catch (error) {
      logger.error('Failed to initiate OAuth:', error);
      setError('Failed to connect to Salesforce. Please try again.');
    }
  };

  const handleDisconnect = () => {
    try {
      SecureStorage.removeItem('salesforce_session_id');
      setSessionId(null);
      setConnected(false);
      setSessions([]);
      setError(null);
      navigate('/');
    } catch (error) {
      logger.error('Failed to disconnect:', error);
      setError('Failed to disconnect. Please try again.');
    }
  };

  const handleNewAudit = () => {
    if (!connected) {
      handleConnect();
      return;
    }
    
    if (!hasBusinessInfo) {
      setError('Business information is required to run an audit.');
      navigate('/');
      return;
    }
    
    setShowOrgProfile(true);
  };

  const runAuditWithProfile = async (auditRequest) => {
    try {
      setRunning(true);
      setShowOrgProfile(false);
      setError(null);
      
      logger.info('Starting audit with session_id:', sessionId);
      logger.info('Business info from context:', businessInfo);
      
      // Convert businessInfo to expected format
      let businessInputs = null;
      if (businessInfo) {
        businessInputs = {
          annual_revenue: businessInfo.annual_revenue || 1000000,
          employee_headcount: businessInfo.employee_headcount || 50,
          revenue_range: businessInfo.revenue_range,
          employee_range: businessInfo.employee_range,
        };
      }

      const enhancedRequest = {
        session_id: sessionId,
        department_salaries: auditRequest.department_salaries,
        use_quick_estimate: auditRequest.use_quick_estimate || true,
        business_inputs: businessInputs,
      };

      logger.info('Sending audit request:', enhancedRequest);
      
      const response = await api.runAudit(enhancedRequest);
      logger.info('Audit response received:', response);

      if (response && response.session_id) {
        const auditId = response.session_id;
        logger.info('Got audit session ID:', auditId);
        
        // Navigate to results page
        navigate(`/audit/${auditId}`);
        
        // Refresh sessions list in background
        setTimeout(async () => {
          try {
            await loadSessions();
          } catch (refreshError) {
            logger.warn('Failed to refresh sessions:', refreshError);
          }
        }, 1000);
      } else {
        throw new Error('No session_id in response');
      }
    } catch (error) {
      logger.error('Audit failed:', error);
      
      if (error.status === 401) {
        // Session expired
        handleDisconnect();
        setError('Your session has expired. Please log in again.');
      } else if (error.status >= 500) {
        setError('Server error. Our team has been notified. Please try again later.');
      } else {
        setError(error.message || 'Audit failed. Please try again.');
      }
    } finally {
      setRunning(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        formattedDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        formattedTime: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };
    } catch (error) {
      logger.error('Date formatting error:', error);
      return {
        formattedDate: 'Invalid Date',
        formattedTime: '',
      };
    }
  };

  // Show loading spinner while checking connection
  if (loading && sessions.length === 0) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background-page">
      <div className="container-page py-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate('/')}
              className="btn-text p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-h1 font-semibold text-text-primary">
                Audit Dashboard
              </h1>
              {connected && sessionId && (
                <p className="text-body-regular text-text-grey-600">
                  Connected to Salesforce
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-md">
            {connected ? (
              <>
                <button
                  onClick={handleNewAudit}
                  disabled={running || !hasBusinessInfo}
                  className="btn-primary"
                >
                  {running ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Running Audit...
                    </>
                  ) : (
                    'New Audit'
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="btn-primary"
              >
                Connect Salesforce
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-lg">
            <div className="bg-red-50 border border-red-200 rounded-md p-md">
              <p className="text-body-regular text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-caption text-red-600 hover:text-red-800 mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!connected ? (
          <div className="text-center py-12">
            <div className="card max-w-md mx-auto">
              <h2 className="text-h2 font-semibold text-text-primary mb-md">
                Connect Your Salesforce
              </h2>
              <p className="text-body-regular text-text-grey-600 mb-lg">
                Connect your Salesforce org to run comprehensive audits and get actionable insights.
              </p>
              <button
                onClick={handleConnect}
                className="btn-primary w-full"
              >
                Connect Salesforce
              </button>
            </div>
          </div>
        ) : sessions.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="card max-w-md mx-auto">
              <h2 className="text-h2 font-semibold text-text-primary mb-md">
                No Audits Yet
              </h2>
              <p className="text-body-regular text-text-grey-600 mb-lg">
                Run your first audit to discover optimization opportunities in your Salesforce org.
              </p>
              <button
                onClick={handleNewAudit}
                disabled={!hasBusinessInfo}
                className="btn-primary w-full"
              >
                Run First Audit
              </button>
              {!hasBusinessInfo && (
                <p className="text-caption text-text-grey-600 mt-2">
                  Business information required. Please return to the home page to complete setup.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
                onClick={() => navigate(`/audit/${session.id}`)}
              />
            ))}
            {loading && (
              <div className="col-span-full flex justify-center py-8">
                <LoadingSpinner message="Loading sessions..." />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <OrgProfileModal
        isOpen={showOrgProfile}
        onClose={() => setShowOrgProfile(false)}
        onSubmit={runAuditWithProfile}
        isLoading={running}
      />

      {/* Toast Notifications */}
      <Toast
        show={showToast}
        message="Successfully connected to Salesforce!"
        type="success"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component - Simply Scale Design
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="App">
      {/* Header - Simply Scale Style */}
      <header className="header">
        <Link to="/" className="logo">SalesAudit Pro</Link>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/contact">Services</Link>
          <Link to="/contact">Success Stories</Link>
          <button 
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Let's Talk
          </button>
        </nav>
      </header>

      {/* Hero Section - Simply Scale Style */}
      <section className="hero">
        <div className="container">
          <h1 className="slide-in-up">
            Optimize Your Salesforce<br/>
            <span className="accent">Like Never Before</span>
          </h1>
          <p className="subhead slide-in-up">
            Discover hidden inefficiencies, automate manual processes, and unlock 
            substantial cost savings with our AI-powered Salesforce audit tool.
          </p>
          <button 
            className="btn-primary size-lg slide-in-up"
            onClick={() => navigate('/dashboard')}
          >
            🚀 Start Free Audit
          </button>
        </div>
      </section>

      {/* Features Section - Simply Scale Style */}
      <section className="features">
        <div className="container">
          <div className="feature-card slide-in-up">
            <span className="icon">🔍</span>
            <h3>Deep Analysis</h3>
            <p>Comprehensive audit of custom fields, data quality, and automation opportunities</p>
          </div>
          
          <div className="feature-card slide-in-up">
            <span className="icon">💰</span>
            <h3>ROI Insights</h3>
            <p>Transparent cost-benefit analysis with customizable assumptions and detailed breakdowns</p>
          </div>
          
          <div className="feature-card slide-in-up">
            <span className="icon">📊</span>
            <h3>Actionable Reports</h3>
            <p>Professional PDF reports with prioritized recommendations and implementation guidance</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Org Profile Modal Component
const OrgProfileModal = ({ isOpen, onClose, onSubmit, sessionId }) => {
  const [useQuickEstimate, setUseQuickEstimate] = useState(true);
  const [departmentSalaries, setDepartmentSalaries] = useState({
    customer_service: '',
    sales: '',
    marketing: '',
    engineering: '',
    executives: ''
  });

  const handleSalaryChange = (department, value) => {
    setDepartmentSalaries(prev => ({
      ...prev,
      [department]: value && value.trim() !== '' ? parseInt(value) : null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Ensure department_salaries is properly structured even if using quick estimate
      const auditRequest = {
        session_id: sessionId,
        use_quick_estimate: useQuickEstimate,
        department_salaries: useQuickEstimate ? null : {
          customer_service: departmentSalaries.customer_service || null,
          sales: departmentSalaries.sales || null,
          marketing: departmentSalaries.marketing || null,
          engineering: departmentSalaries.engineering || null,
          executives: departmentSalaries.executives || null
        }
      };
      
      console.log('Form submitting audit request:', auditRequest);
      
      // Validate session_id exists
      if (!sessionId) {
        alert('No session ID found. Please reconnect to Salesforce.');
        return;
      }
      
      onSubmit(auditRequest);
    } catch (error) {
      console.error('Error preparing audit request:', error);
      alert(`Error preparing audit request: ${error.message}`);
    }
  };

  const defaultSalaries = {
    customer_service: 45000,
    sales: 65000,
    marketing: 60000,
    engineering: 95000,
    executives: 150000
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Org Profile</h2>
          <div className="text-right">
            <div className="text-xs text-gray-500">Session: {sessionId ? sessionId.substring(0, 8) + '...' : 'None'}</div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick vs Custom Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useQuickEstimate}
                  onChange={() => setUseQuickEstimate(true)}
                  className="mr-2"
                />
                <span className="font-medium">Quick Estimate</span>
                <span className="text-sm text-gray-500 ml-2">(Uses U.S. national averages)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useQuickEstimate}
                  onChange={() => setUseQuickEstimate(false)}
                  className="mr-2"
                />
                <span className="font-medium">Custom Estimate</span>
                <span className="text-sm text-gray-500 ml-2">(Enter your team's salaries)</span>
              </label>
            </div>
          </div>

          {!useQuickEstimate && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter average annual salaries for each department (USD). Leave blank to use national averages.
              </p>
              
              {Object.entries(defaultSalaries).map(([dept, defaultValue]) => (
                <div key={dept} className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 capitalize">
                    {dept.replace('_', ' ')}:
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder={`$${defaultValue.toLocaleString()} (default)`}
                      value={departmentSalaries[dept] || ''}
                      onChange={(e) => handleSalaryChange(dept, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-20">
                    ≈ ${Math.round((departmentSalaries[dept] || defaultValue) / 2080)}/hr
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Assumptions Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Calculation Assumptions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Admin cleanup rate: $40/hour (U.S. average Salesforce admin)</li>
              <li>• Custom field cleanup time: 15 minutes per field</li>
              <li>• User confusion time: 2 minutes per user per field per month</li>
              <li>• Salaries converted to hourly rate (÷ 2,080 hours/year)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {useQuickEstimate ? '🚀 Quick Audit' : '📊 Custom Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

{/* Dashboard Component */}
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
    
    // Check for session ID in localStorage (from OAuth callback)
    const storedSessionId = localStorage.getItem('salesforce_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      console.log('Found stored session ID:', storedSessionId);
    }
    
    // Also check URL parameters as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    if (urlSession) {
      setSessionId(urlSession);
      localStorage.setItem('salesforce_session_id', urlSession);
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/audit/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleRunAudit = () => {
    if (!sessionId) {
      alert('Please connect to Salesforce first by going to the home page and clicking "Connect with Salesforce"');
      navigate('/');
      return;
    }
    setShowOrgProfile(true);
  };

  const runAuditWithProfile = async (auditRequest) => {
    setRunning(true);
    setShowOrgProfile(false);
    
    try {
      console.log('Running audit with profile:', auditRequest);
      console.log('API URL:', `${API}/audit/run`);
      
      const response = await axios.post(`${API}/audit/run`, auditRequest, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Audit response:', response.data);
      
      if (response.data.session_id) {
        navigate(`/audit/${response.data.session_id}`);
      } else if (response.data.error) {
        alert(`Audit failed: ${response.data.error}`);
        // If session expired, clear it
        if (response.data.error.includes('Invalid or expired session')) {
          localStorage.removeItem('salesforce_session_id');
          setSessionId(null);
        }
      }
    } catch (error) {
      console.error('Audit failed with error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please connect to Salesforce again.');
        localStorage.removeItem('salesforce_session_id');
        setSessionId(null);
        navigate('/');
      } else if (error.response && error.response.data) {
        alert(`Audit failed: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(`Audit failed: ${error.message}. Please check console for details.`);
      }
    } finally {
      setRunning(false);
    }
  };

  const disconnectSalesforce = () => {
    localStorage.removeItem('salesforce_session_id');
    setSessionId(null);
    alert('Disconnected from Salesforce. Click "Connect with Salesforce" to reconnect.');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      {/* Simply Scale Header */}
      <header className="header">
        <Link to="/" className="logo">SalesAudit Pro</Link>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-body)' }}>
              {sessionId ? (
                <>
                  <span style={{ color: 'var(--color-accent)' }}>✅ Connected</span>
                  <button
                    onClick={disconnectSalesforce}
                    style={{ 
                      marginLeft: 'var(--space-sm)', 
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--fs-small)',
                      cursor: 'pointer'
                    }}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <span style={{ color: '#FF9500' }}>⚠️ Not connected</span>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="premium-container">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-lg)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 style={{ 
                fontSize: 'var(--fs-hero-lg)', 
                fontWeight: 'var(--fw-bold)', 
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-xs)'
              }}>
                Salesforce Audit Dashboard
              </h1>
              <p style={{ 
                fontSize: 'var(--fs-body)', 
                color: 'var(--color-text-secondary)' 
              }}>
                Run comprehensive audits and view historical results
              </p>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={running || !sessionId}
              className={sessionId ? 'btn-primary' : 'btn-secondary'}
              style={{ 
                opacity: (running || !sessionId) ? 0.5 : 1,
                cursor: (running || !sessionId) ? 'not-allowed' : 'pointer'
              }}
            >
              {running ? (
                <>
                  <svg className="loading-spinner-premium" style={{ width: '16px', height: '16px' }}></svg>
                  Running Enhanced Audit...
                </>
              ) : sessionId ? (
                <>
                  🔍 Run New Audit
                </>
              ) : (
                <>
                  🔒 Connect to Salesforce First
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Audits */}
        <div style={{ paddingBottom: 'var(--space-xl)' }}>
          <div className="bg-premium border-premium rounded-premium" style={{ overflow: 'hidden', boxShadow: '0 2px 8px var(--color-card-shadow)' }}>
            <div style={{ 
              padding: 'var(--space-lg)', 
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-bg-alt)'
            }}>
              <h3 style={{ 
                fontSize: 'var(--fs-h2)', 
                fontWeight: 'var(--fw-semibold)', 
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-xs)'
              }}>
                Recent Audit Sessions
              </h3>
              <p style={{ 
                fontSize: 'var(--fs-body)', 
                color: 'var(--color-text-secondary)',
                margin: 0
              }}>
                Click on any session to view detailed results
              </p>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {sessions.length === 0 ? (
                <li style={{ padding: 'var(--space-lg)' }}>
                  <p style={{ 
                    fontSize: 'var(--fs-body)', 
                    color: 'var(--color-text-secondary)',
                    margin: 0
                  }}>
                    No audit sessions yet. Run your first audit to get started!
                  </p>
                </li>
              ) : (
                sessions.map((session) => (
                  <li 
                    key={session.id} 
                    style={{ 
                      padding: 'var(--space-lg)', 
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => navigate(`/audit/${session.id}`)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-alt)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div style={{ 
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--color-bg-alt)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 'var(--space-md)'
                        }}>
                          <span style={{ fontSize: '16px' }}>📊</span>
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: 'var(--fs-body)', 
                            fontWeight: 'var(--fw-medium)', 
                            color: 'var(--color-text-primary)',
                            marginBottom: '2px'
                          }}>
                            {session.org_name}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--fs-small)', 
                            color: 'var(--color-text-secondary)'
                          }}>
                            {session.findings_count} findings • Potential savings: ${session.estimated_savings.annual_dollars?.toLocaleString()}/year
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 'var(--fs-small)', 
                        color: 'var(--color-text-secondary)'
                      }}>
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Org Profile Modal */}
      <OrgProfileModal 
        isOpen={showOrgProfile}
        onClose={() => setShowOrgProfile(false)}
        onSubmit={runAuditWithProfile}
        sessionId={sessionId}
      />
    </div>
  );
};

// Edit Assumptions Modal Component
const EditAssumptionsModal = ({ isOpen, onClose, onUpdate, assumptions }) => {
  const [editedAssumptions, setEditedAssumptions] = useState({
    admin_rate: 40,
    cleanup_time_per_field: 0.25,
    confusion_time_per_field: 2,
    reporting_efficiency: 50,
    email_alert_time: 3,
    ...assumptions
  });

  useEffect(() => {
    if (assumptions) {
      setEditedAssumptions({
        admin_rate: 40,
        cleanup_time_per_field: 0.25,
        confusion_time_per_field: 2,
        reporting_efficiency: 50,
        email_alert_time: 3,
        ...assumptions
      });
    }
  }, [assumptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedAssumptions);
    onClose();
  };

  const handleReset = () => {
    setEditedAssumptions({
      admin_rate: 40,
      cleanup_time_per_field: 0.25,
      confusion_time_per_field: 2,
      reporting_efficiency: 50,
      email_alert_time: 3
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔧 Edit Calculation Assumptions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            
            {/* Admin & Cleanup Rates */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">👨‍💼 Admin & Cleanup Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Admin Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedAssumptions.admin_rate}
                    onChange={(e) => setEditedAssumptions(prev => ({...prev, admin_rate: parseFloat(e.target.value)}))}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">U.S. average Salesforce admin rate</p>
                </div>
                <div>
                  <label className="form-label">Cleanup Time per Field (hours)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={editedAssumptions.cleanup_time_per_field}
                    onChange={(e) => setEditedAssumptions(prev => ({...prev, cleanup_time_per_field: parseFloat(e.target.value)}))}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">0.25 hours = 15 minutes per field</p>
                </div>
              </div>
            </div>

            {/* User Experience */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3">👥 User Experience Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">User Confusion Time per Field (min/month)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editedAssumptions.confusion_time_per_field}
                    onChange={(e) => setEditedAssumptions(prev => ({...prev, confusion_time_per_field: parseFloat(e.target.value)}))}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time lost per user per unused field per month</p>
                </div>
                <div>
                  <label className="form-label">Email Alert Time Saved (min per alert)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editedAssumptions.email_alert_time}
                    onChange={(e) => setEditedAssumptions(prev => ({...prev, email_alert_time: parseFloat(e.target.value)}))}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time saved per automated notification</p>
                </div>
              </div>
            </div>

            {/* Process Automation */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-3">🤖 Process Automation</h3>
              <div>
                <label className="form-label">Reporting Automation Efficiency (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editedAssumptions.reporting_efficiency}
                  onChange={(e) => setEditedAssumptions(prev => ({...prev, reporting_efficiency: parseInt(e.target.value)}))}
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of manual reporting time that can be automated</p>
              </div>
            </div>

            {/* Impact Preview */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-3">📊 Impact Preview</h3>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• <strong>Custom Field Cleanup:</strong> ${editedAssumptions.admin_rate}/hr × {editedAssumptions.cleanup_time_per_field}h = ${(editedAssumptions.admin_rate * editedAssumptions.cleanup_time_per_field).toFixed(2)} per field</p>
                <p>• <strong>User Confusion:</strong> {editedAssumptions.confusion_time_per_field} min/user/field/month</p>
                <p>• <strong>Reporting Automation:</strong> {editedAssumptions.reporting_efficiency}% of manual time saved</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-4 mt-8">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              🔄 Reset to Defaults
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                💾 Update Assumptions
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Finding Card Component with Apple-style Premium Design
const EnhancedFindingCard = ({ finding, index }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'var(--color-red-negative)';
      case 'Medium': return '#FF9500'; // Apple Orange
      case 'Low': return 'var(--color-green-positive)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getConfidenceBadge = (confidence) => {
    const icons = {
      'High': '🟢',
      'Medium': '🟡',
      'Low': '🔴'
    };

    return (
      <span className="confidence-badge">
        {icons[confidence] || icons['Medium']} {confidence || 'Medium'} Confidence
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatHours = (hours) => {
    if (!hours) return '0h';
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div 
      className="slide-in-up"
      style={{ 
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border-light)',
        backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)'
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-section-heading" style={{ marginBottom: 0 }}>{finding.title}</h4>
            <div className="flex items-center gap-2">
              {getConfidenceBadge(finding.confidence)}
              <span 
                className="confidence-badge"
                style={{ 
                  borderColor: getImpactColor(finding.impact),
                  color: getImpactColor(finding.impact)
                }}
              >
                {finding.impact} Impact
              </span>
            </div>
          </div>

          <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            {finding.description}
          </p>

          {/* Premium ROI Summary */}
          <div 
            className="rounded-premium border-premium" 
            style={{ 
              padding: 'var(--spacing-md)', 
              marginBottom: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-primary)'
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {finding.cleanup_cost && (
                <div>
                  <div className="text-card-number" style={{ color: 'var(--color-red-negative)' }}>
                    {formatCurrency(finding.cleanup_cost)}
                  </div>
                  <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>One-time Cost</div>
                </div>
              )}
              {finding.monthly_user_savings && (
                <div>
                  <div className="text-card-number text-positive">
                    {formatCurrency(finding.monthly_user_savings)}
                  </div>
                  <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>Monthly Savings</div>
                </div>
              )}
              {finding.annual_user_savings && (
                <div>
                  <div className="text-card-number text-accent">
                    {formatCurrency(finding.annual_user_savings)}
                  </div>
                  <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>Annual Savings</div>
                </div>
              )}
              {finding.net_annual_roi && (
                <div>
                  <div className="text-card-number" style={{ color: '#5856D6' }}>
                    {formatCurrency(finding.net_annual_roi)}
                  </div>
                  <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>Net Annual ROI</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats and Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-small" style={{ color: 'var(--color-text-secondary)' }}>
              {finding.time_savings_hours && (
                <span>⏱️ {formatHours(finding.time_savings_hours)}/month</span>
              )}
              <span>📊 {finding.affected_objects?.join(', ')}</span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary"
              style={{ fontSize: 'var(--font-size-small)' }}
            >
              {showDetails ? '👆 Hide Details' : '👇 See Details'}
            </button>
          </div>

          {/* Detailed Breakdown - Progressive Disclosure */}
          {showDetails && (
            <div 
              className="slide-in-up"
              style={{ 
                marginTop: 'var(--spacing-md)', 
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid var(--color-border-light)'
              }}
            >
              
              {/* Task Breakdown */}
              {finding.task_breakdown && finding.task_breakdown.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h5 className="text-section-heading">📋 Task Breakdown</h5>
                  <div className="space-y-2">
                    {finding.task_breakdown.map((task, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-premium border-premium"
                        style={{ 
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--color-bg-secondary)'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-small" style={{ fontWeight: 500 }}>{task.task}</div>
                            <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>{task.description}</div>
                            <div className="text-small text-accent" style={{ marginTop: 'var(--spacing-xs)' }}>👤 {task.role}</div>
                          </div>
                          <div className="text-right ml-4">
                            {task.type === 'one_time' ? (
                              <div>
                                <div className="text-small" style={{ fontWeight: 500, color: 'var(--color-red-negative)' }}>
                                  {formatCurrency(task.cost)}
                                </div>
                                <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                                  {formatHours(task.hours)} one-time
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-small text-positive" style={{ fontWeight: 500 }}>
                                  {formatCurrency(task.cost_per_month)}
                                </div>
                                <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                                  {formatHours(task.hours_per_month)}/month
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Attribution */}
              {finding.role_attribution && Object.keys(finding.role_attribution).length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h5 className="text-section-heading">👥 Role Attribution</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(finding.role_attribution).map(([role, attribution]) => (
                      <div 
                        key={role} 
                        className="rounded-premium"
                        style={{ 
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'rgba(10, 132, 255, 0.05)',
                          border: '1px solid rgba(10, 132, 255, 0.1)'
                        }}
                      >
                        <div className="text-small text-accent" style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                          {role}
                        </div>
                        {attribution.one_time_cost > 0 && (
                          <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                            One-time: {formatHours(attribution.one_time_hours)} ({formatCurrency(attribution.one_time_cost)})
                          </div>
                        )}
                        {attribution.monthly_savings > 0 && (
                          <div className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                            Monthly: {formatHours(attribution.monthly_hours)} ({formatCurrency(attribution.monthly_savings)})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculation Method */}
              {finding.salesforce_data?.calculation_method && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h5 className="text-section-heading">🧮 Calculation Method</h5>
                  <div 
                    className="rounded-premium"
                    style={{ 
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'rgba(255, 149, 0, 0.05)',
                      border: '1px solid rgba(255, 149, 0, 0.1)'
                    }}
                  >
                    <div className="text-small" style={{ color: '#D2691E' }}>
                      {finding.salesforce_data.calculation_method}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Premium Recommendation */}
          <div 
            className="rounded-premium"
            style={{ 
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(10, 132, 255, 0.05)',
              border: '1px solid rgba(10, 132, 255, 0.1)'
            }}
          >
            <h5 className="text-small text-accent" style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
              💡 Recommendation:
            </h5>
            <p className="text-small text-accent">{finding.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ultra-Clean Audit Results Component - Apple Inspired
const AuditResults = () => {
  const { sessionId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditAssumptions, setShowEditAssumptions] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openFindings, setOpenFindings] = useState(new Set());

  useEffect(() => {
    loadAuditData();
  }, [sessionId]);

  const loadAuditData = async () => {
    try {
      const response = await axios.get(`${API}/audit/${sessionId}`);
      setAuditData(response.data);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssumptions = async (newAssumptions) => {
    setUpdating(true);
    try {
      const response = await axios.post(`${API}/audit/${sessionId}/update-assumptions`, newAssumptions);
      setAuditData(response.data);
      alert('Assumptions updated successfully! Results have been recalculated.');
    } catch (error) {
      console.error('Failed to update assumptions:', error);
      alert('Failed to update assumptions. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await axios.get(`${API}/audit/${sessionId}/pdf`);
      alert('PDF report generated! In a real implementation, this would download the file.');
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const toggleFinding = (findingId) => {
    const newOpenFindings = new Set(openFindings);
    if (newOpenFindings.has(findingId)) {
      newOpenFindings.delete(findingId);
    } else {
      newOpenFindings.add(findingId);
    }
    setOpenFindings(newOpenFindings);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatHours = (hours) => {
    if (!hours) return '0h';
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <div className="audit-results">
        <header className="header">
          <Link to="/" className="logo gradient">SalesAudit Pro</Link>
        </header>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="loading-spinner-premium"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="audit-results">
        <header className="header">
          <Link to="/" className="logo gradient">SalesAudit Pro</Link>
        </header>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Audit not found</h2>
          <Link to="/dashboard" className="btn-outline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { summary, findings } = auditData;

  return (
    <main className="audit-results">
      {/* Ultra-Clean Header */}
      <header className="header">
        <Link to="/" className="logo gradient">SalesAudit Pro</Link>
        <nav>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </nav>
      </header>

      {/* 1️⃣ Hero Summary Strip */}
      <section className="summary-strip">
        <div className="stat">
          <h2 className="gradient">{summary.total_time_savings_hours}h</h2>
          <p>Time Savings/mo</p>
        </div>
        <div className="stat">
          <h2 className="gradient">{formatCurrency(summary.total_annual_roi)}</h2>
          <p>Annual ROI</p>
        </div>
        <div className="stat">
          <h2 className="gradient">Medium</h2>
          <p>Avg Confidence</p>
        </div>
        <button className="btn-primary" onClick={generatePDF}>
          📄 Download PDF
        </button>
        <button 
          className="btn-outline" 
          onClick={() => setShowEditAssumptions(true)}
          disabled={updating}
        >
          🔧 Edit Assumptions
        </button>
      </section>

      {/* 2️⃣ Clean Findings List */}
      <section className="findings-list">
        {findings.map((finding) => (
          <div 
            key={finding.id} 
            className={`finding ${openFindings.has(finding.id) ? 'open' : ''}`}
          >
            <button 
              className="finding-toggle"
              onClick={() => toggleFinding(finding.id)}
            >
              <span className="finding-title gradient">
                {finding.title}
              </span>
              <span className="finding-meta">
                {finding.cleanup_cost ? `${formatCurrency(finding.cleanup_cost)} one-time • ` : ''}
                {finding.monthly_user_savings ? `${formatCurrency(finding.monthly_user_savings)}/mo • ` : ''}
                {finding.net_annual_roi ? `${formatCurrency(finding.net_annual_roi)}/yr` : ''}
              </span>
              <span className="chevron">⌄</span>
            </button>
            <div className="finding-body">
              <p>{finding.recommendation}</p>
              
              {/* Mini ROI Breakdown */}
              {(finding.cleanup_cost || finding.monthly_user_savings || finding.annual_user_savings) && (
                <div className="roi-mini">
                  {finding.cleanup_cost && (
                    <div className="mini-stat">
                      <div className="number">{formatCurrency(finding.cleanup_cost)}</div>
                      <div className="label">One-time Cost</div>
                    </div>
                  )}
                  {finding.monthly_user_savings && (
                    <div className="mini-stat">
                      <div className="number">{formatCurrency(finding.monthly_user_savings)}</div>
                      <div className="label">Monthly Savings</div>
                    </div>
                  )}
                  {finding.annual_user_savings && (
                    <div className="mini-stat">
                      <div className="number">{formatCurrency(finding.annual_user_savings)}</div>
                      <div className="label">Annual Savings</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Edit Assumptions Modal */}
      <EditAssumptionsModal
        isOpen={showEditAssumptions}
        onClose={() => setShowEditAssumptions(false)}
        onUpdate={handleUpdateAssumptions}
        assumptions={auditData?.session?.custom_assumptions || {}}
      />
      
      {/* Premium Loading Overlay */}
      {updating && (
        <div className="loading-overlay-premium">
          <div className="loading-content-premium">
            <div className="loading-spinner-premium"></div>
            <span>Recalculating with new assumptions...</span>
          </div>
        </div>
      )}
    </main>
  );
};
};

// Simple About Page
const About = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About SalesAudit Pro</h1>
        <p className="text-gray-600 mb-4">
          SalesAudit Pro helps businesses identify inefficiencies, automation gaps, and revenue leaks 
          in their Salesforce organizations through comprehensive automated analysis.
        </p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-500">← Back to Home</Link>
      </div>
    </div>
  </div>
);

// OAuth Callback Component
const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  useEffect(() => {
    // This component will be loaded when Salesforce redirects back
    // The actual OAuth handling is done on the backend
    // If we reach this component, the OAuth was successful
    setStatus('success');
    
    // Give user a moment to see success message, then redirect
    setTimeout(() => {
      // The backend already redirected to /dashboard with session parameter
      // So we shouldn't reach this component normally
      navigate('/dashboard');
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {status === 'processing' ? (
          <>
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-gray-600">Completing Salesforce connection...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">Successfully Connected!</h2>
            <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

// Simple Contact Page
const Contact = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-4">
          Have questions about your Salesforce audit? We're here to help!
        </p>
        <p className="text-gray-600 mb-4">Email: support@salesauditpro.com</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-500">← Back to Home</Link>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audit/:sessionId" element={<AuditResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
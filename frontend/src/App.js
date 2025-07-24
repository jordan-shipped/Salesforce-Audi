import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);

  const handleConnectSalesforce = async () => {
    setConnecting(true);
    try {
      // Get OAuth authorization URL
      const response = await axios.get(`${API}/oauth/authorize`);
      
      if (response.data.authorization_url) {
        // Redirect to Salesforce OAuth
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      console.error('OAuth setup failed:', error);
      alert('Failed to connect to Salesforce. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">SalesAudit Pro</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/about" className="text-gray-500 hover:text-gray-700">About</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-700">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Uncover Hidden</span>
              <span className="block text-indigo-600">Salesforce Inefficiencies</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Get a comprehensive audit of your Salesforce org in minutes. Identify automation gaps, 
              unused fields, revenue leaks, and time-wasting processes with actionable recommendations.
            </p>
            
            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-500 text-white text-sm font-medium">
                    ⚡
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">5-Minute Analysis</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white text-sm font-medium">
                    💰
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">ROI Calculations</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white text-sm font-medium">
                    📊
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Detailed Reports</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-500 text-white text-sm font-medium">
                    🔒
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Read-Only Access</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleConnectSalesforce}
                disabled={connecting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 sm:w-auto sm:inline-flex sm:items-center"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting to Salesforce...
                  </>
                ) : (
                  <>
                    🚀 Connect with Salesforce
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <img
                className="w-full rounded-lg"
                src="https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHlzaXN8ZW58MHx8fHwxNzUzMjg0MzE3fDA&ixlib=rb-4.1.0&q=85"
                alt="Data Analysis Dashboard"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to optimize your Salesforce
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-xl">
                  ⏱️
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Time Savings Analysis</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Identify unused fields, duplicate processes, and inefficient workflows that waste your team's time.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white text-xl">
                  💸
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Revenue Leak Detection</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Find orphaned records, missing data, and broken processes that impact your bottom line.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white text-xl">
                  🤖
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Automation Opportunities</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Discover manual processes that can be automated to improve efficiency and reduce errors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      [department]: value ? parseInt(value) : null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const auditRequest = {
      session_id: sessionId,
      use_quick_estimate: useQuickEstimate,
      department_salaries: useQuickEstimate ? null : departmentSalaries
    };
    onSubmit(auditRequest);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
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
      const response = await axios.post(`${API}/audit/run`, auditRequest);
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
      console.error('Audit failed:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please connect to Salesforce again.');
        localStorage.removeItem('salesforce_session_id');
        setSessionId(null);
        navigate('/');
      } else {
        alert('Audit failed. Please try again.');
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">SalesAudit Pro</Link>
            </div>
            <div className="flex items-center space-x-4">
              {sessionId ? (
                <>
                  <span className="text-sm text-green-600">✅ Connected to Salesforce</span>
                  <button
                    onClick={disconnectSalesforce}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <span className="text-sm text-orange-600">⚠️ Not connected</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salesforce Audit Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Run comprehensive audits and view historical results</p>
            </div>
            <button
              onClick={runAudit}
              disabled={running || !sessionId}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                sessionId 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {running ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Real Audit...
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
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Audit Sessions</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Click on any session to view detailed results</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <li className="px-4 py-4 sm:px-6">
                  <p className="text-sm text-gray-500">No audit sessions yet. Run your first audit to get started!</p>
                </li>
              ) : (
                sessions.map((session) => (
                  <li key={session.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/audit/${session.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">📊</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{session.org_name}</div>
                          <div className="text-sm text-gray-500">
                            {session.findings_count} findings • Potential savings: ${session.estimated_savings.annual_dollars?.toLocaleString()}/year
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
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
    </div>
  );
};

// Audit Results Component
const AuditResults = () => {
  const { sessionId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const generatePDF = async () => {
    try {
      const response = await axios.get(`${API}/audit/${sessionId}/pdf`);
      alert('PDF report generated! In a real implementation, this would download the file.');
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Time Savings': return 'bg-blue-100 text-blue-800';
      case 'Revenue Leaks': return 'bg-red-100 text-red-800';
      case 'Automation Opportunities': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Audit not found</h2>
          <Link to="/dashboard" className="mt-4 text-indigo-600 hover:text-indigo-500">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { summary, findings } = auditData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">SalesAudit Pro</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back to Dashboard</Link>
              <button
                onClick={generatePDF}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Audit Results</h1>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🔍</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Findings</dt>
                      <dd className="text-3xl font-bold text-gray-900">{summary.total_findings}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏱️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Time Savings</dt>
                      <dd className="text-3xl font-bold text-gray-900">{summary.total_time_savings_hours}h</dd>
                      <dd className="text-xs text-gray-500">per month</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Annual ROI</dt>
                      <dd className="text-3xl font-bold text-green-600">${summary.total_annual_roi.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🚨</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">High Impact</dt>
                      <dd className="text-3xl font-bold text-red-600">{summary.high_impact_count}</dd>
                      <dd className="text-xs text-gray-500">critical issues</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Findings by Category */}
        <div className="px-4 sm:px-0">
          {Object.entries(summary.category_breakdown).map(([category, stats]) => {
            const categoryFindings = findings.filter(f => f.category === category);
            
            return (
              <div key={category} className="mb-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{category}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          {stats.count} findings • {stats.savings.toFixed(1)} hours saved • ${stats.roi.toLocaleString()} annual value
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                        {stats.count} issues
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      {categoryFindings.map((finding, index) => (
                        <div key={finding.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:px-6`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-gray-900">{finding.title}</h4>
                                <div className="flex space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(finding.impact)}`}>
                                    {finding.impact} Impact
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">{finding.description}</p>
                              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                                <span>💰 ${finding.roi_estimate.toLocaleString()}/year</span>
                                <span>⏱️ {finding.time_savings_hours}h saved/month</span>
                                <span>📊 {finding.affected_objects.join(', ')}</span>
                              </div>
                              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <h5 className="text-sm font-medium text-blue-900">💡 Recommendation:</h5>
                                <p className="mt-1 text-sm text-blue-800">{finding.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
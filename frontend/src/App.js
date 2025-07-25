import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component - Above the Fold, No Scrolling
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="App landing-page">
      {/* Hero Section - Compact Above the Fold */}
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
            className="btn-primary slide-in-up"
            onClick={() => navigate('/dashboard')}
          >
            Start Free Audit
          </button>
        </div>
      </section>

      {/* Features Section - Refined SVG Icons */}
      <section className="features">
        <div className="container">
          <div className="grid">
            <div className="feature-card slide-in-up">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="21 21l-4.35-4.35"></path>
                </svg>
              </div>
              <h3>Deep Analysis</h3>
              <p>Comprehensive audit of custom fields, data quality, and automation opportunities</p>
            </div>
            
            <div className="feature-card slide-in-up">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3>ROI Insights</h3>
              <p>Transparent cost-benefit analysis with customizable assumptions and detailed breakdowns</p>
            </div>
            
            <div className="feature-card slide-in-up">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M9 9h6v6H9z"></path>
                  <path d="M9 3v2"></path>
                  <path d="M15 3v2"></path>
                  <path d="M9 19v2"></path>
                  <path d="M15 19v2"></path>
                  <path d="M3 9h2"></path>
                  <path d="M3 15h2"></path>
                  <path d="M19 9h2"></path>
                  <path d="M19 15h2"></path>
                </svg>
              </div>
              <h3>Actionable Reports</h3>
              <p>Professional PDF reports with prioritized recommendations and implementation guidance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Stage Summary Panel Component
const StageSummaryPanel = ({ businessStage, summary }) => {
  if (!businessStage) return null;

  return (
    <div className="stage-summary-panel fade-in">
      <div className="stage-header">
        <div>
          <h2 className="stage-title">
            Stage {businessStage.stage}: {businessStage.name}
          </h2>
          <p className="stage-role">Your Role: {businessStage.role}</p>
        </div>
        <div className="priority-indicator">
          <span className="priority-score">Priority Focus</span>
        </div>
      </div>
      
      <div className="stage-bottom-line">
        "{businessStage.bottom_line}"
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card accent">
          <span className="metric-value">{summary?.total_time_savings_hours || 0} h/mo</span>
          <span className="metric-label">Time Saved</span>
        </div>
        <div className="metric-card accent">
          <span className="metric-value">${(summary?.total_annual_roi || 0).toLocaleString()}/yr</span>
          <span className="metric-label">ROI</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{summary?.total_findings || 0}</span>
          <span className="metric-label">Findings</span>
        </div>
      </div>
      
      {businessStage.constraints_and_actions && (
        <div className="stage-constraints">
          <h3 className="task-breakdown-title">Current Stage Focus:</h3>
          <div className="task-list">
            {businessStage.constraints_and_actions.map((action, index) => (
              <div key={index} className="task-item">
                <div className="task-info">
                  <div className="task-name">{action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Priority Filter Bar Component  
const PriorityFilterBar = ({ selectedDomain, onDomainChange, selectedPriority, onPriorityChange, domains, findings }) => {
  const priorities = ['All', 'High', 'Medium', 'Low'];
  
  return (
    <div className="priority-filter-bar">
      <div className="filter-group">
        <span className="filter-label">Domain:</span>
        <div className="filter-chips">
          <button 
            className={`filter-chip ${selectedDomain === 'All' ? 'active' : ''}`}
            onClick={() => onDomainChange('All')}
          >
            All
          </button>
          {domains.map(domain => (
            <button
              key={domain}
              className={`filter-chip ${selectedDomain === domain ? 'active' : ''}`}
              onClick={() => onDomainChange(domain)}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-group">
        <span className="filter-label">Priority:</span>
        <div className="filter-chips">
          {priorities.map(priority => (
            <button
              key={priority}
              className={`filter-chip ${selectedPriority === priority ? 'active' : ''}`}
              onClick={() => onPriorityChange(priority)}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Finding Accordion Component
const FindingAccordion = ({ finding, isExpanded, onToggle }) => {
  const getDomainClass = (domain) => {
    return domain?.toLowerCase().replace(/\s+/g, '-') || 'data-quality';
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className={`finding-accordion ${isExpanded ? 'expanded' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="finding-header-left">
          <span className={`domain-badge ${getDomainClass(finding.domain)}`}>
            {finding.domain || 'Data Quality'}
          </span>
          <h3 className="finding-title">{finding.title}</h3>
        </div>
        
        <div className="finding-header-right">
          <div className="priority-indicator">
            <span className="priority-score">{finding.priority_score || 1}</span>
            <span className="mini-stat">
              {formatCurrency(finding.total_annual_roi || finding.roi_estimate || 0)}/yr
            </span>
          </div>
          <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>
      
      <div className="accordion-body">
        <div className="accordion-content">
          <p className="finding-description">{finding.description}</p>
          
          {finding.stage_analysis && (
            <div className="stage-analysis">
              <p className="text-caption">
                <strong>Stage Relevance:</strong> This finding is particularly important for 
                Stage {finding.stage_analysis.current_stage} ({finding.stage_analysis.stage_name}) 
                organizations in the {finding.stage_analysis.stage_role} role.
              </p>
            </div>
          )}
          
          {finding.task_breakdown && finding.task_breakdown.length > 0 && (
            <div className="task-breakdown">
              <h4 className="task-breakdown-title">Task Breakdown:</h4>
              <div className="task-list">
                {finding.task_breakdown.map((task, index) => (
                  <div key={index} className="task-item">
                    <div className="task-info">
                      <div className="task-name">{task.task}</div>
                      <div className="task-description">{task.description}</div>
                    </div>
                    <div className="task-stats">
                      <div className="task-cost">
                        {task.type === 'one_time' 
                          ? formatCurrency(task.cost)
                          : `${formatCurrency(task.savings_per_month || task.cost_per_month)}/mo`
                        }
                      </div>
                      <div className="task-time">
                        {task.type === 'one_time' 
                          ? `${task.hours}h total`
                          : `${task.hours_per_month}h/mo`
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="finding-actions">
            <button className="btn-link">Edit Assumptions</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Input Form Component
const BusinessInputForm = ({ onSubmit, initialData }) => {
  const [revenue, setRevenue] = useState(initialData?.annual_revenue || '');
  const [headcount, setHeadcount] = useState(initialData?.employee_headcount || '');
  const [stagePreview, setStagePreview] = useState(null);

  useEffect(() => {
    const updateStagePreview = async () => {
      if (revenue || headcount) {
        try {
          const response = await axios.post(`${API}/business/stage`, {
            annual_revenue: revenue ? parseInt(revenue) : null,
            employee_headcount: headcount ? parseInt(headcount) : null
          });
          setStagePreview(response.data);
        } catch (error) {
          console.error('Error getting stage preview:', error);
        }
      }
    };

    const timeoutId = setTimeout(updateStagePreview, 300);
    return () => clearTimeout(timeoutId);
  }, [revenue, headcount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      annual_revenue: revenue ? parseInt(revenue) : null,
      employee_headcount: headcount ? parseInt(headcount) : null
    });
  };

  return (
    <form className="business-input-form" onSubmit={handleSubmit}>
      <div>
        <h3 className="business-input-title">Tell us about your business</h3>
        <p className="business-input-description">
          Help us provide stage-specific insights by sharing some basic information about your organization.
        </p>
      </div>
      
      <div className="input-row">
        <div className="input-group">
          <label className="input-label" htmlFor="revenue">Annual Revenue (USD)</label>
          <input
            id="revenue"
            type="number"
            className="input-field"
            placeholder="e.g., 5000000"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="headcount">Total Employees</label>
          <input
            id="headcount"
            type="number"
            className="input-field"
            placeholder="e.g., 50"
            value={headcount}
            onChange={(e) => setHeadcount(e.target.value)}
          />
        </div>
      </div>
      
      {stagePreview && (
        <div className="stage-preview">
          <p className="stage-preview-text">
            Based on your inputs, you're at <span className="stage-preview-stage">
              Stage {stagePreview.stage}: {stagePreview.name}
            </span> ({stagePreview.role})
          </p>
        </div>
      )}
      
      <div>
        <button type="submit" className="btn-primary">
          Start Stage-Based Audit
        </button>
      </div>
    </form>
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

// Dashboard Component
// SessionCard Component
const SessionCard = ({ id, orgName, findingsCount, annualSavings, date, onClick }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const dt = new Date(date);
  const formattedDate = dt.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  const formattedTime = dt.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className="session-card"
      role="listitem"
      tabIndex="0"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="session-info">
        <p className="session-org gradient-text">{orgName}</p>
        <p className="session-meta">
          {findingsCount} findings • <span className="gradient-text">
            {formatCurrency(annualSavings)}/yr
          </span>
        </p>
      </div>
      <div className="session-timestamp">
        <p className="session-date">{formattedDate}</p>
        <p className="session-time">{formattedTime}</p>
      </div>
    </div>
  );
};

// Ultra-Clean Dashboard Component - Properly Wired Logic
const Dashboard = () => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('salesforce_session_id'));
  const [connected, setConnected] = useState(!!localStorage.getItem('salesforce_session_id'));
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showToast, setShowToast] = useState(false);
  // No more pagination; show all sessions
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
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
      localStorage.setItem('salesforce_session_id', newSessionId);
      setSessionId(newSessionId);
      setConnected(true);
      setShowToast(true); // Show success toast
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/audit/sessions`);
      console.log('Sessions response:', response.data); // Debug log
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = `${API}/oauth/authorize`;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('salesforce_session_id');
    setSessionId(null);
    setConnected(false);
    setSessions([]);
    navigate('/'); // Navigate back to home page
  };

  const handleRunAudit = () => {
    if (!connected) {
      handleConnect();
      return;
    }
    setShowOrgProfile(true);
  };

  const runAuditWithProfile = async (departmentSalaries) => {
    setRunning(true);
    setShowOrgProfile(false);
    
    try {
      const response = await axios.post(`${API}/run-audit`, {
        session_id: sessionId,
        department_salaries: departmentSalaries,
        use_quick_estimate: false
      });
      
      if (response.data.session_id) {
        // Refresh sessions list
        await loadSessions();
        navigate(`/audit/${response.data.session_id}`);
      }
    } catch (error) {
      console.error('Audit failed:', error);
      alert('Audit failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  // Show all sessions
  const visibleSessions = sessions;

  return (
    <main className="dashboard">
      {/* Success Toast Notification */}
      {showToast && (
        <div className="toast toast--success">
          <span className="toast__icon" aria-hidden="true">✓</span>
          <span className="toast__message">Connected to Salesforce</span>
        </div>
      )}

      {/* 1️⃣ Dashboard Top Bar - Disconnect & Status */}
      <section className="dashboard__top-bar">
        {sessionId ? (
          <>
            <button
              className="dashboard__disconnect"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
            <div className="status-text status--ok">
              <span className="status-icon">⚡︎</span>
              <span className="status-label">Connected</span>
            </div>
          </>
        ) : (
          <>
            <div></div> {/* Empty div to maintain spacing */}
            <div className="status-text status--alert">
              Not Connected
            </div>
          </>
        )}
      </section>

      {/* 2️⃣ History Header with New Audit Button - Only When Connected */}
      {sessionId && (
        <div className="history-header">
          <h1 className="sessions-header" id="sessions-history">
            Audit History
          </h1>
          <button className="new-audit" onClick={handleRunAudit}>
            <span className="new-audit-icon">+</span>
            New Audit
          </button>
        </div>
      )}

      {/* 2.5️⃣ Apple-style View Mode Tabs - Only When Connected */}
      {sessionId && (
        <div role="tablist" aria-label="View mode" className="view-mode-tabs">
          <button
            role="tab"
            aria-selected={viewMode === 'grid'}
            className={`tab-button ${viewMode === 'grid' ? 'tab-button--active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`tab-button ${viewMode === 'list' ? 'tab-button--active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      )}

      {/* 3️⃣ Sessions Area - Dynamic Grid/List Layout */}
      <section className={viewMode === 'grid' ? 'sessions-list sessions-list--grid' : 'sessions-list sessions-list--list'} aria-labelledby="sessions-history">
        {/* Loading State - Skeleton Grid */}
        {loading && (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="loading-card"></div>
            ))}
          </>
        )}
        
        {/* Empty State - Show when not loading and no sessions */}
        {!loading && sessions.length === 0 && (
          <div className="empty-card premium">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M7 7h10v10H7z"></path>
                <path d="M7 3v2"></path>
                <path d="M17 3v2"></path>
                <path d="M7 19v2"></path>
                <path d="M17 19v2"></path>
                <path d="M3 7h2"></path>
                <path d="M3 17h2"></path>
                <path d="M19 7h2"></path>
                <path d="M19 17h2"></path>
              </svg>
            </div>
            <h3 className="empty-title">No Audit Sessions Yet</h3>
            <p className="empty-sub">
              Connect your Salesforce org to run your first audit and unlock insights.
            </p>
            <button onClick={handleConnect} className="btn-primary">
              Connect to Salesforce
            </button>
          </div>
        )}
        
        {/* Sessions - Show all sessions */}
        {!loading && sessions.length > 0 && visibleSessions.map((session) => (
          <SessionCard 
            key={session.id}
            id={session.id}
            orgName={session.org_name}
            findingsCount={session.findings_count}
            annualSavings={session.estimated_savings?.annual_dollars || 0}
            date={session.created_at}
            onClick={() => navigate(`/audit/${session.id}`)}
          />
        ))}
      </section>

      {/* Org Profile Modal */}
      <OrgProfileModal 
        isOpen={showOrgProfile}
        onClose={() => setShowOrgProfile(false)}
        onSubmit={runAuditWithProfile}
        sessionId={sessionId}
      />
    </main>
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

// Simple About Page

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

// OAuth Callback Component - Apple-Style Floating Card
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('success');

  useEffect(() => {
    // Show success state briefly, then redirect
    setStatus('success');
    
    // Give user a moment to see the success message
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  }, [navigate]);

  return (
    <div className="redirect-overlay">
      <div className="redirect-card">
        {/* Success Icon */}
        <div className="redirect-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#28CD41"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="redirect-card__title">
          Successfully Connected
        </h1>

        {/* Subtitle */}
        <p className="redirect-card__subtitle">
          Redirecting to your dashboard...
        </p>

        {/* Spinner */}
        <div className="redirect-card__spinner">
          <div className="spinner"></div>
        </div>
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
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Bolt, ChartPie, FileText, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Landing Page Component - Apple-Grade Design System
const LandingPage = () => {
  const [showPreAuditModal, setShowPreAuditModal] = useState(false);
  const { hasBusinessInfo, saveBusinessInfo } = useBusinessInfo();

  const handleStartFreeAudit = () => {
    if (!hasBusinessInfo) {
      setShowPreAuditModal(true);
    } else {
      // Business info already exists, go straight to OAuth
      window.location.href = `${API}/oauth/authorize`;
    }
  };

  const handleBusinessInfoSubmit = (businessInfo) => {
    console.log('Business info submitted:', businessInfo);
    
    // Save to context
    saveBusinessInfo(businessInfo);
    setShowPreAuditModal(false);
    
    // Then redirect to OAuth
    window.location.href = `${API}/oauth/authorize`;
  };

  return (
    <div className="LandingPageWrapper">
      <div className="LandingPageContent">
        {/* Hero Section */}
        <section className="HeroSection">
          <div className="HeroContent">
            <h1 className="HeroTitle">Optimize Your Salesforce</h1>
            <h2 className="HeroSubtitle">
              <span className="PrimaryGradientText">Like Never Before</span>
            </h2>
            <p className="HeroCopy">
              Discover hidden inefficiencies, automate manual processes, and unlock 
              substantial cost savings with our AI-powered Salesforce audit tool.
            </p>
            <button 
              onClick={handleStartFreeAudit} 
              className="HeroCTA apple-btn-primary"
            >
              Start Free Audit
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <div className="FeaturesGrid">
          <div className="apple-card FeatureCard">
            <Bolt className="FeatureIcon" />
            <h3 className="FeatureTitle">Instant Analysis</h3>
            <p className="FeatureDescription">Complete Salesforce audit in under 60 seconds. No setup, no waiting.</p>
          </div>
          
          <div className="apple-card FeatureCard">
            <ChartPie className="FeatureIcon" />
            <h3 className="FeatureTitle">Smart Insights</h3>
            <p className="FeatureDescription">AI-powered recommendations tailored to your business size and industry.</p>
          </div>
          
          <div className="apple-card FeatureCard">
            <FileText className="FeatureIcon" />
            <h3 className="FeatureTitle">Actionable Reports</h3>
            <p className="FeatureDescription">Professional PDF reports with prioritized recommendations and guidance.</p>
          </div>
        </div>
      </div>

      {/* PreAudit Modal */}
      <PreAuditModal
        isOpen={showPreAuditModal}
        onClose={() => setShowPreAuditModal(false)}
        onSubmit={handleBusinessInfoSubmit}
      />
    </div>
  );
};

// Stage Summary Panel Component - Apple-Grade Hormozi Style
const StageSummaryPanel = ({ businessStage, summary }) => {
  if (!businessStage) return null;

  // Parse constraints and next steps from the constraints_and_actions array
  const parseConstraintsAndActions = (actions) => {
    if (!actions || !Array.isArray(actions)) return { constraints: [], nextSteps: [] };
    
    let constraints = [];
    let nextSteps = [];
    
    // Stage-specific parsing rules
    if (businessStage.stage === 4) {
      // Stage 4 has explicit "Constraints:" and "Quick Wins:" sections
      let isConstraints = false;
      let isQuickWins = false;
      
      actions.forEach(item => {
        const text = item.toLowerCase();
        
        if (text.includes('constraints:')) {
          isConstraints = true;
          isQuickWins = false;
          return;
        } else if (text.includes('quick wins:')) {
          isConstraints = false;
          isQuickWins = true;
          return;
        }
        
        if (isConstraints && (text.includes('weak process') || text.includes('data silos') || text.includes('inefficient'))) {
          constraints.push(item);
        } else if (isQuickWins && (text.includes('centralize') || text.includes('standardize') || text.includes('automate'))) {
          nextSteps.push(item);
        }
      });
    } else {
      // For other stages, split actions roughly in half or use content-based rules
      const mid = Math.ceil(actions.length / 2);
      
      // Simple heuristic: first half as constraints, second half as next steps
      constraints = actions.slice(0, mid);
      nextSteps = actions.slice(mid);
      
      // If no clear split, at least ensure some content in both sections
      if (constraints.length === 0 && nextSteps.length > 0) {
        constraints = [nextSteps.shift()]; // Move first next step to constraints
      }
      if (nextSteps.length === 0 && constraints.length > 1) {
        nextSteps = [constraints.pop()]; // Move last constraint to next steps
      }
    }
    
    // Fallback: ensure both sections have content
    if (constraints.length === 0 && nextSteps.length === 0) {
      constraints = ["No specific constraints identified for this stage"];
      nextSteps = ["Focus on the key actions for your current business stage"];
    } else if (constraints.length === 0) {
      constraints = ["Review and optimize current processes"];
    } else if (nextSteps.length === 0) {
      nextSteps = ["Implement the identified improvements"];
    }
    
    return { constraints, nextSteps };
  };

  const { constraints, nextSteps } = parseConstraintsAndActions(businessStage.constraints_and_actions);

  return (
    <div className="stage-summary-panel fade-in">
      {/* Header Section */}
      <div className="stage-header-section">
        <h2 className="stage-title-large">
          Stage {businessStage.stage}: {businessStage.name}
        </h2>
        <p className="stage-role-subtitle">{businessStage.role}</p>
        <p className="stage-bottom-line-quote">"{businessStage.bottom_line}"</p>
      </div>
      
      {/* Metrics Grid */}
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
      
      {/* Two-Column Hormozi-Style Layout */}
      <div className="hormozi-two-column">
        <div className="constraints-column">
          <h3 className="column-header">Your Primary Constraints</h3>
          <ul className="constraint-list">
            {constraints.map((constraint, index) => (
              <li key={index} className="constraint-item">{constraint}</li>
            ))}
          </ul>
        </div>
        
        <div className="next-steps-column">
          <h3 className="column-header">Your Next Steps</h3>
          <ul className="next-steps-list">
            {nextSteps.map((step, index) => (
              <li key={index} className="next-step-item">{step}</li>
            ))}
          </ul>
        </div>
      </div>
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

// PreAuditModal Component - Apple-Grade Business Info Collection
const PreAuditModal = ({ isOpen, onClose, onSubmit }) => {
  const [revenueBucket, setRevenueBucket] = useState('');
  const [headcountBucket, setHeadcountBucket] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const revenueBuckets = [
    "Under $100K", "$100K – $250K", "$250K – $500K", "$500K – $1M", 
    "$1M – $3M", "$3M – $10M", "$10M – $30M", "$30M+"
  ];

  const headcountBuckets = [
    "Just me, no revenue", "Just me, some revenue", "Me & vendors",
    "2 – 4", "5 – 9", "10 – 19", "20 – 49", "50 – 99", "100 – 249", "250 – 500"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!revenueBucket || !headcountBucket) {
      setError('Please select both annual revenue and employee count.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await axios.post(`${API}/session/business-info`, {
        revenue_bucket: revenueBucket,
        headcount_bucket: headcountBucket
      });

      if (response.data.success) {
        // Store in localStorage for session persistence
        localStorage.setItem('business_session_id', response.data.business_session_id);
        localStorage.setItem('business_info', JSON.stringify({
          revenue_bucket: revenueBucket,
          headcount_bucket: headcountBucket
        }));

        onSubmit({
          business_session_id: response.data.business_session_id,
          revenue_bucket: revenueBucket,
          headcount_bucket: headcountBucket
        });
      }
    } catch (error) {
      console.error('Failed to save business info:', error);
      setError('We couldn\'t save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal apple-business-modal">
        {/* Close button */}
        <button className="apple-modal-close" onClick={onClose}>⊗</button>
        
        {/* Header */}
        <div className="apple-modal-header">
          <h3 className="apple-modal-title">Tell us about your business</h3>
          <p className="apple-modal-subtitle">Help us tailor your audit experience.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="apple-business-form">
          <div className="apple-form-row">
            <div className="apple-form-group">
              <label className="apple-form-label">Annual Revenue</label>
              <select
                value={revenueBucket}
                onChange={(e) => setRevenueBucket(e.target.value)}
                className="apple-form-select"
                required
              >
                <option value="">Select...</option>
                {revenueBuckets.map(bucket => (
                  <option key={bucket} value={bucket}>{bucket}</option>
                ))}
              </select>
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Total Employees</label>
              <select
                value={headcountBucket}
                onChange={(e) => setHeadcountBucket(e.target.value)}
                className="apple-form-select"
                required
              >
                <option value="">Select...</option>
                {headcountBuckets.map(bucket => (
                  <option key={bucket} value={bucket}>{bucket}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="apple-form-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="apple-btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Business Info Context Provider
const BusinessInfoContext = React.createContext();

const BusinessInfoProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [hasBusinessInfo, setHasBusinessInfo] = useState(false);

  useEffect(() => {
    // Check for stored business info on app load
    const storedInfo = localStorage.getItem('business_info');
    const businessSessionId = localStorage.getItem('business_session_id');
    
    if (storedInfo && businessSessionId) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setBusinessInfo({
          ...parsedInfo,
          business_session_id: businessSessionId
        });
        setHasBusinessInfo(true);
      } catch (error) {
        console.error('Failed to parse stored business info:', error);
        // Clear invalid data
        localStorage.removeItem('business_info');
        localStorage.removeItem('business_session_id');
      }
    }
  }, []);

  const saveBusinessInfo = (info) => {
    setBusinessInfo(info);
    setHasBusinessInfo(true);
  };

  const clearBusinessInfo = () => {
    setBusinessInfo(null);
    setHasBusinessInfo(false);
    localStorage.removeItem('business_info');
    localStorage.removeItem('business_session_id');
  };

  return (
    <BusinessInfoContext.Provider value={{
      businessInfo,
      hasBusinessInfo,
      saveBusinessInfo,
      clearBusinessInfo
    }}>
      {children}
    </BusinessInfoContext.Provider>
  );
};

const useBusinessInfo = () => {
  const context = React.useContext(BusinessInfoContext);
  if (!context) {
    throw new Error('useBusinessInfo must be used within BusinessInfoProvider');
  }
  return context;
};
const BusinessInputForm = ({ onSubmit, initialData }) => {
  const { businessInfo } = useBusinessInfo();
  
  // Use stored business info as initial values, then any passed initialData, then defaults
  const getInitialRevenue = () => {
    if (initialData?.revenue_range) return initialData.revenue_range;
    if (businessInfo?.revenue_bucket) {
      // Convert backend format to frontend format
      const mapping = {
        "Under $100K": "<100k",
        "$100K – $250K": "100k–250k", 
        "$250K – $500K": "250k–500k",
        "$500K – $1M": "500k–1M",
        "$1M – $3M": "1M–3M",
        "$3M – $10M": "3M–10M", 
        "$10M – $30M": "10M–30M",
        "$30M+": "30M+"
      };
      return mapping[businessInfo.revenue_bucket] || '';
    }
    return '';
  };
  
  const getInitialEmployees = () => {
    if (initialData?.employee_range) return initialData.employee_range;
    if (businessInfo?.headcount_bucket) {
      // Convert backend format to frontend format
      const mapping = {
        "Just me, no revenue": "0-only",
        "Just me, some revenue": "0-some", 
        "Me & vendors": "vendors",
        "2 – 4": "2–4",
        "5 – 9": "5–9",
        "10 – 19": "10–19",
        "20 – 49": "20–49",
        "50 – 99": "50–99",
        "100 – 249": "100–249",
        "250 – 500": "250–500"
      };
      return mapping[businessInfo.headcount_bucket] || '';
    }
    return '';
  };

  const [revenue, setRevenue] = useState(getInitialRevenue());
  const [employees, setEmployees] = useState(getInitialEmployees());

  // Mapping picklist values to numeric ranges for backend processing
  const revenueMapping = {
    '<100k': 50000,        // Mid-point of 0-100k
    '100k–250k': 175000,   // Mid-point 
    '250k–500k': 375000,   // Mid-point
    '500k–1M': 750000,     // Mid-point
    '1M–3M': 2000000,      // Mid-point
    '3M–10M': 6500000,     // Mid-point
    '10M–30M': 20000000,   // Mid-point
    '30M+': 150000000      // $150M to ensure Stage 9 (Capitalize) ≥100M
  };

  const employeeMapping = {
    '0-only': 0,
    '0-some': 1,
    'vendors': 2,
    '2–4': 3,
    '5–9': 7,
    '10–19': 15,
    '20–49': 35,
    '50–99': 75,
    '100–249': 175,
    '250–500': 375
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert picklist selections to numeric values
    const numericRevenue = revenueMapping[revenue] || 1000000; // Default $1M
    const numericEmployees = employeeMapping[employees] || 50;  // Default 50

    onSubmit({
      annual_revenue: numericRevenue,
      employee_headcount: numericEmployees,
      revenue_range: revenue,
      employee_range: employees
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
          <label className="input-label" htmlFor="revenue">Annual Revenue</label>
          <select
            id="revenue"
            name="revenue"
            className="input-field"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            required
          >
            <option value="">Select revenue range...</option>
            <option value="<100k">Under $100K</option>
            <option value="100k–250k">$100K to $250K</option>
            <option value="250k–500k">$250K to $500K</option>
            <option value="500k–1M">$500K to $1M</option>
            <option value="1M–3M">$1M to $3M</option>
            <option value="3M–10M">$3M to $10M</option>
            <option value="10M–30M">$10M to $30M</option>
            <option value="30M+">$30M+</option>
          </select>
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="employees">Total Employees</label>
          <select
            id="employees"
            name="employees"
            className="input-field"
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            required
          >
            <option value="">Select employee count...</option>
            <option value="0-only">Just me, no revenue</option>
            <option value="0-some">Just me, some revenue</option>
            <option value="vendors">Me and vendors</option>
            <option value="2–4">2 to 4</option>
            <option value="5–9">5 to 9</option>
            <option value="10–19">10 to 19</option>
            <option value="20–49">20 to 49</option>
            <option value="50–99">50 to 99</option>
            <option value="100–249">100 to 249</option>
            <option value="250–500">250 to 500</option>
          </select>
        </div>
      </div>
      
      <div>
        <button type="submit" className="btn-primary" disabled={!revenue || !employees}>
          Start Stage-Based Audit
        </button>
      </div>
    </form>
  );
};

// Apple-Grade "Choose Your Audit" Modal Component
const OrgProfileModal = ({ isOpen, onClose, onSubmit, sessionId }) => {
  const [auditMode, setAuditMode] = useState('quick'); // 'quick' or 'custom'
  const [departmentSalaries, setDepartmentSalaries] = useState({
    customer_service: '',
    sales: '',
    marketing: '',
    engineering: '',
    executives: ''
  });

  // Reset to quick mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuditMode('quick');
    }
  }, [isOpen]);

  const handleSalaryChange = (department, value) => {
    setDepartmentSalaries(prev => ({
      ...prev,
      [department]: value && value.trim() !== '' ? parseInt(value) : null
    }));
  };

  const handleSegmentChange = (mode) => {
    setAuditMode(mode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const auditRequest = {
        session_id: sessionId,
        use_quick_estimate: auditMode === 'quick',
        department_salaries: auditMode === 'quick' ? null : {
          customer_service: departmentSalaries.customer_service || null,
          sales: departmentSalaries.sales || null,
          marketing: departmentSalaries.marketing || null,
          engineering: departmentSalaries.engineering || null,
          executives: departmentSalaries.executives || null
        }
      };
      
      console.log('Choose Your Audit submitting:', auditRequest);
      
      // Analytics tracking
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('audit_option_selected', { 
          mode: auditMode
        });
      }
      
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
    <div className="choose-audit-overlay" onClick={onClose}>
      <div 
        className="choose-audit-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="choose-audit-title"
        aria-modal="true"
      >
        {/* Minimalist Close Control */}
        <button 
          onClick={onClose} 
          className="choose-audit-close"
          aria-label="Close audit options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Title - Apple Typography */}
        <h2 id="choose-audit-title" className="choose-audit-title">
          Choose Your Audit
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Native SF-Style Segmented Control */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segment ${auditMode === 'quick' ? 'selected' : ''}`}
              onClick={() => handleSegmentChange('quick')}
            >
              Quick
            </button>
            <button
              type="button"
              className={`segment ${auditMode === 'custom' ? 'selected' : ''}`}
              onClick={() => handleSegmentChange('custom')}
            >
              Custom
            </button>
          </div>

          {/* Contextual Content - Progressive Disclosure */}
          <div className="detail-pane">
            {auditMode === 'quick' && (
              <div className="quick-detail" key="quick">
                <p className="detail-text">
                  We'll use U.S. national salary averages for your hourly-rate calculations.
                </p>
              </div>
            )}

            {auditMode === 'custom' && (
              <div className="custom-detail" key="custom">
                <div className="salary-fields">
                  {Object.entries(defaultSalaries).map(([dept, defaultValue]) => (
                    <div key={dept} className="salary-field">
                      <label className="field-label">
                        {dept.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        placeholder={`$${defaultValue.toLocaleString()}`}
                        value={departmentSalaries[dept] || ''}
                        onChange={(e) => handleSalaryChange(dept, e.target.value)}
                        className="salary-field-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Button - systemBlue Gradient */}
          <div className="audit-button-container">
            <button
              type="submit"
              className="audit-start-button-primary"
            >
              Start Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
// SessionCard Component - Fixed for proper session data handling
const SessionCard = ({ session, index, onClick }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  // Safe date handling
  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    
    try {
      const dt = new Date(dateValue);
      if (isNaN(dt.getTime())) return 'Invalid date';
      
      const formattedDate = dt.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
      const formattedTime = dt.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
      
      return { formattedDate, formattedTime };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { formattedDate: 'Invalid date', formattedTime: '' };
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Extract session data with safe defaults
  const orgName = session?.org_name || 'Unknown Org';
  const findingsCount = session?.findings_count || 0;
  const annualSavings = session?.estimated_savings?.annual_dollars || 0;
  const dateInfo = formatDate(session?.created_at);

  return (
    <div 
      className="session-card fade-in"
      role="listitem"
      tabIndex="0"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${index * 0.1}s` }}
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
        <p className="session-date">{dateInfo.formattedDate}</p>
        <p className="session-time">{dateInfo.formattedTime}</p>
      </div>
    </div>
  );
};

// Ultra-Clean Dashboard Component - Properly Wired Logic
const Dashboard = () => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('salesforce_session_id'));
  const [connected, setConnected] = useState(!!localStorage.getItem('salesforce_session_id'));
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
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
      localStorage.setItem('salesforce_session_id', newSessionId);
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
    setLoading(true);
    try {
      const response = await axios.get(`${API}/audit/sessions`);
      console.log('Sessions response:', response.data);
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
    navigate('/');
  };

  const handleNewAudit = () => {
    if (!connected) {
      handleConnect();
      return;
    }
    // Skip business input form, go directly to OrgProfileModal
    setShowOrgProfile(true);
  };

  const runAuditWithProfile = async (auditRequest) => {
    setRunning(true);
    setShowOrgProfile(false);
    
    try {
      console.log('🔍 Starting audit with session_id:', sessionId);
      console.log('💼 Business info from context:', businessInfo);
      
      // Convert businessInfo from context to the format expected by backend
      let businessInputs = null;
      if (businessInfo) {
        // Convert the picklist format from PreAuditModal to numeric format
        const revenueMapping = {
          "Under $100K": 50000,        
          "$100K – $250K": 175000,   
          "$250K – $500K": 375000,   
          "$500K – $1M": 750000,     
          "$1M – $3M": 2000000,      
          "$3M – $10M": 6500000,     
          "$10M – $30M": 20000000,   
          "$30M+": 150000000      
        };

        const employeeMapping = {
          "Just me, no revenue": 0,
          "Just me, some revenue": 1,
          "Me & vendors": 2,
          "2 – 4": 3,
          "5 – 9": 7,
          "10 – 19": 15,
          "20 – 49": 35,
          "50 – 99": 75,
          "100 – 249": 175,
          "250 – 500": 375
        };

        businessInputs = {
          annual_revenue: revenueMapping[businessInfo.revenue_bucket] || 1000000,
          employee_headcount: employeeMapping[businessInfo.headcount_bucket] || 50,
          revenue_range: businessInfo.revenue_bucket,
          employee_range: businessInfo.headcount_bucket
        };
      }
      
      // Add business inputs to the audit request
      const enhancedRequest = {
        ...auditRequest,
        session_id: sessionId, // Ensure session_id is included
        business_inputs: businessInputs
      };
      
      console.log('🚀 Sending audit request:', enhancedRequest);
      
      const response = await axios.post(`${API}/audit/run`, enhancedRequest, {
        timeout: 30000 // 30 second timeout
      });
      
      console.log('✅ Audit response received:', response.data);
      
      // Check if we got a valid session ID - be more flexible with response structure
      const auditId = response.data?.session_id;
      
      if (auditId) {
        console.log('🎯 Got audit session ID:', auditId);
        
        // Navigate to results IMMEDIATELY - don't wait for sessions refresh
        console.log('🧭 Navigating to results page...');
        navigate(`/audit/${auditId}`);
        
        // Refresh sessions list in background (no await needed)
        setTimeout(async () => {
          console.log('🔄 Refreshing sessions list...');
          try {
            await loadSessions();
          } catch (refreshError) {
            console.warn('Failed to refresh sessions:', refreshError);
          }
        }, 1000);
        
      } else {
        console.error('❌ No session_id in response:', response.data);
        console.error('❌ Full response structure:', JSON.stringify(response.data, null, 2));
        alert('Audit completed but no session ID returned. Please check the audit history.');
      }
      
    } catch (error) {
      console.error('💥 Audit failed with error:', error);
      
      // Enhanced error handling for different error types
      if (error.response) {
        console.error('📝 Error response status:', error.response.status);
        console.error('📝 Error response data:', error.response.data);
        
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Unknown server error';
        
        if (error.response.status === 401) {
          alert('Authentication expired. Please reconnect to Salesforce and try again.');
          // Clear invalid session
          localStorage.removeItem('salesforce_session_id');
          setSessionId(null);
          setConnected(false);
        } else if (error.response.status === 500) {
          // Server error - show user-friendly message
          console.error('🚨 Server error details:', errorDetail);
          alert(`Oops! Something went wrong on our end. Our team has been notified.\n\nTechnical details: ${errorDetail.substring(0, 100)}...`);
        } else {
          alert(`Audit failed: ${errorDetail}`);
        }
      } else if (error.request) {
        console.error('📝 Error request:', error.request);
        alert('Network error: Unable to reach the server. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        console.error('📝 Request timeout');
        alert('The audit is taking longer than expected. Please try again or contact support if this persists.');
      } else {
        console.error('📝 Error message:', error.message);
        
        // Check for specific error patterns
        if (error.message.includes('NoneType') || error.message.includes('not supported between instances')) {
          console.error('🚨 NONE COMPARISON ERROR DETECTED:', error.message);
          alert(`We detected a data processing issue. Our team has been notified.\n\nError: ${error.message}`);
        } else {
          alert(`Audit failed: ${error.message}`);
        }
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Success Toast */}
      {showToast && (
        <div className="toast">
          <span className="toast__icon">⚡️</span>
          Successfully connected to Salesforce!
        </div>
      )}

      {/* Running Overlay */}
      {running && (
        <div className="loading-overlay-premium">
          <div className="loading-content-premium">
            <div className="loading-spinner-premium"></div>
            <span>Running your audit...</span>
          </div>
        </div>
      )}

      {/* Connection Strip */}
      <div className="dashboard__top-bar">
        <div className="status-text status--ok">
          <span className="status-icon">⚡︎</span>
          {connected ? 'Connected to Salesforce' : ''}
        </div>
        <div className="status-text status--alert">
          {connected ? (
            <button onClick={handleDisconnect} className="dashboard__disconnect">
              Disconnect
            </button>
          ) : 'Not Connected'}
        </div>
      </div>

      <div className="dashboard-content">
        {/* History Header - Only show when connected */}
        {connected && (
          <div className="history-header">
            <h1 className="sessions-header">Audit History</h1>
            <button onClick={handleNewAudit} className="new-audit">
              <span className="new-audit-icon">+</span>
              New Audit
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="sessions-list">
          {!connected ? (
            <div className="empty-card premium">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v5h5M3 21v-5h5m8-12v5h5m0 8v-5h-5"></path>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 1 9-9"></path>
                </svg>
              </div>
              <h2 className="empty-title">No Audit Sessions Yet</h2>
              <p className="empty-sub">
                Connect your Salesforce org to run your first audit and unlock insights.
              </p>
              <button onClick={handleConnect} className="btn-primary">
                Connect to Salesforce
              </button>
            </div>
          ) : loading ? (
            // Loading skeleton cards
            <div className="sessions-list--grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="loading-card"></div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-card premium">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v5h5M3 21v-5h5m8-12v5h5m0 8v-5h-5"></path>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 1 9-9"></path>
                </svg>
              </div>
              <h2 className="empty-title">No Audit Sessions Yet</h2>
              <p className="empty-sub">
                Run your first audit to discover optimization opportunities.
              </p>
              <button onClick={handleNewAudit} className="btn-primary">
                Start Your First Audit
              </button>
            </div>
          ) : (
            <div className={`sessions-list--${viewMode}`}>
              {sessions.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  onClick={() => navigate(`/audit/${session.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

// Simple About Page

// Ultra-Clean Audit Results Component - Apple Inspired
const AuditResults = () => {
  const { sessionId } = useParams();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditAssumptions, setShowEditAssumptions] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openFindings, setOpenFindings] = useState(new Set());
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [auditStatus, setAuditStatus] = useState('loading');

  useEffect(() => {
    loadAuditData();
  }, [sessionId]);

  // Polling effect for processing audits
  useEffect(() => {
    let pollInterval;
    
    if (auditStatus === 'processing') {
      pollInterval = setInterval(async () => {
        console.log('🔄 Polling for audit completion...');
        await loadAuditData();
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [auditStatus, sessionId]);

  const loadAuditData = async () => {
    try {
      console.log('🔍 Loading audit data for session:', sessionId);
      const response = await axios.get(`${API}/audit/${sessionId}`);
      console.log('✅ Audit data loaded successfully:', response.data);
      
      const data = response.data;
      const status = data.status || 'completed';
      
      setAuditStatus(status);
      setAuditData(data);
      
      // Only stop loading if we have a final status
      if (status === 'completed' || status === 'error') {
        setLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Failed to load audit data:', error);
      console.error('❌ Session ID:', sessionId);
      console.error('❌ Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        // Audit never existed - redirect to dashboard
        window.location.href = '/dashboard';
        return;
      }
      
      setAuditStatus('error');
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

  // Filter findings based on selected domain and priority
  const getFilteredFindings = () => {
    if (!auditData?.findings) return [];
    
    return auditData.findings.filter(finding => {
      const domainMatch = selectedDomain === 'All' || finding.domain === selectedDomain;
      const priorityMatch = selectedPriority === 'All' || finding.impact === selectedPriority;
      return domainMatch && priorityMatch;
    });
  };

  // Get unique domains from findings
  const getUniqueDomains = () => {
    if (!auditData?.findings) return [];
    const domains = [...new Set(auditData.findings.map(f => f.domain).filter(Boolean))];
    return domains;
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

  // Handle processing state
  if (auditStatus === 'processing') {
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
          gap: '1.5rem'
        }}>
          <div className="loading-spinner-premium"></div>
          <h2 style={{ color: 'var(--text-primary)' }}>Running your audit...</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            We're analyzing your Salesforce org to find optimization opportunities.<br/>
            This usually takes 30-60 seconds. Please hang tight!
          </p>
          <div style={{ 
            background: 'var(--color-background-secondary)', 
            padding: '1rem', 
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--text-tertiary)'
          }}>
            Session ID: {sessionId}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (auditStatus === 'error') {
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
          <h2 style={{ color: 'var(--color-red)' }}>Audit Processing Failed</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            {auditData?.message || 'An unexpected error occurred during audit processing.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/dashboard" className="btn-outline">← Back to Dashboard</Link>
            <button onClick={loadAuditData} className="btn-primary">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!auditData || auditStatus !== 'completed') {
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
          <h2>Audit not available</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            The audit session "{sessionId}" is not available.<br/>
            Status: {auditStatus}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/dashboard" className="btn-outline">← Back to Dashboard</Link>
            <button onClick={loadAuditData} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, findings, business_stage } = auditData;
  const filteredFindings = getFilteredFindings();
  
  // Mock business stage data - in real app this would come from backend
  const getStageData = (businessStage) => {
    const stageMap = {
      1: { 
        name: "Start", 
        role: "Founder", 
        motto: "Get your first paying customer",
        constraints: [
          "Pick one service offering and stick to it",
          "Focus on solving one problem extremely well", 
          "Talk to customers daily, fix issues immediately"
        ],
        nextSteps: [
          "Create a simple one-page website",
          "Set up basic accounting with QuickBooks"
        ]
      },
      2: { 
        name: "Scale", 
        role: "Manager", 
        motto: "Build sustainable systems",
        constraints: [
          "Hire slowly and fire quickly",
          "Document all processes and procedures",
          "Focus on profit margins over growth"
        ],
        nextSteps: [
          "Implement customer support systems",
          "Create employee training materials"
        ]
      },
      3: { 
        name: "Stabilize", 
        role: "Trainer", 
        motto: "Put stable systems in place",
        constraints: [
          "Pick your single biggest customer pain & fix it",
          "Build trust with consistent content & follow-up",
          "Standardize on one platform, secure data"
        ],
        nextSteps: [
          "Create an employee handbook & clear roles",
          "Implement P&L statements & basic insurance"
        ]
      }
    };
    return stageMap[businessStage] || stageMap[3];
  };

  const stageData = getStageData(business_stage?.stage || 3);
  const stageStats = {
    timeSaved: `${summary?.monthly_hours_saved || 36.8} h/mo`,
    roi: `$${summary?.annual_roi_total?.toLocaleString() || '23,082'} /yr`,
    findings: filteredFindings.length
  };

  // Transform findings for AccordionCard
  const transformedFindings = filteredFindings.map(finding => ({
    id: finding.id,
    domain: finding.domain,
    title: finding.title,
    cost: `$${finding.annual_cost?.toLocaleString() || '0'}/yr`,
    priority: finding.impact || 'Medium',
    details: {
      description: finding.description,
      breakdown: finding.breakdown || [],
      implementation: finding.implementation || finding.solution
    }
  }));

  const handleFilterChange = ({ domain, priority }) => {
    setSelectedDomain(domain);
    setSelectedPriority(priority);
  };

  return (
    <div className="PageContainer">
      {/* Header */}
      <div className="Header">
        <Link to="/dashboard">
          <ButtonText>
            <ArrowLeft size={16} />
            Back to Dashboard
          </ButtonText>
        </Link>
        <div className="HeaderActions">
          <ButtonOutline onClick={() => setShowEditAssumptions(true)}>
            Edit Assumptions
          </ButtonOutline>
          <ButtonPrimary onClick={generatePDF}>
            Export PDF
          </ButtonPrimary>
        </div>
      </div>

      {/* Stage Summary Panel */}
      <StageSummaryPanel
        stage={business_stage?.stage || 3}
        name={stageData.name}
        role={stageData.role}
        motto={stageData.motto}
        stats={stageStats}
        constraints={stageData.constraints}
        nextSteps={stageData.nextSteps}
      />

      {/* Filters Bar */}
      <FiltersBar
        domains={['All', ...uniqueDomains]}
        priorities={['All', 'High', 'Medium', 'Low']}
        selectedDomain={selectedDomain}
        selectedPriority={selectedPriority}
        onFilterChange={handleFilterChange}
      />

      {/* Findings Grid */}
      {transformedFindings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xxl)',
          color: 'var(--color-text-secondary)'
        }}>
          <h3>No findings match your filters</h3>
          <p>Try adjusting your domain or priority filters.</p>
        </div>
      ) : (
        <div className="FindingsGrid">
          {transformedFindings.map(finding => (
            <AccordionCard
              key={finding.id}
              domain={finding.domain}
              title={finding.title}
              cost={finding.cost}
              priority={finding.priority}
              details={finding.details}
            />
          ))}
        </div>
      )}

      {/* Edit Assumptions Modal */}
      <EditAssumptionsModal
        isOpen={showEditAssumptions}
        onClose={() => setShowEditAssumptions(false)}
        onUpdate={handleUpdateAssumptions}
        assumptions={auditData?.assumptions}
      />
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

// OAuth Callback Component - Apple-Style Floating Card
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('success');
  const [showPreAuditModal, setShowPreAuditModal] = useState(false);
  const { hasBusinessInfo, saveBusinessInfo } = useBusinessInfo();

  useEffect(() => {
    // Check if business info exists
    if (!hasBusinessInfo) {
      // Business info is missing, show the PreAuditModal
      setStatus('missing_info');
      setShowPreAuditModal(true);
    } else {
      // Business info exists, show success and redirect to dashboard
      setStatus('success');
      
      // Give user a moment to see the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  }, [navigate, hasBusinessInfo]);

  const handleBusinessInfoSubmit = async (businessInfo) => {
    console.log('Business info submitted from OAuth callback:', businessInfo);
    
    // Save to context
    saveBusinessInfo(businessInfo);
    setShowPreAuditModal(false);
    setStatus('success');
    
    // Now redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  if (showPreAuditModal) {
    return (
      <div>
        {/* Success message for OAuth */}
        <div className="redirect-overlay">
          <div className="redirect-card">
            <div className="redirect-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#28CD41"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="redirect-card__title">Successfully Connected</h1>
            <p className="redirect-card__subtitle">Please complete your business profile to continue.</p>
          </div>
        </div>
        
        {/* PreAudit Modal */}
        <PreAuditModal
          isOpen={showPreAuditModal}
          onClose={() => setShowPreAuditModal(false)}
          onSubmit={handleBusinessInfoSubmit}
        />
      </div>
    );
  }

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
    <BusinessInfoProvider>
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
    </BusinessInfoProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/apiService';
import { logger, usePolling } from '../../utils/cleanup';
import LoadingSpinner from '../common/LoadingSpinner';
import AccordionCard from '../AccordionCard';
import FindingDetails from '../FindingDetails';

const MetricCard = ({ label, value, accent = false }) => {
  return (
    <div className={accent ? 'metric-card-accent' : 'metric-card'}>
      <div className="metric-value">
        {value}
      </div>
      <div className={accent ? 'metric-label-accent' : 'metric-label'}>
        {label}
      </div>
    </div>
  );
};

const BusinessContext = ({ businessStage }) => {
  if (!businessStage) return null;

  const stageName = businessStage.name || 'Unknown';
  const stageNumber = businessStage.stage || 1;
  const keyFocus = businessStage.bottom_line || 'Focus on core business operations';

  return (
    <div className="business-context-card">
      <div className="context-grid">
        <div>
          <div className="context-label">
            Business Stage
          </div>
          <div className="context-value">
            {stageName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="context-label">
            Key Focus
          </div>
          <div className="context-value">
            {keyFocus}
          </div>
        </div>
      </div>
    </div>
  );
};

const StrategicOverview = ({ businessStage }) => {
  if (!businessStage) return null;

  const constraints = businessStage.constraints_and_actions || [];
  
  // Better logic to separate constraints from next steps
  const constraintItems = constraints.filter(item => 
    item.toLowerCase().includes('foundation') ||
    item.toLowerCase().includes('stable') ||
    item.toLowerCase().includes('maintain') ||
    item.toLowerCase().includes('sustainable') ||
    item.toLowerCase().includes('quality') ||
    item.toLowerCase().includes('must not') ||
    item.toLowerCase().includes('careful') ||
    item.toLowerCase().includes('constraint')
  );
  
  const nextStepItems = constraints.filter(item => 
    item.toLowerCase().includes('focus:') || 
    item.toLowerCase().includes('marketing') ||
    item.toLowerCase().includes('tech:') ||
    item.toLowerCase().includes('hr:') ||
    item.toLowerCase().includes('finance:') ||
    item.toLowerCase().includes('build') ||
    item.toLowerCase().includes('implement') ||
    item.toLowerCase().includes('create') ||
    !constraintItems.includes(item)
  );

  return (
    <div className="strategic-overview-card">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div>
          <h3 className="strategic-section-title">
            Constraints
          </h3>
          <div className="strategic-list">
            {constraintItems.length > 0 ? (
              constraintItems.map((constraint, index) => (
                <div key={index} className="strategic-item">
                  <span className="strategic-bullet-constraint">•</span>
                  <span>{constraint}</span>
                </div>
              ))
            ) : (
              <div className="strategic-item">
                <span className="strategic-bullet-constraint">•</span>
                <span>Focus on sustainable growth while maintaining quality</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="strategic-section-title">
            Next Steps
          </h3>
          <div className="strategic-list">
            {nextStepItems.length > 0 ? (
              nextStepItems.map((step, index) => (
                <div key={index} className="strategic-item">
                  <span className="strategic-bullet-next">•</span>
                  <span>{step}</span>
                </div>
              ))
            ) : (
              <>
                {[
                  'Implement high-impact optimizations first',
                  'Focus on automation to scale efficiently', 
                  'Review and clean up unused system components'
                ].map((step, index) => (
                  <div key={index} className="strategic-item">
                    <span className="strategic-bullet-next">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditStatus, setAuditStatus] = useState('loading');

  // Load audit data
  const loadAuditData = async () => {
    try {
      const response = await api.getAuditData(sessionId);
      const status = response.status || 'completed';
      
      setAuditStatus(status);
      setAuditData(response);
      
      if (status === 'completed' || status === 'error') {
        setLoading(false);
      }
      
      logger.info('Audit data loaded:', response);
    } catch (error) {
      logger.error('Failed to load audit data:', error);
      setError('Failed to load audit results. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [sessionId]);

  const handleGeneratePDF = async () => {
    try {
      const pdfBlob = await api.generatePDF(sessionId);
      
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salesforce-audit-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error('PDF generation failed:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  if (loading || auditStatus === 'processing') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F2F2F7', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <LoadingSpinner size="large" message="Processing your audit..." />
          <p style={{ 
            marginTop: '1.5rem', 
            color: '#8E8E93', 
            fontSize: '0.9375rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}>
            This may take up to 60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F2F2F7', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FFEBEE',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#F44336' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '1.375rem', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '0.75rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}>
            Error Loading Results
          </h2>
          <p style={{ 
            color: '#8E8E93', 
            marginBottom: '2rem',
            fontSize: '1.0625rem',
            lineHeight: '1.5',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              padding: '0.875rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              boxShadow: '0 4px 16px rgba(0, 122, 255, 0.24)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, findings = [], business_stage: businessStage, session } = auditData || {};
  const orgName = session?.org_name || 'Your Organization';
  
  const findingsCount = summary?.total_findings || 0;
  const timeSavings = summary?.total_time_savings_hours || 0;
  const annualROI = summary?.total_annual_roi || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F7' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '3rem',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#8E8E93',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              transition: 'color 0.2s ease',
              padding: '0.5rem'
            }}
            onMouseOver={(e) => e.target.style.color = '#007AFF'}
            onMouseOut={(e) => e.target.style.color = '#8E8E93'}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Back
          </button>
          
          <h1 className="text-hero">
            Audit Results
          </h1>
        </div>

        {/* Metrics Dashboard */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '3rem' 
        }}>
          <MetricCard 
            label="Findings" 
            value={findingsCount.toString()} 
          />
          <MetricCard 
            label="Time Savings" 
            value={`${timeSavings} h/mo`} 
          />
          <MetricCard 
            label="ROI" 
            value={`$${annualROI.toLocaleString()}/yr`} 
            accent={true}
          />
        </div>

        {/* Business Context */}
        <BusinessContext businessStage={businessStage} />

        {/* Strategic Overview */}
        <StrategicOverview businessStage={businessStage} />

        {/* Findings Section */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <h2 className="text-section">
              Detailed Findings
            </h2>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid rgba(0, 0, 0, 0.1)',
                fontSize: '0.9375rem',
                backgroundColor: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontWeight: '500',
                color: '#1a1a1a',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                outline: 'none',
                cursor: 'pointer'
              }}>
                <option value="">All Domains</option>
                <option value="data-quality">Data Quality</option>
                <option value="automation">Automation</option>
                <option value="security">Security</option>
                <option value="reporting">Reporting</option>
              </select>
              
              <select style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid rgba(0, 0, 0, 0.1)',
                fontSize: '0.9375rem',
                backgroundColor: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontWeight: '500',
                color: '#1a1a1a',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                outline: 'none',
                cursor: 'pointer'
              }}>
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Findings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {findings.map((finding, index) => (
              <AccordionCard
                key={finding.id || index}
                title={finding.title || `Finding ${index + 1}`}
                domain={finding.domain || 'GENERAL'}
                priority={finding.impact || finding.priority || 'MEDIUM'}
                cost={`$${(finding.total_annual_roi || finding.roi_estimate || 0).toLocaleString()}/yr`}
              >
                <FindingDetails finding={finding} />
              </AccordionCard>
            ))}
          </div>

          {findings.length === 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '4rem 2rem',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#F2F2F7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#C7C7CC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '1.375rem', 
                fontWeight: '700', 
                color: '#1a1a1a', 
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
              }}>
                No findings available
              </h3>
              <p style={{ 
                color: '#8E8E93',
                fontSize: '1.0625rem',
                lineHeight: '1.5',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
              }}>
                The audit results are still being processed or no issues were found in your Salesforce org.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditResults;
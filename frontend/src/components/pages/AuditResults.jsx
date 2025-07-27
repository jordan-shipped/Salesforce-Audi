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
    <div style={{
      backgroundColor: accent ? '#007AFF' : 'white',
      color: accent ? 'white' : '#000',
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: accent ? 'white' : '#000'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: accent ? 'rgba(255,255,255,0.8)' : '#666'
      }}>
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
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#666',
            marginBottom: '0.25rem'
          }}>
            Business Stage
          </div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#000'
          }}>
            {stageName} (Stage {stageNumber})
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#666',
            marginBottom: '0.25rem'
          }}>
            Key Focus
          </div>
          <div style={{
            fontSize: '1.125rem',
            color: '#000'
          }}>
            "{keyFocus}"
          </div>
        </div>
      </div>
    </div>
  );
};

const StrategicOverview = ({ businessStage }) => {
  if (!businessStage) return null;

  const constraints = businessStage.constraints_and_actions || [];
  
  // Split constraints into actual constraints and next steps
  const constraintItems = constraints.filter(item => 
    item.toLowerCase().includes('constraint') || 
    item.toLowerCase().includes('limit') ||
    item.toLowerCase().includes('must') ||
    item.toLowerCase().includes('foundation')
  );
  
  const nextStepItems = constraints.filter(item => 
    item.toLowerCase().includes('move') || 
    item.toLowerCase().includes('build') ||
    item.toLowerCase().includes('improve') ||
    item.toLowerCase().includes('scale') ||
    !constraintItems.includes(item)
  );

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#000',
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>
            Constraints
          </h3>
          <div>
            {constraintItems.length > 0 ? (
              constraintItems.map((constraint, index) => (
                <div key={index} style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  • {constraint}
                </div>
              ))
            ) : (
              <div style={{
                fontSize: '1rem',
                color: '#666',
                lineHeight: '1.5'
              }}>
                • Focus on sustainable growth while maintaining quality
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#000',
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>
            Next Steps
          </h3>
          <div>
            {nextStepItems.length > 0 ? (
              nextStepItems.map((step, index) => (
                <div key={index} style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  • {step}
                </div>
              ))
            ) : (
              <>
                <div style={{ fontSize: '1rem', color: '#666', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                  • Implement high-impact optimizations first
                </div>
                <div style={{ fontSize: '1rem', color: '#666', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                  • Focus on automation to scale efficiently
                </div>
                <div style={{ fontSize: '1rem', color: '#666', lineHeight: '1.5' }}>
                  • Review and clean up unused system components
                </div>
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
      
      // Create download link
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
          <LoadingSpinner size="large" message="Processing your audit..." />
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
            This may take up to 60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000', marginBottom: '0.5rem' }}>
            Error Loading Results
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
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
  
  // Get metrics for dashboard
  const findingsCount = summary?.total_findings || 0;
  const timeSavings = summary?.total_time_savings_hours || 0;
  const annualROI = summary?.total_annual_roi || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '2rem',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Back
            </button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#000' }}>
                Audit Results
              </h1>
              <p style={{ color: '#666', margin: 0, fontSize: '1.125rem' }}>
                {orgName}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button style={{
              backgroundColor: 'white',
              color: '#007AFF',
              border: '1px solid #007AFF',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Edit Assumptions
            </button>
            <button
              onClick={handleGeneratePDF}
              style={{
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
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
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#000',
              margin: 0
            }}>
              Detailed Findings
            </h2>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}>
                <option value="">All Domains</option>
                <option value="data-quality">Data Quality</option>
                <option value="automation">Automation</option>
                <option value="security">Security</option>
                <option value="reporting">Reporting</option>
              </select>
              
              <select style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}>
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Findings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000', marginBottom: '0.5rem' }}>
                No findings available
              </h3>
              <p style={{ color: '#666' }}>
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
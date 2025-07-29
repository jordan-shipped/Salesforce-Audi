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
    <div className={`card text-center ${accent ? 'bg-accent text-white' : ''}`}>
      <div className={`text-h2 font-bold mb-2 ${accent ? 'text-white' : 'text-text-primary'}`}>
        {value}
      </div>
      <div className={`text-caption font-semibold uppercase tracking-wide ${accent ? 'text-white opacity-85' : 'text-text-grey-300'}`}>
        {label}
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
    <div className="min-h-screen bg-background-page">
      <div className="container-page py-lg">
        {/* Top Navigation Strip */}
        <div className="flex items-center justify-between mb-lg">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-text p-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => {
              // Handle disconnect logic
              navigate('/dashboard');
            }}
            className="text-body-regular font-medium text-red-600 hover:text-red-700"
          >
            Disconnect
          </button>
        </div>

        {/* Clean Header Section - Match Audit History */}
        <div className="flex items-center justify-between mb-lg">
          <h1 className="text-section font-bold">
            Audit Results
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            + New Audit
          </button>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
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

        {/* Findings Section */}
        <div>
          <h2 className="text-section mb-lg">
            Detailed Findings
          </h2>

          {/* Findings List */}
          <div className="space-y-4">
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
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg className="w-8 h-8 text-text-grey-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-modal-title font-semibold text-text-primary mb-2">
                No findings available
              </h3>
              <p className="text-body-regular text-text-grey-600">
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
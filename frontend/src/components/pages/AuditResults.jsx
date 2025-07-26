import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/apiService';
import { logger, usePolling } from '../../utils/cleanup';
import LoadingSpinner from '../common/LoadingSpinner';
import MetricsDashboard from '../MetricsDashboard';
import BusinessContext from '../BusinessContext';
import StrategicOverview from '../StrategicOverview';
import AccordionCard from '../AccordionCard';
import FindingDetails from '../FindingDetails';

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

  // Polling for processing audits
  const { isPolling, startPolling, stopPolling } = usePolling(
    loadAuditData,
    3000, // Poll every 3 seconds
    true   // Start immediately
  );

  useEffect(() => {
    if (auditStatus === 'processing') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [auditStatus, startPolling, stopPolling]);

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
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <LoadingSpinner size="large" message="Processing your audit..." />
          <p className="text-caption text-text-grey-600 mt-md">
            This may take up to 60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-md">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-h2 font-semibold text-text-primary mb-2">
            Error Loading Results
          </h2>
          <p className="text-body-regular text-text-grey-600 mb-lg">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, findings = [], business_stage: businessStage, session } = auditData || {};
  const orgName = session?.org_name || 'Your Organization';

  return (
    <div className="min-h-screen bg-background-page">
      <div className="container mx-auto px-lg py-lg max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-lg">
          <div className="flex items-center mb-md md:mb-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-text-grey-600 hover:text-text-primary mr-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-h1 font-bold text-text-primary">
                Audit Results
              </h1>
              <p className="text-body-large text-text-grey-600">
                {orgName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-sm">
            <button className="btn-secondary">
              Edit Assumptions
            </button>
            <button
              onClick={handleGeneratePDF}
              className="btn-primary"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <MetricsDashboard summary={summary} />

        {/* Business Context */}
        <BusinessContext businessStage={businessStage} />

        {/* Strategic Overview */}
        <StrategicOverview businessStage={businessStage} />

        {/* Findings Section */}
        <div className="space-y-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-md">
            <h2 className="text-section font-semibold text-text-primary mb-sm md:mb-0">
              Detailed Findings
            </h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-sm">
              <select className="input-field text-body-regular">
                <option value="">All Domains</option>
                <option value="data-quality">Data Quality</option>
                <option value="automation">Automation</option>
                <option value="security">Security</option>
                <option value="reporting">Reporting</option>
              </select>
              
              <select className="input-field text-body-regular">
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-md">
            {findings.map((finding, index) => (
              <AccordionCard
                key={finding.id || index}
                title={finding.title || `Finding ${index + 1}`}
                domain={finding.domain || 'GENERAL'}
                priority={finding.impact || finding.priority || 'MEDIUM'}
                cost={`$${(finding.total_annual_roi || finding.roi_estimate || 0).toLocaleString()}/yr`}
                expandedContent={<FindingDetails finding={finding} />}
                className="accordion-card"
              />
            ))}
          </div>

          {findings.length === 0 && (
            <div className="card text-center py-xl">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-md">
                <svg className="w-8 h-8 text-text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-body-large font-semibold text-text-primary mb-2">
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
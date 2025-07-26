import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/apiService';
import { logger, usePolling } from '../../utils/cleanup';
import LoadingSpinner from '../common/LoadingSpinner';

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
          <div className="flex gap-md">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex-1"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-page">
      <div className="container-page py-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-text p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-h1 font-semibold text-text-primary">
                Audit Results
              </h1>
              {auditData?.org_name && (
                <p className="text-body-regular text-text-grey-600">
                  {auditData.org_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-md">
            <button
              onClick={handleGeneratePDF}
              className="btn-primary"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Results Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-section font-semibold text-text-primary mb-md">
                Summary
              </h2>
              <div className="space-y-md">
                <div>
                  <div className="text-caption text-text-grey-600 uppercase tracking-wide">
                    Total Findings
                  </div>
                  <div className="text-h2 font-semibold text-text-primary">
                    {auditData?.summary?.total_findings || 0}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-text-grey-600 uppercase tracking-wide">
                    Annual ROI
                  </div>
                  <div className="text-h2 font-semibold text-accent">
                    ${(auditData?.total_annual_roi || 0).toLocaleString()}/yr
                  </div>
                </div>
                <div>
                  <div className="text-caption text-text-grey-600 uppercase tracking-wide">
                    Time Savings
                  </div>
                  <div className="text-h2 font-semibold text-text-primary">
                    {auditData?.total_time_savings_hours || 0} h/mo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-section font-semibold text-text-primary mb-md">
                Findings & Recommendations
              </h2>
              <p className="text-body-regular text-text-grey-600">
                Detailed findings and recommendations will be displayed here once 
                the AuditResults component is fully extracted from the original App.js.
              </p>
              <div className="mt-md">
                <button
                  onClick={handleGeneratePDF}
                  className="btn-secondary"
                >
                  View Full Report (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditResults;
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

  useEffect(() => {
    loadAuditData();
  }, [sessionId]);

  if (loading || auditStatus === 'processing') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <LoadingSpinner size="large" message="Processing your audit..." />
          <p style={{ marginTop: '1rem', color: '#666' }}>
            This may take up to 60 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Error Loading Results</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '4px' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, findings = [], business_stage: businessStage, session } = auditData || {};
  const orgName = session?.org_name || 'Your Organization';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', marginRight: '2rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Back
            </button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                Audit Results
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                {orgName}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Test Content */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>🎯 TEST: Basic Layout Working!</h2>
          <p>If you can see this, the component is rendering correctly.</p>
          
          {summary && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Summary Data:</h3>
              <p>Total Findings: {summary.total_findings || 0}</p>
              <p>Total Annual ROI: ${(summary.total_annual_roi || 0).toLocaleString()}/yr</p>
              <p>Time Savings: {summary.total_time_savings_hours || 0} h/mo</p>
            </div>
          )}
          
          {businessStage && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Business Stage:</h3>
              <p>{businessStage.name} (Stage {businessStage.stage})</p>
              <p>Focus: {businessStage.bottom_line}</p>
            </div>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <h3>Findings ({findings.length}):</h3>
            {findings.slice(0, 3).map((finding, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0', borderRadius: '4px' }}>
                <h4>{finding.title}</h4>
                <p>Domain: {finding.domain}</p>
                <p>ROI: ${(finding.total_annual_roi || finding.roi_estimate || 0).toLocaleString()}/yr</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditResults;
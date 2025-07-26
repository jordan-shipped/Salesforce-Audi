import React, { useState } from 'react';
import { Bolt, ChartPie, FileText } from 'lucide-react';
import { api } from '../../services/apiService';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import PreAuditModal from '../modals/PreAuditModal';

const LandingPage = () => {
  const [showPreAuditModal, setShowPreAuditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { hasBusinessInfo, saveBusinessInfo } = useBusinessInfo();

  const handleStartFreeAudit = async () => {
    if (!hasBusinessInfo) {
      setShowPreAuditModal(true);
    } else {
      // Business info already exists, go straight to OAuth
      setIsLoading(true);
      try {
        window.location.href = api.getOAuthUrl();
      } catch (error) {
        console.error('Failed to initiate OAuth:', error);
        setIsLoading(false);
      }
    }
  };

  const handleBusinessInfoSubmit = async (businessInfo) => {
    try {
      setIsLoading(true);
      
      // Save to context and backend
      await saveBusinessInfo(businessInfo);
      setShowPreAuditModal(false);
      
      // Redirect to OAuth
      window.location.href = api.getOAuthUrl();
    } catch (error) {
      console.error('Failed to save business info:', error);
      setIsLoading(false);
      // Error will be handled by ErrorBoundary or shown in modal
    }
  };

  return (
    <div className="bg-background-page min-h-screen">
      <div className="container-page">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Optimize Your Salesforce</h1>
          <h2 className="hero-subtitle">
            <span className="gradient-text">Like Never Before</span>
          </h2>
          <p className="hero-copy">
            Discover hidden inefficiencies, automate manual processes, and unlock 
            substantial cost savings with our AI-powered Salesforce audit tool.
          </p>
          <button 
            onClick={handleStartFreeAudit}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Starting Audit...
              </>
            ) : (
              'Start Free Audit'
            )}
          </button>
        </section>

        {/* Features Grid */}
        <div className="features-grid">
          <FeatureCard
            icon={<Bolt className="feature-icon" />}
            title="Instant Analysis"
            description="Complete Salesforce audit in under 60 seconds. No setup, no waiting."
          />
          
          <FeatureCard
            icon={<ChartPie className="feature-icon" />}
            title="Smart Insights"
            description="AI-powered recommendations tailored to your business size and industry."
          />
          
          <FeatureCard
            icon={<FileText className="feature-icon" />}
            title="Actionable Reports"
            description="Professional PDF reports with prioritized recommendations and guidance."
          />
        </div>
      </div>

      {/* PreAudit Modal */}
      <PreAuditModal
        isOpen={showPreAuditModal}
        onClose={() => setShowPreAuditModal(false)}
        onSubmit={handleBusinessInfoSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      {icon}
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default LandingPage;
import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background-page py-12">
      <div className="container-page">
        <div className="card max-w-2xl mx-auto">
          <h1 className="text-hero font-bold text-text-primary mb-lg text-center">
            Contact Us
          </h1>
          
          <div className="text-center mb-lg">
            <p className="text-body-large text-text-grey-600 mb-md">
              Have questions about your Salesforce audit? We're here to help!
            </p>
          </div>
          
          <div className="space-y-lg">
            <div className="text-center">
              <h2 className="text-section font-semibold text-text-primary mb-md">
                Get in Touch
              </h2>
              <div className="space-y-md">
                <div>
                  <p className="text-body-regular text-text-grey-600">
                    <strong>Email:</strong> support@salesauditpro.com
                  </p>
                </div>
                <div>
                  <p className="text-body-regular text-text-grey-600">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                </div>
              </div>
            </div>
            
            <div className="divider" />
            
            <div className="text-center">
              <h2 className="text-section font-semibold text-text-primary mb-md">
                Frequently Asked Questions
              </h2>
              <div className="text-left space-y-md">
                <div>
                  <h3 className="text-body-large font-semibold text-text-primary mb-2">
                    How long does an audit take?
                  </h3>
                  <p className="text-body-regular text-text-grey-600">
                    Our AI-powered audit completes in under 60 seconds, providing 
                    instant insights into your Salesforce optimization opportunities.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-body-large font-semibold text-text-primary mb-2">
                    Is my data secure?
                  </h3>
                  <p className="text-body-regular text-text-grey-600">
                    Yes, we use enterprise-grade security and only access the metadata 
                    necessary for the audit. No sensitive customer data is accessed.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-body-large font-semibold text-text-primary mb-2">
                    What's included in the report?
                  </h3>
                  <p className="text-body-regular text-text-grey-600">
                    You'll receive a comprehensive PDF report with prioritized recommendations, 
                    cost savings calculations, and step-by-step implementation guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-lg border-t border-border-subtle text-center">
            <Link 
              to="/" 
              className="btn-primary mr-md"
            >
              Start Free Audit
            </Link>
            <Link 
              to="/about" 
              className="btn-secondary"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
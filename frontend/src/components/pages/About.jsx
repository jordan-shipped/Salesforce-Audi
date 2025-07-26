import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-background-page py-12">
      <div className="container-page">
        <div className="card max-w-4xl mx-auto">
          <h1 className="text-hero font-bold text-text-primary mb-lg">
            About Salesforce Audit Pro
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-body-large text-text-grey-600 mb-md">
              Salesforce Audit Pro is an AI-powered tool that helps businesses optimize their 
              Salesforce implementations by identifying inefficiencies, automating manual processes, 
              and uncovering cost-saving opportunities.
            </p>
            
            <h2 className="text-section font-semibold text-text-primary mt-lg mb-md">
              Our Mission
            </h2>
            <p className="text-body-regular text-text-grey-600 mb-md">
              We believe every Salesforce org can be optimized to save time, reduce costs, and 
              improve user adoption. Our comprehensive audit tool provides actionable insights 
              tailored to your business size and industry.
            </p>
            
            <h2 className="text-section font-semibold text-text-primary mt-lg mb-md">
              Key Features
            </h2>
            <ul className="space-y-2 text-body-regular text-text-grey-600 mb-lg">
              <li>• Instant 60-second comprehensive audits</li>
              <li>• AI-powered recommendations</li>
              <li>• Professional PDF reports</li>
              <li>• Industry-specific insights</li>
              <li>• Cost savings calculations</li>
              <li>• Implementation guidance</li>
            </ul>
          </div>
          
          <div className="pt-lg border-t border-border-subtle">
            <Link 
              to="/" 
              className="btn-primary mr-md"
            >
              Start Free Audit
            </Link>
            <Link 
              to="/contact" 
              className="btn-secondary"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
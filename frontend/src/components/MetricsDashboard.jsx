import React from 'react';

const MetricCard = ({ label, value, accent = false }) => {
  return (
    <div className={`card text-center ${accent ? 'bg-accent text-white' : ''}`}>
      <div className={`text-h2 font-semibold ${accent ? 'text-white' : 'text-text-primary'}`}>
        {value}
      </div>
      <div className={`text-caption uppercase tracking-wide mt-1 ${accent ? 'text-blue-100' : 'text-text-grey-600'}`}>
        {label}
      </div>
    </div>
  );
};

const MetricsDashboard = ({ summary }) => {
  const findingsCount = summary?.total_findings || 0;
  const timeSavings = summary?.total_time_savings_hours || 0;
  const annualROI = summary?.total_annual_roi || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
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
  );
};

export default MetricsDashboard;
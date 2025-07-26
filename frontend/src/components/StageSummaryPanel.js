import React from 'react';

const StatCard = ({ label, value }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const StageSummaryPanel = ({ businessStage, summary }) => {
  if (!businessStage) return null;

  return (
    <div className="stage-panel">
      <div className="stage-header">
        <span className="stage-tag">Stage {businessStage.stage}</span>
        <h1 className="stage-title">{businessStage.name}</h1>
        <span className="stage-role">{businessStage.role}</span>
        <p className="stage-motto">"{businessStage.bottom_line}"</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          label="Time Saved" 
          value={`${summary?.total_time_savings_hours || 0} h/mo`} 
        />
        <StatCard 
          label="ROI" 
          value={`$${(summary?.total_annual_roi || 0).toLocaleString()}/yr`} 
        />
        <StatCard 
          label="Findings" 
          value={summary?.total_findings || 0} 
        />
      </div>

      <div className="flex gap-8 mt-lg">
        <div className="flex-1">
          <h3 className="text-body-medium font-semibold text-text-primary mb-3">
            Your Primary Constraints
          </h3>
          <ul className="space-y-2">
            {businessStage.constraints?.map((constraint, index) => (
              <li key={index} className="text-body-regular text-text-grey-600 leading-relaxed">
                {constraint}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1">
          <h3 className="text-body-medium font-semibold text-text-primary mb-3">
            Your Next Steps
          </h3>
          <ul className="space-y-2">
            {businessStage.next_steps?.map((step, index) => (
              <li key={index} className="text-body-regular text-text-grey-600 leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StageSummaryPanel;
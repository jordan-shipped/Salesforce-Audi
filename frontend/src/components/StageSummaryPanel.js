import React from 'react';

const StatCard = ({ label, value }) => {
  return (
    <div className="StatCard">
      <div className="StatLabel">{label}</div>
      <div className="StatValue">{value}</div>
    </div>
  );
};

const StageSummaryPanel = ({ 
  stage, 
  name, 
  role, 
  motto, 
  stats, 
  constraints = [], 
  nextSteps = [] 
}) => {
  return (
    <div className="StageSummaryPanel">
      <div className="StageHeader">
        <span className="StageTag">Stage {stage}</span>
        <h1 className="StageTitle">{name}</h1>
        <span className="StageRole">{role}</span>
        <p className="StageMotto">"{motto}"</p>
      </div>
      
      <div className="StageStats">
        <StatCard label="Time Saved" value={stats.timeSaved} />
        <StatCard label="ROI" value={stats.roi} />
        <StatCard label="Findings" value={stats.findings} />
      </div>
      
      <div className="StageDetails">
        <div className="StageDetailsSection">
          <h3>Your Primary Constraints</h3>
          <ul>
            {constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>
        
        <div className="StageDetailsSection">
          <h3>Your Next Steps</h3>
          <ul>
            {nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StageSummaryPanel;
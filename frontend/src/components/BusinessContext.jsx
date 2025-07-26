import React from 'react';

const BusinessContext = ({ businessStage }) => {
  if (!businessStage) {
    return null;
  }

  const stageName = businessStage.name || 'Unknown';
  const stageNumber = businessStage.stage || 1;
  const keyFocus = businessStage.bottom_line || 'Focus on core business operations';

  return (
    <div className="card mb-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-md md:space-y-0">
        <div>
          <div className="text-caption text-text-grey-600 uppercase tracking-wide">
            Business Stage
          </div>
          <div className="text-body-large font-semibold text-text-primary">
            {stageName} (Stage {stageNumber})
          </div>
        </div>
        <div className="md:text-right">
          <div className="text-caption text-text-grey-600 uppercase tracking-wide">
            Key Focus
          </div>
          <div className="text-body-large text-text-primary">
            "{keyFocus}"
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessContext;
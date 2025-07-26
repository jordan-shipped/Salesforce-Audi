import React from 'react';

const StrategicOverview = ({ businessStage }) => {
  if (!businessStage) {
    return null;
  }

  const constraints = businessStage.constraints_and_actions || [];
  
  // Split constraints into actual constraints and next steps
  const constraintItems = constraints.filter(item => 
    item.toLowerCase().includes('constraint') || 
    item.toLowerCase().includes('limit') ||
    item.toLowerCase().includes('must') ||
    item.toLowerCase().includes('foundation')
  );
  
  const nextStepItems = constraints.filter(item => 
    item.toLowerCase().includes('move') || 
    item.toLowerCase().includes('build') ||
    item.toLowerCase().includes('improve') ||
    item.toLowerCase().includes('scale') ||
    !constraintItems.includes(item)
  );

  return (
    <div className="card mb-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <h3 className="text-section font-semibold text-text-primary mb-md">
            Constraints
          </h3>
          <div className="space-y-sm">
            {constraintItems.length > 0 ? (
              constraintItems.map((constraint, index) => (
                <div key={index} className="text-body-regular text-text-grey-600 leading-relaxed">
                  • {constraint}
                </div>
              ))
            ) : (
              <div className="text-body-regular text-text-grey-600">
                • Focus on sustainable growth while maintaining quality
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-section font-semibold text-text-primary mb-md">
            Next Steps
          </h3>
          <div className="space-y-sm">
            {nextStepItems.length > 0 ? (
              nextStepItems.map((step, index) => (
                <div key={index} className="text-body-regular text-text-grey-600 leading-relaxed">
                  • {step}
                </div>
              ))
            ) : (
              <div className="text-body-regular text-text-grey-600">
                • Implement high-impact optimizations first
                • Focus on automation to scale efficiently
                • Review and clean up unused system components
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicOverview;
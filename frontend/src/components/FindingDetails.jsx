import React from 'react';

const FindingDetails = ({ finding }) => {
  // Extract specific details from finding data
  const getSpecificDetails = (finding) => {
    const details = [];
    
    // Extract field names if available
    if (finding.salesforce_data?.custom_fields) {
      finding.salesforce_data.custom_fields.slice(0, 5).forEach(field => {
        details.push(field.DeveloperName || field.name || field);
      });
    }
    
    // Extract other specific items based on finding type
    if (finding.title?.toLowerCase().includes('page layout')) {
      details.push('Account Page Layout', 'Contact Page Layout', 'Opportunity Page Layout');
    } else if (finding.title?.toLowerCase().includes('automation')) {
      details.push('Lead Assignment Rules', 'Workflow Rules', 'Process Builder Flows');
    } else if (finding.title?.toLowerCase().includes('data quality')) {
      details.push('Empty required fields', 'Duplicate records', 'Inconsistent formatting');
    }
    
    // Fallback to generic items if no specific details
    if (details.length === 0) {
      details.push('System components requiring attention', 'Configuration items to review');
    }
    
    return details;
  };

  const specificDetails = getSpecificDetails(finding);
  
  // Generate business impact explanation as paragraph
  const getBusinessImpactParagraph = (finding) => {
    const annualSavings = finding.total_annual_roi || finding.roi_estimate || 0;
    const monthlyHours = finding.time_savings_hours || 2;
    
    return `Your team currently spends approximately ${monthlyHours} hours per month navigating around these unused elements, which reduces efficiency and slows down daily operations. Streamlined processes reduce errors and speed up deal processing, potentially adding $${Math.round(annualSavings * 0.3).toLocaleString()} in additional revenue annually. Most importantly, cleaner systems mean new team members get productive faster and existing staff can focus on revenue-generating activities instead of dealing with system confusion, helping you scale more effectively.`;
  };

  const businessImpactParagraph = getBusinessImpactParagraph(finding);
  
  // Generate considerations based on finding type
  const getConsiderations = (finding) => {
    const considerations = [];
    
    if (finding.title?.toLowerCase().includes('custom field')) {
      considerations.push('Review with your team to confirm these fields aren\'t needed for seasonal campaigns or future projects');
      considerations.push('Consider using Salesforce\'s field audit trail to check historical usage patterns before making changes');
      considerations.push('Follow Salesforce best practice: hide fields from page layouts first, then delete only if truly unnecessary');
    } else if (finding.title?.toLowerCase().includes('automation')) {
      considerations.push('Test any automation changes in a sandbox environment first');
      considerations.push('Document current processes before making modifications');
      considerations.push('Consider the impact on existing data and workflows');
    } else {
      considerations.push('Review with key stakeholders before implementing changes');
      considerations.push('Follow Salesforce best practices and documentation');
      considerations.push('Consider implementing changes gradually to minimize disruption');
    }
    
    return considerations;
  };

  const considerations = getConsiderations(finding);

  return (
    <div className="space-y-lg pt-lg border-t border-border-subtle">
      {/* What We Found */}
      <div>
        <h4 className="text-body-medium font-semibold text-text-primary mb-md">
          What We Found
        </h4>
        <p className="text-body-regular text-text-grey-600 leading-relaxed mb-md">
          {finding.description || 'We identified areas in your Salesforce that may need attention based on usage patterns and best practices.'}
        </p>
        
        {specificDetails.length > 0 && (
          <div>
            <p className="text-body-regular text-text-grey-600 mb-sm">
              Specific items identified:
            </p>
            <ul className="list-disc list-inside text-body-regular text-text-grey-600 space-y-1 ml-md">
              {specificDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Why This Matters */}
      <div>
        <h4 className="text-body-medium font-semibold text-text-primary mb-md">
          Why This Matters
        </h4>
        <p className="text-body-regular text-text-grey-600 leading-relaxed">
          {businessImpactParagraph}
        </p>
      </div>

      {/* Considerations */}
      <div>
        <h4 className="text-body-medium font-semibold text-text-primary mb-md">
          Considerations
        </h4>
        <ol className="list-decimal list-inside text-body-regular text-text-grey-600 space-y-sm ml-md leading-relaxed">
          {considerations.map((consideration, index) => (
            <li key={index}>{consideration}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default FindingDetails;
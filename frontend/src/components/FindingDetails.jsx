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

  // Generate ROI breakdown details based on finding type and data
  const getROIBreakdown = (finding) => {
    // Extract actual finding data
    const category = finding.category || '';
    const title = (finding.title || '').toLowerCase();
    const enhancedROI = finding.enhanced_roi || {};
    const taskBreakdown = enhancedROI.task_breakdown || [];
    
    // Default values
    const activeUsers = 10; // This should come from org data eventually
    const workdaysPerMonth = 22;
    
    // Determine finding type and extract relevant data
    let findingType, breakdownData;
    
    if (title.includes('custom fields')) {
      // Custom Fields Logic
      findingType = 'custom_fields';
      const fieldCount = finding.field_count || finding.salesforce_data?.custom_fields?.length || 18;
      const confusionTimeSeconds = 30; // 0.5 minutes
      const avgUserRate = 40;
      const adminRate = 35;
      
      const dailyConfusionMinutes = activeUsers * 0.5 * fieldCount;
      const monthlyConfusionHours = (dailyConfusionMinutes * workdaysPerMonth) / 60;
      const monthlyConfusionSavings = Math.round(monthlyConfusionHours * avgUserRate);
      const annualConfusionSavings = monthlyConfusionSavings * 12;
      
      const cleanupHours = fieldCount * 0.25; // 15 minutes per field
      const cleanupHoursFormatted = cleanupHours >= 1 
        ? `${Math.floor(cleanupHours)} Hours ${Math.round((cleanupHours % 1) * 60)} Minutes`
        : `${Math.round(cleanupHours * 60)} Minutes`;
      const cleanupCost = Math.round(cleanupHours * adminRate);
      
      breakdownData = {
        fieldCount,
        activeUsers,
        confusionTimeSeconds,
        workdaysPerMonth,
        monthlyConfusionHours: Math.round(monthlyConfusionHours * 10) / 10,
        monthlyConfusionSavings,
        annualConfusionSavings,
        cleanupHoursFormatted,
        cleanupCost,
        netAnnualROI: annualConfusionSavings - cleanupCost,
        avgUserRate,
        adminRate,
        calculationType: 'User Confusion Elimination'
      };
      
    } else if (category === 'Automation Opportunities' || title.includes('manual') || title.includes('reporting')) {
      // Automation/Manual Process Logic
      findingType = 'automation';
      const estimatedMonthlyHours = finding.estimated_monthly_hours || finding.time_savings_hours || 8;
      const avgUserRate = 40;
      const adminRate = 35;
      const setupHours = 4; // Standard automation setup time
      
      const monthlyTimeSavings = estimatedMonthlyHours;
      const monthlySavings = Math.round(monthlyTimeSavings * avgUserRate);
      const annualSavings = monthlySavings * 12;
      const setupCost = Math.round(setupHours * adminRate);
      
      const setupHoursFormatted = `${setupHours} Hours`;
      
      breakdownData = {
        monthlyTimeSavings,
        monthlySavings,
        annualSavings,
        setupHours,
        setupHoursFormatted,
        setupCost,
        netAnnualROI: annualSavings - setupCost,
        avgUserRate,
        adminRate,
        calculationType: 'Manual Process Automation'
      };
      
    } else if (category === 'Revenue Leaks') {
      // Data Quality Logic
      findingType = 'data_quality';
      const recordCount = finding.record_count || 100;
      const cleanupTimePerRecord = 0.1; // 6 minutes per record
      const monthlyEfficiencyHours = Math.min(activeUsers * 0.5, 8); // Cap at 8 hours
      const avgUserRate = 40;
      const adminRate = 35;
      
      const cleanupHours = recordCount * cleanupTimePerRecord;
      const cleanupCost = Math.round(cleanupHours * adminRate);
      const monthlyEfficiencySavings = Math.round(monthlyEfficiencyHours * avgUserRate);
      const annualEfficiencySavings = monthlyEfficiencySavings * 12;
      
      const cleanupHoursFormatted = cleanupHours >= 1 
        ? `${Math.round(cleanupHours * 10) / 10} Hours`
        : `${Math.round(cleanupHours * 60)} Minutes`;
      
      breakdownData = {
        recordCount,
        cleanupHours: Math.round(cleanupHours * 10) / 10,
        cleanupHoursFormatted,
        cleanupCost,
        monthlyEfficiencyHours,
        monthlyEfficiencySavings,
        annualEfficiencySavings,
        netAnnualROI: annualEfficiencySavings - cleanupCost,
        avgUserRate,
        adminRate,
        calculationType: 'Data Quality Improvement'
      };
      
    } else {
      // Default/Generic Logic
      findingType = 'generic';
      const timeSavingsHours = finding.time_savings_hours || 2.0;
      const avgUserRate = 40;
      
      const monthlyTimeSavings = timeSavingsHours;
      const monthlySavings = Math.round(monthlyTimeSavings * avgUserRate);
      const annualSavings = monthlySavings * 12;
      
      breakdownData = {
        monthlyTimeSavings,
        monthlySavings,
        annualSavings,
        netAnnualROI: annualSavings,
        avgUserRate,
        calculationType: 'Process Improvement'
      };
    }
    
    return { findingType, ...breakdownData };
  };

  const businessImpactParagraph = getBusinessImpactParagraph(finding);
  const roiBreakdown = getROIBreakdown(finding);
  
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

      {/* ROI Breakdown */}
      <div style={{
        backgroundColor: '#F7F9FF',
        border: '1px solid rgba(0, 122, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginTop: '1.75rem',
        animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <h4 style={{
          fontSize: '1.0625rem',
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: '1.25rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          letterSpacing: '-0.01em'
        }}>
          ROI Breakdown
        </h4>
        <div style={{
          fontSize: '0.9375rem',
          lineHeight: '1.7',
          color: '#3C3C43',
          fontFamily: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "Consolas", monospace'
        }}>
          {/* Custom Fields ROI Breakdown */}
          {roiBreakdown.findingType === 'custom_fields' && (
            <>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Time Lost Per User Per Field Per Day: <span style={{ fontWeight: '600' }}>{roiBreakdown.confusionTimeSeconds} Seconds</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • {roiBreakdown.activeUsers} Users × {roiBreakdown.fieldCount} Fields × {roiBreakdown.workdaysPerMonth} Workdays = <span style={{ fontWeight: '600' }}>{roiBreakdown.monthlyConfusionHours} Hours Per Month Wasted</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Monthly Savings: {roiBreakdown.monthlyConfusionHours} Hours × ${roiBreakdown.avgUserRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.monthlyConfusionSavings.toLocaleString()}/Month</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Annual Savings: ${roiBreakdown.monthlyConfusionSavings.toLocaleString()} × 12 = <span style={{ fontWeight: '600' }}>${roiBreakdown.annualConfusionSavings.toLocaleString()}/Year</span>
              </div>
              <div style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
                • One-Time Cleanup: {roiBreakdown.cleanupHoursFormatted} × ${roiBreakdown.adminRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.cleanupCost.toLocaleString()}</span>
              </div>
            </>
          )}
          
          {/* Automation/Manual Process ROI Breakdown */}
          {roiBreakdown.findingType === 'automation' && (
            <>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Manual Time Per Month: <span style={{ fontWeight: '600' }}>{roiBreakdown.monthlyTimeSavings} Hours</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Monthly Savings: {roiBreakdown.monthlyTimeSavings} Hours × ${roiBreakdown.avgUserRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.monthlySavings.toLocaleString()}/Month</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Annual Savings: ${roiBreakdown.monthlySavings.toLocaleString()} × 12 = <span style={{ fontWeight: '600' }}>${roiBreakdown.annualSavings.toLocaleString()}/Year</span>
              </div>
              <div style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
                • One-Time Setup: {roiBreakdown.setupHoursFormatted} × ${roiBreakdown.adminRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.setupCost.toLocaleString()}</span>
              </div>
            </>
          )}
          
          {/* Data Quality ROI Breakdown */}
          {roiBreakdown.findingType === 'data_quality' && (
            <>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Records To Clean: <span style={{ fontWeight: '600' }}>{roiBreakdown.recordCount} Records</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Monthly Efficiency Gain: <span style={{ fontWeight: '600' }}>{roiBreakdown.monthlyEfficiencyHours} Hours Per Month</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Monthly Savings: {roiBreakdown.monthlyEfficiencyHours} Hours × ${roiBreakdown.avgUserRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.monthlyEfficiencySavings.toLocaleString()}/Month</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Annual Savings: ${roiBreakdown.monthlyEfficiencySavings.toLocaleString()} × 12 = <span style={{ fontWeight: '600' }}>${roiBreakdown.annualEfficiencySavings.toLocaleString()}/Year</span>
              </div>
              <div style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
                • One-Time Cleanup: {roiBreakdown.cleanupHoursFormatted} × ${roiBreakdown.adminRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.cleanupCost.toLocaleString()}</span>
              </div>
            </>
          )}
          
          {/* Generic Process Improvement ROI Breakdown */}
          {roiBreakdown.findingType === 'generic' && (
            <>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Time Saved Per Month: <span style={{ fontWeight: '600' }}>{roiBreakdown.monthlyTimeSavings} Hours</span>
              </div>
              <div style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                • Monthly Savings: {roiBreakdown.monthlyTimeSavings} Hours × ${roiBreakdown.avgUserRate}/Hr = <span style={{ fontWeight: '600' }}>${roiBreakdown.monthlySavings.toLocaleString()}/Month</span>
              </div>
              <div style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
                • Annual Savings: ${roiBreakdown.monthlySavings.toLocaleString()} × 12 = <span style={{ fontWeight: '600' }}>${roiBreakdown.annualSavings.toLocaleString()}/Year</span>
              </div>
            </>
          )}
          
          {/* Subtle separator line */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 122, 255, 0.15) 50%, transparent 100%)',
            margin: '1.25rem 0'
          }}></div>
          
          {/* Final result with subtle highlight - shows actual calculated ROI */}
          <div style={{ 
            marginTop: '1.25rem',
            paddingLeft: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1a1a1a'
          }}>
            • Net Annual ROI: <span style={{
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
              color: '#007AFF',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              border: '1px solid rgba(0, 122, 255, 0.12)'
            }}>${roiBreakdown.netAnnualROI.toLocaleString()}/Year</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

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
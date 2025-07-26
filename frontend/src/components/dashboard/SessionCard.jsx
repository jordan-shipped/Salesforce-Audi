import React from 'react';

const SessionCard = ({ session, formatCurrency, formatDateTime, onClick }) => {
  const {
    id,
    org_name: orgName,
    total_findings: findingsCount = 0,
    total_annual_roi: annualSavings = 0,
    created_at: createdAt,
    status = 'completed'
  } = session;

  const dateInfo = formatDateTime(createdAt);
  
  // Status styling
  const getStatusClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className="card-hover animate-in slide-in-from-bottom-4 duration-300"
      onClick={() => onClick(id)}
    >
      <div className="flex justify-between items-start mb-md">
        <div className="flex-1 min-w-0">
          <h3 className="text-body-large font-semibold text-text-primary truncate">
            {orgName}
          </h3>
          <p className="text-body-regular text-text-grey-600 mt-1">
            {findingsCount} findings • {' '}
            <span className="text-accent font-medium">
              {formatCurrency(annualSavings)}/yr
            </span>
          </p>
        </div>
        
        <div className={`px-2 py-1 rounded-sm border text-caption font-medium ${getStatusClasses(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className="text-caption text-text-grey-600">
          <p className="font-medium">{dateInfo.formattedDate}</p>
          <p>{dateInfo.formattedTime}</p>
        </div>
        
        {status === 'completed' && (
          <button className="text-caption text-accent hover:text-blue-700 font-medium">
            View Report →
          </button>
        )}
      </div>
      
      {status === 'running' && (
        <div className="mt-md">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-accent h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-caption text-text-grey-600 mt-1">Audit in progress...</p>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
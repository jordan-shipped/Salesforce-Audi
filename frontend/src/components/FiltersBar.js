import React from 'react';
import { Select } from './Input';

const FiltersBar = ({ 
  selectedDomain, 
  onDomainChange, 
  selectedPriority, 
  onPriorityChange,
  domains = [],
  priorities = []
}) => {
  const domainOptions = [
    { value: 'All', label: 'All Domains' },
    ...domains.map(domain => ({ value: domain, label: domain }))
  ];

  const priorityOptions = [
    { value: 'All', label: 'All Priorities' },
    ...priorities.map(priority => ({ value: priority, label: priority }))
  ];

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <Select
          label="Domain"
          value={selectedDomain}
          onChange={(e) => onDomainChange(e.target.value)}
          options={domainOptions}
        />
      </div>
      
      <div className="filter-group">
        <Select
          label="Priority"
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          options={priorityOptions}
        />
      </div>
    </div>
  );
};

export default FiltersBar;
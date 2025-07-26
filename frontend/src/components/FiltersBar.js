import React from 'react';
import { Select } from './Input';

const FiltersBar = ({ 
  domains = ["All","Data Quality","Automation","Security","Reporting","Adoption"],
  priorities = ["All","High","Medium","Low"],
  selectedDomain = "All",
  selectedPriority = "All",
  onFilterChange
}) => {
  const handleDomainChange = (e) => {
    if (onFilterChange) {
      onFilterChange({ domain: e.target.value, priority: selectedPriority });
    }
  };

  const handlePriorityChange = (e) => {
    if (onFilterChange) {
      onFilterChange({ domain: selectedDomain, priority: e.target.value });
    }
  };

  return (
    <div className="FiltersBar">
      <Select
        label="Domain"
        value={selectedDomain}
        onChange={handleDomainChange}
        options={domains.map(domain => ({ value: domain, label: domain }))}
        className="FilterSelect"
      />
      <Select
        label="Priority"
        value={selectedPriority}
        onChange={handlePriorityChange}
        options={priorities.map(priority => ({ value: priority, label: priority }))}
        className="FilterSelect"
      />
    </div>
  );
};

export default FiltersBar;
import React, { useState } from 'react';
import Modal from '../Modal';
import { Select } from '../Input';

const OrgProfileModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [auditMode, setAuditMode] = useState('quick');
  const [departmentSalaries, setDepartmentSalaries] = useState({
    customer_service: 45000,
    sales: 65000,
    marketing: 60000,
    engineering: 85000,
    executives: 120000
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const auditRequest = {
      use_quick_estimate: auditMode === 'quick',
      department_salaries: auditMode === 'custom' ? departmentSalaries : null
    };

    onSubmit(auditRequest);
  };

  const handleSalaryChange = (department) => (e) => {
    const value = parseInt(e.target.value) || 0;
    setDepartmentSalaries(prev => ({
      ...prev,
      [department]: value
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Audit Configuration"
    >
      <form onSubmit={handleSubmit} className="space-y-lg">
        <div>
          <p className="text-body-regular text-text-grey-600 mb-md">
            Choose how to calculate cost savings for your organization.
          </p>
          
          <div className="space-y-md">
            <label className="flex items-start gap-3 p-md border border-border-subtle rounded-md cursor-pointer hover:bg-background-light">
              <input
                type="radio"
                name="auditMode"
                value="quick"
                checked={auditMode === 'quick'}
                onChange={(e) => setAuditMode(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="text-body-large font-medium text-text-primary">
                  Quick Estimate (Recommended)
                </div>
                <div className="text-body-regular text-text-grey-600">
                  Use industry averages for salary calculations. Fastest and most accurate for most organizations.
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-md border border-border-subtle rounded-md cursor-pointer hover:bg-background-light">
              <input
                type="radio"
                name="auditMode"
                value="custom"
                checked={auditMode === 'custom'}
                onChange={(e) => setAuditMode(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="text-body-large font-medium text-text-primary">
                  Custom Department Salaries
                </div>
                <div className="text-body-regular text-text-grey-600">
                  Provide specific salary ranges for more precise calculations.
                </div>
              </div>
            </label>
          </div>
        </div>

        {auditMode === 'custom' && (
          <div className="space-y-md">
            <h3 className="text-body-large font-semibold text-text-primary">
              Department Average Salaries
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="input-label">Customer Service</label>
                <input
                  type="number"
                  value={departmentSalaries.customer_service}
                  onChange={handleSalaryChange('customer_service')}
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="input-label">Sales</label>
                <input
                  type="number"
                  value={departmentSalaries.sales}
                  onChange={handleSalaryChange('sales')}
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="input-label">Marketing</label>
                <input
                  type="number"
                  value={departmentSalaries.marketing}
                  onChange={handleSalaryChange('marketing')}
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="input-label">Engineering</label>
                <input
                  type="number"
                  value={departmentSalaries.engineering}
                  onChange={handleSalaryChange('engineering')}
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="input-label">Executives</label>
                <input
                  type="number"
                  value={departmentSalaries.executives}
                  onChange={handleSalaryChange('executives')}
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-md pt-md">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Running Audit...
              </>
            ) : (
              'Start Audit'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrgProfileModal;
import React, { useState } from 'react';
import Modal from '../Modal';
import { Input, Select } from '../Input';

const PreAuditModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    revenue_range: '',
    employee_range: '',
    annual_revenue: 1000000,
    employee_headcount: 50
  });
  const [error, setError] = useState('');

  const revenueOptions = [
    { value: 'Under $1M', label: 'Under $1M' },
    { value: '$1M - $10M', label: '$1M - $10M' },
    { value: '$10M - $50M', label: '$10M - $50M' },
    { value: '$50M - $100M', label: '$50M - $100M' },
    { value: 'Over $100M', label: 'Over $100M' }
  ];

  const employeeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.revenue_range || !formData.employee_range) {
      setError('Please fill in all required fields.');
      return;
    }

    // Convert ranges to numeric values for backend
    const processedData = {
      ...formData,
      annual_revenue: convertRevenueToNumber(formData.revenue_range),
      employee_headcount: convertEmployeesToNumber(formData.employee_range)
    };

    onSubmit(processedData);
  };

  const convertRevenueToNumber = (range) => {
    const mapping = {
      'Under $1M': 500000,
      '$1M - $10M': 5000000,
      '$10M - $50M': 25000000,
      '$50M - $100M': 75000000,
      'Over $100M': 150000000
    };
    return mapping[range] || 1000000;
  };

  const convertEmployeesToNumber = (range) => {
    const mapping = {
      '1-10': 5,
      '11-50': 25,
      '51-200': 100,
      '201-500': 300,
      '500+': 750
    };
    return mapping[range] || 50;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Business Information"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        <p className="text-body-regular text-text-grey-600 mb-md">
          Help us tailor the audit to your business size for more accurate insights.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-md">
            <p className="text-body-regular text-red-800">{error}</p>
          </div>
        )}

        <Select
          label="Annual Revenue"
          value={formData.revenue_range}
          onChange={handleChange('revenue_range')}
          options={[{ value: '', label: 'Select revenue range...' }, ...revenueOptions]}
          required
        />

        <Select
          label="Number of Employees"
          value={formData.employee_range}
          onChange={handleChange('employee_range')}
          options={[{ value: '', label: 'Select employee count...' }, ...employeeOptions]}
          required
        />

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
                Saving...
              </>
            ) : (
              'Continue to Audit'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PreAuditModal;
import { createContext, useContext, useState, useEffect } from 'react';
import SecureStorage from '../utils/secureStorage';
import { api } from '../services/apiService';

// Create context
const BusinessInfoContext = createContext();

// Custom hook to use business info
export const useBusinessInfo = () => {
  const context = useContext(BusinessInfoContext);
  if (!context) {
    throw new Error('useBusinessInfo must be used within BusinessInfoProvider');
  }
  return context;
};

// Provider component
export const BusinessInfoProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [hasBusinessInfo, setHasBusinessInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load business info on mount
  useEffect(() => {
    loadBusinessInfo();
  }, []);

  const loadBusinessInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from secure storage first
      const storedInfo = SecureStorage.getItem('business_info');
      const businessSessionId = SecureStorage.getItem('business_session_id');

      if (storedInfo && businessSessionId) {
        setBusinessInfo(storedInfo);
        setHasBusinessInfo(true);
      } else {
        setBusinessInfo(null);
        setHasBusinessInfo(false);
      }
    } catch (error) {
      console.error('Failed to load business info:', error);
      setError('Failed to load saved business information');
      
      // Clear potentially corrupted data
      SecureStorage.removeItem('business_info');
      SecureStorage.removeItem('business_session_id');
      setBusinessInfo(null);
      setHasBusinessInfo(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBusinessInfo = async (info) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!info || (!info.annual_revenue && !info.employee_headcount)) {
        throw new Error('Business information is required');
      }

      // Save to backend first
      const response = await api.saveBusinessInfo(info);
      
      if (!response.business_session_id) {
        throw new Error('Failed to get business session ID from server');
      }

      // Save to secure storage
      const success1 = SecureStorage.setItem('business_session_id', response.business_session_id);
      const success2 = SecureStorage.setItem('business_info', info);

      if (!success1 || !success2) {
        throw new Error('Failed to save business information locally');
      }

      // Update state
      setBusinessInfo(info);
      setHasBusinessInfo(true);

      return response;
    } catch (error) {
      console.error('Failed to save business info:', error);
      setError(error.message || 'Failed to save business information');
      throw error; // Re-throw for component error handling
    } finally {
      setIsLoading(false);
    }
  };

  const clearBusinessInfo = () => {
    try {
      SecureStorage.removeItem('business_info');
      SecureStorage.removeItem('business_session_id');
      setBusinessInfo(null);
      setHasBusinessInfo(false);
      setError(null);
    } catch (error) {
      console.error('Failed to clear business info:', error);
      setError('Failed to clear business information');
    }
  };

  const updateBusinessInfo = async (updates) => {
    if (!businessInfo) {
      throw new Error('No business information to update');
    }

    const updatedInfo = { ...businessInfo, ...updates };
    return saveBusinessInfo(updatedInfo);
  };

  const value = {
    // State
    businessInfo,
    hasBusinessInfo,
    isLoading,
    error,

    // Actions
    saveBusinessInfo,
    clearBusinessInfo,
    updateBusinessInfo,
    loadBusinessInfo,
  };

  return (
    <BusinessInfoContext.Provider value={value}>
      {children}
    </BusinessInfoContext.Provider>
  );
};

export default BusinessInfoContext;
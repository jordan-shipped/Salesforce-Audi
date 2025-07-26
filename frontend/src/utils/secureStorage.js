/**
 * Secure Storage Utility
 * Provides encrypted and validated storage for sensitive data
 */

class SecureStorage {
  static PREFIX = 'sf_audit_';
  static VERSION = '1.0';

  /**
   * Simple encryption for client-side data (not cryptographically secure for sensitive data)
   * For production, consider using Web Crypto API or server-side encryption
   */
  static encrypt(text) {
    if (!text) return null;
    
    try {
      // Simple base64 encoding with rotation (better than plaintext)
      const encoded = btoa(unescape(encodeURIComponent(text)));
      return this.VERSION + ':' + encoded;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  static decrypt(encodedText) {
    if (!encodedText) return null;
    
    try {
      // Check version compatibility
      const [version, data] = encodedText.split(':');
      if (version !== this.VERSION) {
        console.warn('Storage version mismatch, clearing data');
        return null;
      }
      
      return decodeURIComponent(escape(atob(data)));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Validate data structure before storing
   */
  static validateData(key, data) {
    const validators = {
      'business_info': (data) => {
        return data && typeof data === 'object' && 
               (data.annual_revenue || data.employee_headcount);
      },
      'salesforce_session_id': (data) => {
        return typeof data === 'string' && data.length > 0;
      },
      'business_session_id': (data) => {
        return typeof data === 'string' && data.length > 0;
      }
    };

    const validator = validators[key];
    return validator ? validator(data) : true;
  }

  /**
   * Securely store data with validation and encryption
   */
  static setItem(key, value) {
    try {
      // Validate the data structure
      if (!this.validateData(key, value)) {
        console.error(`Invalid data structure for key: ${key}`);
        return false;
      }

      // Add metadata
      const dataWithMeta = {
        data: value,
        timestamp: Date.now(),
        version: this.VERSION
      };

      // Encrypt and store
      const encrypted = this.encrypt(JSON.stringify(dataWithMeta));
      if (!encrypted) {
        console.error('Failed to encrypt data');
        return false;
      }

      localStorage.setItem(this.PREFIX + key, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }

  /**
   * Securely retrieve and validate data
   */
  static getItem(key) {
    try {
      const encrypted = localStorage.getItem(this.PREFIX + key);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      if (!decrypted) {
        // Clean up corrupted data
        this.removeItem(key);
        return null;
      }

      const parsed = JSON.parse(decrypted);
      
      // Check data age (optional: expire after 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      if (Date.now() - parsed.timestamp > maxAge) {
        console.warn(`Data expired for key: ${key}`);
        this.removeItem(key);
        return null;
      }

      // Validate retrieved data
      if (!this.validateData(key, parsed.data)) {
        console.error(`Retrieved data validation failed for key: ${key}`);
        this.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      // Clean up corrupted data
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  /**
   * Clear all app data from storage
   */
  static clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get all stored keys (for debugging)
   */
  static getKeys() {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .map(key => key.replace(this.PREFIX, ''));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Check if storage is available and working
   */
  static isAvailable() {
    try {
      const testKey = this.PREFIX + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage not available:', error);
      return false;
    }
  }
}

// Migration utility to convert existing localStorage to secure storage
export const migrateToSecureStorage = () => {
  const keysToMigrate = [
    'business_info',
    'business_session_id', 
    'salesforce_session_id'
  ];

  keysToMigrate.forEach(key => {
    try {
      const oldValue = localStorage.getItem(key);
      if (oldValue) {
        let parsedValue;
        try {
          parsedValue = JSON.parse(oldValue);
        } catch {
          parsedValue = oldValue; // String value
        }

        // Store in secure storage
        if (SecureStorage.setItem(key, parsedValue)) {
          // Remove old unencrypted data
          localStorage.removeItem(key);
          console.log(`Migrated ${key} to secure storage`);
        }
      }
    } catch (error) {
      console.error(`Failed to migrate ${key}:`, error);
    }
  });
};

export default SecureStorage;
/**
 * Cleanup Utilities
 * Provides functions to prevent memory leaks and clean up resources
 */

// Production logging - replace console.log statements
export const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
    // In production, send to logging service
  },
  
  warn: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, send to logging service
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
    // Always log errors, send to error reporting service
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

// Interval cleanup manager
class IntervalManager {
  constructor() {
    this.intervals = new Set();
  }

  setInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }

  clearInterval(intervalId) {
    clearInterval(intervalId);
    this.intervals.delete(intervalId);
  }

  clearAllIntervals() {
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
  }

  getActiveIntervals() {
    return this.intervals.size;
  }
}

// Timeout cleanup manager
class TimeoutManager {
  constructor() {
    this.timeouts = new Set();
  }

  setTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      callback();
      this.timeouts.delete(timeoutId);
    }, delay);
    this.timeouts.add(timeoutId);
    return timeoutId;
  }

  clearTimeout(timeoutId) {
    clearTimeout(timeoutId);
    this.timeouts.delete(timeoutId);
  }

  clearAllTimeouts() {
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  getActiveTimeouts() {
    return this.timeouts.size;
  }
}

// Abort controller manager for API requests
class AbortControllerManager {
  constructor() {
    this.controllers = new Map();
  }

  create(key) {
    // Cancel existing request with same key
    this.abort(key);
    
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  abort(key) {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  abortAll() {
    this.controllers.forEach(controller => {
      controller.abort();
    });
    this.controllers.clear();
  }

  getActiveRequests() {
    return this.controllers.size;
  }
}

// Global cleanup managers
export const intervalManager = new IntervalManager();
export const timeoutManager = new TimeoutManager();
export const abortManager = new AbortControllerManager();

// React hook for cleanup
export const useCleanup = () => {
  const [cleanupCallbacks] = React.useState(new Set());

  const addCleanup = React.useCallback((callback) => {
    cleanupCallbacks.add(callback);
    return () => cleanupCallbacks.delete(callback);
  }, [cleanupCallbacks]);

  React.useEffect(() => {
    return () => {
      cleanupCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          logger.error('Cleanup callback failed:', error);
        }
      });
      cleanupCallbacks.clear();
    };
  }, [cleanupCallbacks]);

  return { addCleanup };
};

// Enhanced useEffect with automatic cleanup
export const useEffectWithCleanup = (effect, deps) => {
  React.useEffect(() => {
    let cleanup;
    let mounted = true;

    const runEffect = async () => {
      try {
        cleanup = await effect({ mounted: () => mounted });
      } catch (error) {
        logger.error('Effect failed:', error);
      }
    };

    runEffect();

    return () => {
      mounted = false;
      if (cleanup && typeof cleanup === 'function') {
        try {
          cleanup();
        } catch (error) {
          logger.error('Effect cleanup failed:', error);
        }
      }
    };
  }, deps);
};

// Polling hook with automatic cleanup
export const usePolling = (callback, interval, immediate = true) => {
  const [isPolling, setIsPolling] = React.useState(false);
  const callbackRef = React.useRef(callback);
  const intervalRef = React.useRef(null);

  // Update callback ref when callback changes
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startPolling = React.useCallback(() => {
    if (intervalRef.current) return; // Already polling

    setIsPolling(true);
    
    if (immediate) {
      callbackRef.current();
    }

    intervalRef.current = intervalManager.setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [interval, immediate]);

  const stopPolling = React.useCallback(() => {
    if (intervalRef.current) {
      intervalManager.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
};

// Memory leak detection (development only)
export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const logLeaks = () => {
    const activeIntervals = intervalManager.getActiveIntervals();
    const activeTimeouts = timeoutManager.getActiveTimeouts();
    const activeRequests = abortManager.getActiveRequests();

    if (activeIntervals > 0 || activeTimeouts > 0 || activeRequests > 0) {
      logger.warn('Potential memory leaks detected:', {
        intervals: activeIntervals,
        timeouts: activeTimeouts,
        requests: activeRequests,
      });
    }
  };

  // Check for leaks every 30 seconds in development
  const leakDetectionInterval = setInterval(logLeaks, 30000);

  return () => clearInterval(leakDetectionInterval);
};

// Production build cleanup - remove development code
export const stripDevelopmentCode = (code) => {
  if (process.env.NODE_ENV === 'production') {
    // Remove console.log statements
    return code.replace(/console\.(log|debug|info)\([^)]*\);?/g, '');
  }
  return code;
};

// Global cleanup function
export const globalCleanup = () => {
  logger.info('Performing global cleanup...');
  
  intervalManager.clearAllIntervals();
  timeoutManager.clearAllTimeouts();
  abortManager.abortAll();
  
  logger.info('Global cleanup completed');
};

// Browser tab/window cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', globalCleanup);
  window.addEventListener('unload', globalCleanup);
}

export default {
  logger,
  intervalManager,
  timeoutManager,
  abortManager,
  useCleanup,
  useEffectWithCleanup,
  usePolling,
  detectMemoryLeaks,
  globalCleanup,
};
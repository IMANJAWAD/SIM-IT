import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, AlertCircle } from 'lucide-react';

// Alert types with corresponding colors and icons
const ALERT_TYPES = {
  error: {
    bg: 'linear-gradient(135deg, #780000, #C1121F)',
    icon: AlertCircle,
    iconColor: '#ffffff'
  },
  warning: {
    bg: 'linear-gradient(135deg, #780000, #C1121F)',
    icon: AlertTriangle,
    iconColor: '#ffffff'
  },
  success: {
    bg: 'linear-gradient(135deg, #780000, #C1121F)',
    icon: CheckCircle,
    iconColor: '#ffffff'
  },
  info: {
    bg: 'linear-gradient(135deg, #780000, #C1121F)',
    icon: Info,
    iconColor: '#ffffff'
  }
};

// Global alert state management
let alertQueue = [];
let setGlobalAlerts = null;

// Custom Alert Component
const CustomAlert = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    setGlobalAlerts = setAlerts;
    return () => {
      setGlobalAlerts = null;
    };
  }, []);

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-[9999] space-y-3 max-w-md">
      <AnimatePresence>
        {alerts.map((alert) => {
          const alertType = ALERT_TYPES[alert.type] || ALERT_TYPES.error;
          const IconComponent = alertType.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25,
                duration: 0.4 
              }}
              className="relative rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden"
              style={{ background: alertType.bg }}
            >
              {/* Close Button */}
              <button
                onClick={() => removeAlert(alert.id)}
                className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="p-6 pr-12">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" style={{ color: alertType.iconColor }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {alert.title && (
                      <h4 className="text-white font-bold text-sm mb-1">
                        {alert.title}
                      </h4>
                    )}
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {alert.actions && alert.actions.length > 0 && (
                  <div className="mt-4 flex gap-2 justify-end">
                    {alert.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.handler();
                          removeAlert(alert.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          action.primary
                            ? 'bg-white text-gray-800 hover:bg-gray-100'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-dismiss progress bar */}
              {alert.autoClose && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: alert.duration || 5, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Alert API functions
export const showAlert = (message, options = {}) => {
  const alert = {
    id: Date.now() + Math.random(),
    message,
    type: options.type || 'error',
    title: options.title,
    actions: options.actions,
    autoClose: options.autoClose !== false,
    duration: options.duration || 5000
  };

  if (setGlobalAlerts) {
    setGlobalAlerts(prev => [...prev, alert]);
  } else {
    alertQueue.push(alert);
  }

  // Auto-remove after duration
  if (alert.autoClose) {
    setTimeout(() => {
      if (setGlobalAlerts) {
        setGlobalAlerts(prev => prev.filter(a => a.id !== alert.id));
      }
    }, alert.duration);
  }

  return alert.id;
};

export const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const alert = {
      id: Date.now() + Math.random(),
      message,
      type: options.type || 'warning',
      title: options.title || 'Confirmation Required',
      autoClose: false,
      actions: [
        {
          label: options.cancelLabel || 'Cancel',
          primary: false,
          handler: () => resolve(false)
        },
        {
          label: options.confirmLabel || 'OK',
          primary: true,
          handler: () => resolve(true)
        }
      ]
    };

    if (setGlobalAlerts) {
      setGlobalAlerts(prev => [...prev, alert]);
    }
  });
};

export const showSuccess = (message, options = {}) => {
  return showAlert(message, { ...options, type: 'success' });
};

export const showWarning = (message, options = {}) => {
  return showAlert(message, { ...options, type: 'warning' });
};

export const showInfo = (message, options = {}) => {
  return showAlert(message, { ...options, type: 'info' });
};

export const showError = (message, options = {}) => {
  return showAlert(message, { ...options, type: 'error' });
};

export default CustomAlert;
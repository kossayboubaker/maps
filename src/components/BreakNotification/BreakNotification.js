import React, { useState, useEffect } from 'react';

const BreakNotification = ({ notification, onClose, onStartBreak, onBreakEnd }) => {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes en secondes
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Détection responsive
  const isMobile = window.innerWidth < 768;
  const isUltraCompact = window.innerWidth < 350;
  

  useEffect(() => {
    if (!isOnBreak) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsOnBreak(false);
          onBreakEnd?.(notification.truckId);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOnBreak, onClose, onBreakEnd, notification.truckId]);

  const handleStartBreak = () => {
    setIsOnBreak(true);
    onStartBreak?.(notification);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: isUltraCompact ? '6px' : isMobile ? '6px' : '10px',
      right: isUltraCompact ? '5px' : isMobile ? '10px' : '20px',
      zIndex: 9999,
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: `1px solid #f59e0b`,
      borderRadius: isUltraCompact ? '6px' : '12px',
      padding: isUltraCompact ? '8px' : '12px',
      width: isUltraCompact ? '160px' : isMobile ? '220px' : '280px',
      boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
      animation: 'slideInRight 0.3s ease-out',
      fontSize: isUltraCompact ? '12px' : '14px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isUltraCompact ? '6px' : '8px',
        marginBottom: isUltraCompact ? '8px' : '12px'
      }}>
        <div style={{
          fontSize: isUltraCompact ? '20px' : '24px',
          animation: 'pulse 2s infinite'
        }}>
          🚦
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: isUltraCompact ? '13px' : '15px',
            fontWeight: '700',
            color: '#92400e',
            lineHeight: '1.3'
          }}>
            Pause Obligatoire
          </h3>
          <p style={{
            margin: 0,
            fontSize: isUltraCompact ? '11px' : '12px',
            color: '#b45309'
          }}>
            {notification.truckId}
          </p>
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: isUltraCompact ? '16px' : '18px',
            cursor: 'pointer',
            color: '#92400e',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{
        background: 'rgba(251, 191, 36, 0.2)',
        borderRadius: '8px',
        padding: isUltraCompact ? '8px' : '12px',
        marginBottom: isUltraCompact ? '8px' : '12px'
      }}>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: isUltraCompact ? '11px' : '13px',
          color: '#92400e',
          lineHeight: '1.4'
        }}>
          {notification.message}
        </p>
        
        {isOnBreak ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: isUltraCompact ? '18px' : '20px',
              fontWeight: '700',
              color: '#92400e',
              marginBottom: '6px'
            }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{
              background: '#fbbf24',
              height: '6px',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#92400e',
                height: '100%',
                width: `${((45 * 60 - timeLeft) / (45 * 60)) * 100}%`,
                transition: 'width 1s linear'
              }}></div>
            </div>
            <p style={{
              margin: '6px 0 0 0',
              fontSize: isUltraCompact ? '10px' : '11px',
              color: '#b45309'
            }}>
              Pause en cours...
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStartBreak}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: isUltraCompact ? '6px 10px' : '8px 12px',
                fontSize: isUltraCompact ? '11px' : '13px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🛑 {isUltraCompact ? 'Pause 45min' : 'Commencer pause (45min)'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        fontSize: isUltraCompact ? '10px' : '11px',
        color: '#a74d07ff',
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        📍 Point de pause obligatoire
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

export default BreakNotification;
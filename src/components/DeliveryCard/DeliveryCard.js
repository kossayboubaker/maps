import React, { useState, useEffect } from 'react';

const DeliveryCard = ({ delivery, isSelected = false, onSelect }) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', color: '#15803d', text: '🟢 Terminé' };
      case 'in-progress': return { bg: '#fef9c3', color: '#b45309', text: '🟠 En cours' };
      case 'delayed': return { bg: '#fee2e2', color: '#b91c1c', text: '🔴 Retard' };
      case 'pending': return { bg: '#dbeafe', color: '#1d4ed8', text: '🔵 Attente' };
      default: return { bg: '#e0e7ff', color: '#4338ca', text: `ℹ️ ${status}` };
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'completed': return 100;
      case 'in-progress': return 65;
      case 'delayed': return 45;
      case 'pending': return 20;
      default: return 0;
    }
  };

  const statusInfo = getStatusColor(delivery.status);
  const progress = getProgressPercentage(delivery.status);
  const fuelConsumption = "4L/100km";

  const getResponsiveConfig = () => {
    const { width } = screenSize;
    if (width < 320) return { padding: '8px', gap: '4px', textSize: '11px', iconSize: 16, borderRadius: '8px' };
    if (width < 480) return { padding: '10px', gap: '6px', textSize: '12px', iconSize: 18, borderRadius: '10px' };
    if (width < 768) return { padding: '12px', gap: '8px', textSize: '13px', iconSize: 20, borderRadius: '12px' };
    return { padding: '16px', gap: '8px', textSize: '14px', iconSize: 22, borderRadius: '14px' };
  };

  const responsive = getResponsiveConfig();

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? '#eff6ff' : '#fff',
        borderRadius: responsive.borderRadius,
        boxShadow: isSelected ? '0 8px 25px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        padding: responsive.padding,
        display: 'flex',
        flexDirection: 'column',
        gap: responsive.gap,
        margin: '6px 8px',
        width: 'calc(100% - 16px)',
        maxWidth: 'calc(100% - 16px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        wordBreak: 'break-word',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        '::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: responsive.borderRadius,
          background: isSelected ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)' : 'transparent',
          zIndex: -1
        }
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: responsive.gap }}>
        <span
          style={{
            fontSize: responsive.textSize,
            padding: '1px 4px',
            borderRadius: '10px',
            fontWeight: '500',
            backgroundColor: delivery.ecoMode ? '#d1fae5' : '#e5e7eb',
            color: delivery.ecoMode ? '#065f46' : '#4b5563',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          Eco {delivery.ecoMode ? 'ON' : 'OFF'}
        </span>
        <span
          style={{
            fontSize: responsive.textSize,
            fontWeight: '600',
            color: '#1976d2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            textAlign: 'right',
          }}
        >
          {delivery.id}
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: responsive.gap, alignItems: 'center' }}>
        <div
          style={{
            width: responsive.iconSize,
            height: responsive.iconSize,
            borderRadius: '3px',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          🚚
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: responsive.textSize,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {delivery.vehicle}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: responsive.textSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
              }}
            >
              {fuelConsumption}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontSize: responsive.textSize,
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              ⏱️ {delivery.speed || 0}km/h
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: progress >= 90 ? '#dcfce7' : progress >= 50 ? '#fef3c7' : '#fee2e2',
                border: `1px solid ${progress >= 90 ? '#bbf7d0' : progress >= 50 ? '#fde68a' : '#fecaca'}`
              }}
            >
              <span
                style={{
                  fontSize: responsive.textSize,
                  fontWeight: '600',
                  color: progress >= 90 ? '#059669' : progress >= 50 ? '#d97706' : '#dc2626',
                  whiteSpace: 'nowrap',
                }}
              >
                {progress}%
              </span>
            </div>
          </div>
          <div
            style={{
              height: '3px',
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
              marginTop: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: progress >= 90 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
                           progress >= 50 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' :
                           'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '2px',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: progress > 0 ? 'shimmer 2s infinite' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: responsive.gap }}>
        <div style={{ display: 'flex', gap: responsive.gap, alignItems: 'center' }}>
          <span style={{ color: '#22c55e' }}>🟢</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: responsive.textSize,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {delivery.pickup.address}
            </div>
            <div
              style={{
                fontSize: responsive.textSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {delivery.pickup.city}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: responsive.gap, alignItems: 'center' }}>
          <span style={{ color: '#3b82f6' }}>🔵</span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: responsive.textSize,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {typeof delivery.destination === 'string' ? delivery.destination : delivery.destination.address}
            </div>
            <div
              style={{
                fontSize: responsive.textSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {typeof delivery.destination === 'string' ? 'Destination' : delivery.destination.city}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9',
          paddingTop: responsive.gap,
          gap: responsive.gap,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: responsive.gap, minWidth: 0 }}>
          <div
            style={{
              width: responsive.iconSize,
              height: responsive.iconSize,
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: responsive.textSize,
              color: 'white',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {delivery.driver.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: responsive.textSize,
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {delivery.driver.name}
            </div>
            <div
              style={{
                fontSize: responsive.textSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {delivery.driver.contact}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: responsive.textSize,
            backgroundColor: statusInfo.bg,
            color: statusInfo.color,
            padding: '4px 8px',
            borderRadius: '8px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            border: `1px solid ${statusInfo.color}20`,
            boxShadow: `0 2px 4px ${statusInfo.color}15`
          }}
        >
          <span>{statusInfo.text}</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;

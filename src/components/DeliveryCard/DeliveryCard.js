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
    if (width < 200) return { padding: '2px', gap: '2px', textSize: '6px', iconSize: 8 };
    if (width < 250) return { padding: '3px', gap: '3px', textSize: '7px', iconSize: 10 };
    if (width < 320) return { padding: '4px', gap: '4px', textSize: '8px', iconSize: 12 };
    if (width < 400) return { padding: '6px', gap: '6px', textSize: '9px', iconSize: 14 };
    return { padding: '8px', gap: '8px', textSize: '10px', iconSize: 16 };
  };

  const responsive = getResponsiveConfig();

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? '#eff6ff' : '#fff',
        borderRadius: responsive.gap,
        boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        padding: responsive.padding,
        display: 'flex',
        flexDirection: 'column',
        gap: responsive.gap,
        margin: '2px 0',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        wordBreak: 'break-word',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
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
              {totalDelay > 0 ? `+${totalDelay}min` : '0h15'} ⏱️ {delivery.speed}km/h
            </span>
            <span
              style={{
                fontSize: responsive.textSize,
                fontWeight: '600',
                color: '#1976d2',
                whiteSpace: 'nowrap',
              }}
            >
              {progress}%
            </span>
          </div>

          {/* Affichage alertes si présentes */}
          {alertsCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
              padding: '2px 4px',
              backgroundColor: '#fef2f2',
              borderRadius: '4px',
              border: '1px solid #fecaca'
            }}>
              <span style={{ fontSize: responsive.textSize, color: '#ef4444' }}>
                ⚠️ {alertsCount} alerte{alertsCount > 1 ? 's' : ''}
              </span>
              {totalDelay > 0 && (
                <span style={{
                  fontSize: responsive.textSize,
                  color: '#dc2626',
                  fontWeight: '600',
                  marginLeft: 'auto'
                }}>
                  +{totalDelay}min
                </span>
              )}
            </div>
          )}
          <div
            style={{
              height: '2px',
              backgroundColor: '#e5e7eb',
              borderRadius: '1px',
              marginTop: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#1976d2',
                borderRadius: '1px',
                transition: 'width 0.3s ease',
              }}
            />
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
              {delivery.destination.address}
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
              {delivery.destination.city}
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
        <span
          style={{
            fontSize: responsive.textSize,
            backgroundColor: statusInfo.bg,
            color: statusInfo.color,
            padding: '1px 4px',
            borderRadius: '6px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}
        >
          {statusInfo.text}
        </span>
      </div>
    </div>
  );
};

export default DeliveryCard;

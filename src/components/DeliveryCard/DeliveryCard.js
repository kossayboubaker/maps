import React from 'react';

const DeliveryCard = ({ delivery, isSelected = false, onSelect, screenSize, config }) => {
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

  // Configuration responsive adaptée
  const getCardConfig = () => {
    const { width } = screenSize;
    
    if (width >= 3840) { // 4K+
      return {
        padding: '20px',
        borderRadius: '16px',
        fontSize: '16px',
        smallFontSize: '14px',
        tinyFontSize: '12px',
        iconSize: 28,
        avatarSize: 32,
        gap: '12px',
        smallGap: '8px'
      };
    } else if (width >= 2560) { // 2K
      return {
        padding: '18px',
        borderRadius: '14px',
        fontSize: '15px',
        smallFontSize: '13px',
        tinyFontSize: '11px',
        iconSize: 26,
        avatarSize: 30,
        gap: '10px',
        smallGap: '6px'
      };
    } else if (width >= 1920) { // Full HD
      return {
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        smallFontSize: '12px',
        tinyFontSize: '10px',
        iconSize: 24,
        avatarSize: 28,
        gap: '8px',
        smallGap: '6px'
      };
    } else if (width >= 1440) { // Desktop
      return {
        padding: '14px',
        borderRadius: '12px',
        fontSize: '14px',
        smallFontSize: '12px',
        tinyFontSize: '10px',
        iconSize: 22,
        avatarSize: 26,
        gap: '8px',
        smallGap: '5px'
      };
    } else if (width >= 1024) { // Laptop
      return {
        padding: '12px',
        borderRadius: '10px',
        fontSize: '13px',
        smallFontSize: '11px',
        tinyFontSize: '9px',
        iconSize: 20,
        avatarSize: 24,
        gap: '6px',
        smallGap: '4px'
      };
    } else if (width >= 768) { // Tablet
      return {
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        smallFontSize: '10px',
        tinyFontSize: '8px',
        iconSize: 18,
        avatarSize: 22,
        gap: '6px',
        smallGap: '4px'
      };
    } else if (width >= 480) { // Mobile Large
      return {
        padding: '8px',
        borderRadius: '8px',
        fontSize: '11px',
        smallFontSize: '9px',
        tinyFontSize: '7px',
        iconSize: 16,
        avatarSize: 20,
        gap: '4px',
        smallGap: '3px'
      };
    } else { // Mobile Small
      return {
        padding: '6px',
        borderRadius: '6px',
        fontSize: '10px',
        smallFontSize: '8px',
        tinyFontSize: '7px',
        iconSize: 14,
        avatarSize: 18,
        gap: '3px',
        smallGap: '2px'
      };
    }
  };

  const cardConfig = getCardConfig();

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes ecoShine {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .delivery-card-responsive {
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .delivery-card-responsive:hover {
            transform: translateY(-2px) scale(1.01) !important;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25) !important;
          }

          .delivery-card-responsive.selected::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
            background-size: 400% 400%;
            border-radius: inherit;
            z-index: -2;
            animation: gradientShift 3s ease infinite;
          }

          .eco-badge-responsive {
            position: relative;
            overflow: hidden;
          }

          .eco-badge-responsive.eco-on::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: ecoShine 2s infinite;
          }
        `}
      </style>
      <div
        className={`delivery-card-responsive ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
        style={{
          backgroundColor: isSelected ? '#eff6ff' : '#fff',
          borderRadius: cardConfig.borderRadius,
          boxShadow: isSelected ? '0 8px 25px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
          border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          padding: cardConfig.padding,
          display: 'flex',
          flexDirection: 'column',
          gap: cardConfig.gap,
          margin: 0,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          cursor: onSelect ? 'pointer' : 'default',
          transform: isSelected ? 'translateY(-1px) scale(1.01)' : 'translateY(0) scale(1)',
          position: 'relative'
        }}
      >
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: cardConfig.smallGap,
          flexShrink: 0
        }}>
          <span
            className={`eco-badge-responsive ${delivery.ecoMode ? 'eco-on' : ''}`}
            style={{
              fontSize: cardConfig.smallFontSize,
              padding: `${parseInt(cardConfig.padding) * 0.2}px ${parseInt(cardConfig.padding) * 0.4}px`,
              borderRadius: `${parseInt(cardConfig.borderRadius) * 0.6}px`,
              fontWeight: '600',
              backgroundColor: delivery.ecoMode ? '#d1fae5' : '#f3f4f6',
              color: delivery.ecoMode ? '#065f46' : '#6b7280',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              border: delivery.ecoMode ? '1px solid #10b981' : '1px solid #d1d5db',
              boxShadow: delivery.ecoMode ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0
            }}
          >
            {delivery.ecoMode ? '🌿' : '⚡'} {delivery.ecoMode ? 'ECO' : 'STD'}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: cardConfig.smallGap,
            flex: 1,
            justifyContent: 'flex-end',
            minWidth: 0
          }}>
            <span style={{
              fontSize: cardConfig.fontSize,
              fontWeight: '700',
              color: '#1e40af',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 2px rgba(30, 64, 175, 0.1)'
            }}>
              {delivery.truck_id || delivery.id}
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: delivery.state === 'En Route' ? '#10b981' :
                             delivery.state === 'At Destination' ? '#8b5cf6' :
                             delivery.state === 'Maintenance' ? '#f59e0b' : '#6b7280',
              animation: delivery.state === 'En Route' ? 'pulse 2s infinite' : 'none',
              flexShrink: 0
            }} />
          </div>
        </div>

        {/* Vehicle Section */}
        <div style={{ 
          display: 'flex', 
          gap: cardConfig.gap, 
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{
            width: cardConfig.iconSize + 'px',
            height: cardConfig.iconSize + 'px',
            borderRadius: '4px',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            fontSize: cardConfig.smallFontSize
          }}>
            🚚
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: cardConfig.fontSize,
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '2px'
            }}>
              {delivery.vehicle}
            </div>
            <div style={{
              fontSize: cardConfig.smallFontSize,
              color: '#6b7280',
              whiteSpace: 'nowrap',
              marginBottom: '2px'
            }}>
              {fuelConsumption}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: cardConfig.smallGap
            }}>
              <span style={{
                fontSize: cardConfig.smallFontSize,
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                ⏱️ {delivery.speed || 0}km/h
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: cardConfig.smallGap,
                padding: `2px ${parseInt(cardConfig.padding) * 0.3}px`,
                borderRadius: `${parseInt(cardConfig.borderRadius) * 0.4}px`,
                backgroundColor: progress >= 90 ? '#dcfce7' : progress >= 50 ? '#fef3c7' : '#fee2e2',
                border: `1px solid ${progress >= 90 ? '#bbf7d0' : progress >= 50 ? '#fde68a' : '#fecaca'}`
              }}>
                <span style={{
                  fontSize: cardConfig.smallFontSize,
                  fontWeight: '600',
                  color: progress >= 90 ? '#059669' : progress >= 50 ? '#d97706' : '#dc2626',
                  whiteSpace: 'nowrap'
                }}>
                  {progress}%
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{
              height: '3px',
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
              marginTop: cardConfig.smallGap,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: progress >= 90 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
                           progress >= 50 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' :
                           'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '2px',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: progress > 0 ? 'shimmer 2s infinite' : 'none'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: cardConfig.smallGap,
          flex: 1,
          minHeight: 0
        }}>
          <div style={{ display: 'flex', gap: cardConfig.smallGap, alignItems: 'flex-start' }}>
            <span style={{ color: '#22c55e', flexShrink: 0, fontSize: cardConfig.smallFontSize }}>🟢</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: cardConfig.smallFontSize,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {delivery.pickup.address}
              </div>
              <div style={{
                fontSize: cardConfig.tinyFontSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {delivery.pickup.city}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: cardConfig.smallGap, alignItems: 'flex-start' }}>
            <span style={{ color: '#3b82f6', flexShrink: 0, fontSize: cardConfig.smallFontSize }}>🔵</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: cardConfig.smallFontSize,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {typeof delivery.destination === 'string' ? delivery.destination : delivery.destination.address}
              </div>
              <div style={{
                fontSize: cardConfig.tinyFontSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {typeof delivery.destination === 'string' ? 'Destination' : delivery.destination.city}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9',
          paddingTop: cardConfig.gap,
          gap: cardConfig.gap,
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: cardConfig.smallGap, 
            minWidth: 0,
            flex: 1
          }}>
            <div style={{
              width: cardConfig.avatarSize + 'px',
              height: cardConfig.avatarSize + 'px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: cardConfig.tinyFontSize,
              color: 'white',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              border: '2px solid white',
              position: 'relative'
            }}>
              {delivery.driver?.avatar || delivery.driver.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              <div style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: Math.max(6, cardConfig.avatarSize * 0.25) + 'px',
                height: Math.max(6, cardConfig.avatarSize * 0.25) + 'px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid white',
                animation: 'pulse 2s infinite'
              }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: cardConfig.smallFontSize,
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {delivery.driver.name}
              </div>
              <div style={{
                fontSize: cardConfig.tinyFontSize,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {delivery.driver.contact}
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: cardConfig.tinyFontSize,
            backgroundColor: statusInfo.bg,
            color: statusInfo.color,
            padding: `${parseInt(cardConfig.padding) * 0.2}px ${parseInt(cardConfig.padding) * 0.4}px`,
            borderRadius: `${parseInt(cardConfig.borderRadius) * 0.5}px`,
            fontWeight: '600',
            whiteSpace: 'nowrap',
            border: `1px solid ${statusInfo.color}20`,
            boxShadow: `0 2px 4px ${statusInfo.color}15`,
            flexShrink: 0
          }}>
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryCard;

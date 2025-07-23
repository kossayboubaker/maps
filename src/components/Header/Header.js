import React, { useState } from "react";
import "./Header.css";

const Header = ({
  onZoomIn,
  onZoomOut,
  onMapStyleChange,
  mapStyle = 'standard',
  alertsCount = 0,
  onToggleAlerts,
  showAlerts = false
}) => {
  const [showControls, setShowControls] = useState(false);

  const mapStyles = [
    { value: 'standard', label: 'Standard', icon: '🗺️' },
    { value: 'satellite', label: 'Satellite', icon: '🛰️' },
    { value: 'terrain', label: 'Terrain', icon: '🏔️' }
  ];

  const currentStyle = mapStyles.find(style => style.value === mapStyle) || mapStyles[0];

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      color: 'white',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Logo et titre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
            <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-3c0-.6-.4-1-1-1h-5z"/>
            <circle cx="7" cy="18" r="2"/>
            <path d="M15 18H9"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '800',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.5px'
          }}>
            Truck Control
          </h1>
          <p style={{
            margin: 0,
            fontSize: '12px',
            opacity: 0.8,
            fontWeight: '400'
          }}>
            Système intelligent de gestion de flotte
          </p>
        </div>
      </div>

      {/* Contrôles de carte */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Zoom Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={onZoomIn}
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
            title="Zoom avant"
          >
            +
          </button>
          <button
            onClick={onZoomOut}
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
            title="Zoom arrière"
          >
            −
          </button>
        </div>

        {/* Style de carte */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowControls(!showControls)}
            style={{
              height: '40px',
              padding: '0 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Style de carte"
          >
            <span style={{ fontSize: '16px' }}>{currentStyle.icon}</span>
            {currentStyle.label}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: showControls ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Menu déroulant des styles */}
          {showControls && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              minWidth: '180px',
              overflow: 'hidden',
              zIndex: 1001
            }}>
              {mapStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => {
                    onMapStyleChange(style.value);
                    setShowControls(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: mapStyle === style.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: mapStyle === style.value ? '#3b82f6' : '#374151',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (mapStyle !== style.value) {
                      e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mapStyle !== style.value) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{style.icon}</span>
                  {style.label}
                  {mapStyle === style.value && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Indicateur d'alertes */}
        <button
          onClick={onToggleAlerts}
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            background: showAlerts ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = showAlerts ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = showAlerts ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1)';
          }}
          title={`Alertes actives (${alertsCount})`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {alertsCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              background: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '2px solid white'
            }}>
              {alertsCount > 99 ? '99+' : alertsCount}
            </div>
          )}
        </button>
      </div>

      {/* Fond cliquable pour fermer les menus */}
      {showControls && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowControls(false)}
        />
      )}
    </header>
  );
};

export default Header;

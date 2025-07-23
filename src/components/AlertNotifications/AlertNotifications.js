import React, { useState, useEffect } from 'react';
import './AlertNotifications.css';

const AlertNotifications = ({ 
  alerts = [], 
  trucks = [], 
  onAlertClick, 
  onCloseAlert,
  isOpen,
  onToggle 
}) => {
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Générer des alertes en temps réel intelligentes
  const generateIntelligentAlerts = () => {
    const currentTime = new Date();

    // Alertes basées sur les données de trafic simulées
    const trafficConditions = [
      {
        location: 'Autoroute A1 - Tunis Nord',
        coordinates: [36.8342, 10.1456],
        type: 'traffic',
        severity: 'warning',
        description: 'Ralentissements importants due à l\'heure de pointe',
        delay: 15,
        affectedRoutes: ['TN-001', 'TN-003']
      },
      {
        location: 'Avenue Habib Bourguiba - Centre Ville',
        coordinates: [36.8065, 10.1815],
        type: 'construction',
        severity: 'danger',
        description: 'Travaux de réfection de la chaussée en cours',
        delay: 25,
        affectedRoutes: ['TN-002']
      },
      {
        location: 'Route GP1 - Sfax',
        coordinates: [34.7406, 10.7603],
        type: 'accident',
        severity: 'danger',
        description: 'Accident de la circulation - véhicule en panne',
        delay: 30,
        affectedRoutes: ['TN-001']
      },
      {
        location: 'Autoroute A4 - Sousse',
        coordinates: [35.8256, 10.6369],
        type: 'police',
        severity: 'info',
        description: 'Contrôle de routine des forces de l\'ordre',
        delay: 5,
        affectedRoutes: ['TN-002']
      }
    ];

    // Sélectionner aléatoirement 2-3 alertes actives
    const selectedAlerts = trafficConditions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2)
      .map((alert, index) => ({
        id: `alert_${index}_${Date.now()}`,
        title: getAlertTitle(alert.type),
        icon: getAlertIcon(alert.type),
        position: alert.coordinates,
        timestamp: currentTime.toISOString(),
        isActive: true,
        ...alert
      }));

    return selectedAlerts;
  };

  const getAlertTitle = (type) => {
    const titles = {
      accident: 'Accident de circulation',
      construction: 'Travaux en cours',
      traffic: 'Embouteillage',
      police: 'Contrôle police',
      weather: 'Alerte météo',
      maintenance: 'Maintenance route'
    };
    return titles[type] || 'Alerte trafic';
  };

  const getAlertIcon = (type) => {
    const icons = {
      accident: '⚠️',
      construction: '🚧',
      traffic: '🚦',
      police: '👮',
      weather: '🌧️',
      maintenance: '🔧'
    };
    return icons[type] || '⚠️';
  };

  // Générer alertes météo simulées (évite les appels API problématiques)
  const generateWeatherAlerts = () => {
    const weatherConditions = [
      {
        city: 'Tunis',
        coordinates: [36.8065, 10.1815],
        condition: Math.random() > 0.7 ? 'Rain' : 'Clear',
        description: Math.random() > 0.7 ? 'Pluie modérée en cours' : 'Temps dégagé'
      },
      {
        city: 'Sfax',
        coordinates: [34.7406, 10.7603],
        condition: Math.random() > 0.8 ? 'Mist' : 'Clouds',
        description: Math.random() > 0.8 ? 'Brouillard dense' : 'Nuageux'
      },
      {
        city: 'Sousse',
        coordinates: [35.8256, 10.6369],
        condition: Math.random() > 0.9 ? 'Thunderstorm' : 'Clear',
        description: Math.random() > 0.9 ? 'Orages en approche' : 'Beau temps'
      }
    ];

    const alerts = weatherConditions
      .filter(data => data.condition !== 'Clear')
      .map((data, index) => {
        let severity = 'info';
        let delay = 5;

        if (data.condition === 'Rain') {
          severity = 'warning';
          delay = 10;
        } else if (data.condition === 'Thunderstorm' || data.condition === 'Mist') {
          severity = 'danger';
          delay = 20;
        }

        return {
          id: `weather_${index}_${Date.now()}`,
          type: 'weather',
          title: 'Conditions météo défavorables',
          icon: '🌧️',
          location: data.city,
          position: data.coordinates,
          description: data.description,
          severity,
          delay,
          affectedRoutes: trucks
            .filter(truck => calculateDistance(truck.position, data.coordinates) < 50)
            .map(truck => truck.truck_id),
          timestamp: new Date().toISOString(),
          isActive: true
        };
      });

    return alerts;
  };

  // Fonction supprimée - remplacée par generateWeatherAlerts

  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dLng = (pos2[1] - pos1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Mettre à jour les alertes périodiquement
  useEffect(() => {
    const updateAlerts = () => {
      const trafficAlerts = generateIntelligentAlerts();
      const weatherAlertsData = generateWeatherAlerts();

      setActiveAlerts([...trafficAlerts, ...weatherAlertsData]);
    };

    // Mise à jour initiale
    updateAlerts();

    // Mise à jour toutes les 30 secondes
    const interval = setInterval(updateAlerts, 30000);

    return () => clearInterval(interval);
  }, [trucks, generateIntelligentAlerts, generateWeatherAlerts]);



  const getTotalAlerts = () => {
    return [...alerts, ...activeAlerts].length;
  };

  const getAllAlerts = () => {
    return [...alerts, ...activeAlerts].sort((a, b) => {
      const severityOrder = { danger: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="alert-notification-button"
        style={{
          position: 'fixed',
          top: '190px',
          right: '20px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: getTotalAlerts() > 0 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          color: 'white',
          transition: 'all 0.3s ease',
          animation: getTotalAlerts() > 0 ? 'alertPulse 2s infinite' : 'none'
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {getTotalAlerts() > 0 && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ffffff',
              color: '#ef4444',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid #ef4444'
            }}>
              {getTotalAlerts()}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="alert-notifications-panel">
      {/* Header */}
      <div className="alert-notifications-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="alert-notifications-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h2>Alertes & Notifications</h2>
          <div className="alert-count">
            {getTotalAlerts()}
          </div>
        </div>
        <button onClick={onToggle} className="close-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="alert-notifications-content">
        {getAllAlerts().length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <h3>Aucune alerte active</h3>
            <p>Tous les itinéraires sont dégagés</p>
          </div>
        ) : (
          <div className="alerts-list">
            {getAllAlerts().map((alert, index) => (
              <div 
                key={alert.id || index}
                className={`alert-item alert-${alert.severity}`}
                onClick={() => onAlertClick && onAlertClick(alert)}
              >
                <div className="alert-icon">
                  {alert.icon}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <h4>{alert.title}</h4>
                    <span className="alert-delay">+{alert.delay}min</span>
                  </div>
                  <p className="alert-description">{alert.description}</p>
                  <div className="alert-meta">
                    <span className="alert-location">📍 {alert.location}</span>
                    {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
                      <span className="alert-routes">
                        🚛 {alert.affectedRoutes.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {onCloseAlert && (
                  <button 
                    className="alert-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseAlert(alert.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec statistiques */}
      <div className="alert-notifications-footer">
        <div className="alert-stats">
          <div className="stat-item">
            <span className="stat-icon">🚨</span>
            <span className="stat-label">Critiques</span>
            <span className="stat-value">
              {getAllAlerts().filter(a => a.severity === 'danger').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⚠️</span>
            <span className="stat-label">Attention</span>
            <span className="stat-value">
              {getAllAlerts().filter(a => a.severity === 'warning').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">ℹ️</span>
            <span className="stat-label">Info</span>
            <span className="stat-value">
              {getAllAlerts().filter(a => a.severity === 'info').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertNotifications;

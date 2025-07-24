import React, { useState, useEffect, useCallback } from 'react';
import './AlertNotifications.css';
import alertsService from '../../services/alertsService';

const AlertNotifications = ({
  alerts = [],
  trucks = [],
  onAlertClick,
  onCloseAlert,
  isOpen,
  onToggle
}) => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [newAlertIds, setNewAlertIds] = useState(new Set());

  // Récupérer des alertes réelles depuis les APIs
  const fetchRealAlerts = useCallback(async () => {
    try {
      // Récupérer toutes les alertes réelles
      const realAlerts = await alertsService.getAllAlerts(trucks);
      return realAlerts;
    } catch (error) {
      console.error('Erreur récupération alertes réelles:', error);
      return [];
    }
  }, [trucks]);

  // Les APIs retournent déjà les titres et icônes appropriés

  // Générer alertes météo simulées (évite les appels API problématiques)
  const generateWeatherAlerts = useCallback(() => {
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
  }, [trucks]);

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
      const allGeneratedAlerts = [...trafficAlerts, ...weatherAlertsData];

      // Marquer les nouvelles alertes pour l'ombre
      const currentAlertIds = new Set(activeAlerts.map(a => a.id));
      const newIds = new Set();
      allGeneratedAlerts.forEach(alert => {
        if (!currentAlertIds.has(alert.id)) {
          newIds.add(alert.id);
        }
      });

      if (newIds.size > 0) {
        setNewAlertIds(newIds);
        // Retirer l'ombre après 10 secondes
        setTimeout(() => {
          setNewAlertIds(prev => {
            const updated = new Set(prev);
            newIds.forEach(id => updated.delete(id));
            return updated;
          });
        }, 10000);
      }

      setActiveAlerts(allGeneratedAlerts);
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

  const handleDeleteAlert = (alertId, e) => {
    e.stopPropagation();

    // Supprimer des alertes actives générées
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));

    // Supprimer des nouvelles alertes
    setNewAlertIds(prev => {
      const updated = new Set(prev);
      updated.delete(alertId);
      return updated;
    });

    // Appeler la fonction de suppression parent si elle existe
    if (onCloseAlert) {
      onCloseAlert(alertId);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="alert-notification-button"
        style={{
          position: 'fixed',
          top: '200px',
          right: '20px',
          zIndex: 2000,
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
                style={{
                  position: 'relative',
                  boxShadow: newAlertIds.has(alert.id)
                    ? '0 8px 25px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)'
                    : undefined,
                  border: newAlertIds.has(alert.id)
                    ? '2px solid #3b82f6'
                    : undefined,
                  animation: newAlertIds.has(alert.id)
                    ? 'newAlertGlow 2s ease-in-out infinite'
                    : undefined
                }}
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
                <button
                  className="alert-close"
                  onClick={(e) => handleDeleteAlert(alert.id, e)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.color = '#ef4444';
                  }}
                >
                  ×
                </button>
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
            <span className="stat-icon">⚠���</span>
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

      <style>
        {`
          @keyframes newAlertGlow {
            0%, 100% {
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.5);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AlertNotifications;

import React, { useState, useEffect, useCallback } from 'react';
import './AlertNotifications.css';
import alertsService from '../../services/alertsService';

const AlertNotifications = ({
  alerts = [],
  trucks = [],
  onAlertClick,
  onCloseAlert,
  onAlertsUpdate,
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

  // Fonction supprimée - remplacée par les APIs réelles

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

  // Mettre à jour les alertes avec les APIs réelles - système intelligent
  useEffect(() => {
    const updateAlerts = async () => {
      try {
        console.log('🔄 Mise à jour des alertes depuis APIs...');
        const realAlerts = await fetchRealAlerts();

        // Filtrer les alertes valides et actives
        const validAlerts = realAlerts.filter(alert =>
          alert &&
          alert.id &&
          alert.type &&
          alert.position &&
          alert.isActive !== false
        );

        // Marquer les nouvelles alertes pour l'animation
        const currentAlertIds = new Set(activeAlerts.map(a => a.id));
        const newIds = new Set();
        validAlerts.forEach(alert => {
          if (!currentAlertIds.has(alert.id)) {
            newIds.add(alert.id);
          }
        });

        if (newIds.size > 0) {
          console.log(`✨ ${newIds.size} nouvelles alertes détectées`);
          setNewAlertIds(newIds);
          // Retirer l'animation après 6 secondes
          setTimeout(() => {
            setNewAlertIds(prev => {
              const updated = new Set(prev);
              newIds.forEach(id => updated.delete(id));
              return updated;
            });
          }, 6000);
        }

        setActiveAlerts(validAlerts);

        // Notifier le parent avec les alertes validées
        if (onAlertsUpdate) {
          onAlertsUpdate(validAlerts);
        }

        console.log(`✅ ${validAlerts.length} alertes actives`);

      } catch (error) {
        console.warn('⚠️ Erreur mise à jour alertes:', error.message);
        // Fallback avec alertes de base en cas d'erreur
        const fallbackAlerts = [{
          id: `fallback_${Date.now()}`,
          type: 'info',
          title: 'Surveillance active',
          icon: '📶',
          location: 'Système',
          position: [36.8065, 10.1815],
          description: 'Surveillance du trafic et météo en cours',
          severity: 'info',
          delay: 0,
          affectedRoutes: [],
          timestamp: new Date().toISOString(),
          isActive: true,
          source: 'fallback'
        }];

        setActiveAlerts(fallbackAlerts);
        if (onAlertsUpdate) {
          onAlertsUpdate(fallbackAlerts);
        }
      }
    };

    // Délai initial pour permettre aux APIs de s'initialiser
    const initTimer = setTimeout(updateAlerts, 1500);

    // Mise à jour adaptative selon l'activité
    const getUpdateInterval = () => {
      const activeCount = activeAlerts.filter(a => a.severity === 'danger').length;
      if (activeCount > 2) return 180000; // 3 minutes si alertes critiques
      if (activeCount > 0) return 300000; // 5 minutes si alertes normales
      return 600000; // 10 minutes si pas d'alertes critiques
    };

    const interval = setInterval(updateAlerts, getUpdateInterval());

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [trucks, fetchRealAlerts, activeAlerts.length]);



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
          top: '80px', // Même niveau que bouton panneau selon screenshot
          right: '20px', // Position droite selon screenshot
          zIndex: 2000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: getTotalAlerts() > 0
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: '3px solid rgba(255,255,255,0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: getTotalAlerts() > 0 ?
            '0 12px 40px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)' :
            '0 8px 25px rgba(107, 114, 128, 0.3)',
          color: 'white',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: getTotalAlerts() > 0 ? 'alertPulse 2.5s ease-in-out infinite' : 'none',
          backdropFilter: 'blur(10px)'
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
              top: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              color: '#ef4444',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '900',
              border: '3px solid #ef4444',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              animation: 'badgePulse 3s ease-in-out infinite'
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
              transform: scale(1);
            }
            50% {
              box-shadow: 0 15px 40px rgba(59, 130, 246, 0.7), 0 0 35px rgba(59, 130, 246, 0.6);
              transform: scale(1.02);
            }
          }

          @keyframes alertPulse {
            0%, 100% {
              box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 18px 50px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.5);
              transform: scale(1.05);
            }
          }

          @keyframes badgePulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes slideInAlert {
            from {
              opacity: 0;
              transform: translateX(100%) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          .alert-item {
            animation: slideInAlert 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .alert-item:hover {
            transform: translateX(-6px) scale(1.02);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }

          .alert-loading {
            background: linear-gradient(45deg, #f3f4f6, #e5e7eb, #f3f4f6);
            background-size: 200% 200%;
            animation: loadingShimmer 1.8s ease-in-out infinite;
          }

          @keyframes loadingShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default AlertNotifications;

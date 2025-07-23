import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header.js';
import DeliveryList from './components/DeliveryList/DeliveryList.js';
import MapCanvas from './components/MapCanvas/MapCanvas.js';
import AdvancedMapControls from './components/AdvancedMapControls/AdvancedMapControls.js';

const mockTrucks = [
  {
    id: 'EV-201700346',
    truck_id: 'TN-001',
    position: [36.8065, 10.1815], // Coordonnées Tunis
    speed: 65,
    state: 'En Route',
    ecoMode: true,
    vehicle: 'Ford F-150',
    cargo: 'Food Materials',
    cargo_type: 'Perishable Goods',
    status: 'in-progress',
    weight: 15000,
    route_progress: 35,
    bearing: 45,
    route: [
      { latitude: 36.8065, longitude: 10.1815 },
      { latitude: 36.4, longitude: 10.2 },
      { latitude: 35.6, longitude: 10.4 }
    ],
    pickup: {
      address: '2972 Westheimer',
      city: 'Rd. Santa Ana, Illinois 85486',
      coordinates: [36.8065, 10.1815]
    },
    destination: 'Sfax Centre',
    destinationCoords: [34.7406, 10.7603], // Sfax
    driver: {
      name: 'Ahmed Ben Ali',
      company: 'TransTunisia, LTD',
      contact: '+216 12 345 678'
    },
    last_update: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600000 * 5).toISOString(),
    fuel_level: 78,
    temperature: 4,
    alerts: []
  },
  {
    id: 'EV-201700323',
    truck_id: 'TN-002',
    position: [35.8256, 10.6369], // Sousse
    speed: 0,
    state: 'At Destination',
    ecoMode: false,
    vehicle: 'MAN TGX 440',
    cargo: 'Food Materials',
    cargo_type: 'Dry Goods',
    status: 'completed',
    weight: 12000,
    route_progress: 100,
    bearing: 1,
    route: [
      { latitude: 36.8065, longitude: 10.1815 },
      { latitude: 35.8256, longitude: 10.6369 }
    ],
    pickup: {
      address: '2972 Westheimer',
      city: 'Rd. Santa Ana, Illinois 85486',
      coordinates: [36.8065, 10.1815]
    },
    destination: 'Sousse Port',
    destinationCoords: [35.8256, 10.6369],
    driver: {
      name: 'Mohamed Trabelsi',
      company: 'Coastal Logistics',
      contact: '+216 98 765 432'
    },
    last_update: new Date().toISOString(),
    estimatedArrival: new Date().toISOString(),
    fuel_level: 45,
    temperature: 18,
    alerts: []
  },
  {
    id: 'EV-201700321',
    truck_id: 'TN-003',
    position: [36.4098, 10.1398], // Ariana
    speed: 52,
    state: 'En Route',
    ecoMode: true,
    vehicle: 'Volvo FH16',
    cargo: 'Electronics',
    cargo_type: 'Fragile',
    status: 'in-progress',
    weight: 8500,
    route_progress: 22,
    bearing: 180,
    route: [
      { latitude: 36.4098, longitude: 10.1398 },
      { latitude: 36.1, longitude: 10.1 },
      { latitude: 35.6, longitude: 9.8 }
    ],
    pickup: {
      address: 'Zone Industrielle Ariana',
      city: 'Ariana, Tunisia',
      coordinates: [36.4098, 10.1398]
    },
    destination: 'Kairouan Centre',
    destinationCoords: [35.6786, 10.0963],
    driver: {
      name: 'Sami Mansouri',
      company: 'TechTransport',
      contact: '+216 55 123 456'
    },
    last_update: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600000 * 3).toISOString(),
    fuel_level: 92,
    temperature: -2,
    alerts: []
  },
  {
    id: 'EV-201700322',
    truck_id: 'TN-004',
    position: [36.7538, 10.2286], // La Goulette
    speed: 28,
    state: 'En Route',
    ecoMode: false,
    vehicle: 'Mercedes Actros',
    cargo: 'Construction Materials',
    cargo_type: 'Heavy Load',
    status: 'in-progress',
    weight: 22000,
    route_progress: 15,
    bearing: 90,
    route: [
      { latitude: 36.7538, longitude: 10.2286 },
      { latitude: 36.8, longitude: 10.6 },
      { latitude: 36.4, longitude: 11.1 }
    ],
    pickup: {
      address: 'Port de la Goulette',
      city: 'La Goulette, Tunisia',
      coordinates: [36.7538, 10.2286]
    },
    destination: 'Nabeul Industrial',
    destinationCoords: [36.4561, 10.7376],
    driver: {
      name: 'Karim Bouazizi',
      company: 'Heavy Cargo TN',
      contact: '+216 71 987 654'
    },
    last_update: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600000 * 6).toISOString(),
    fuel_level: 67,
    temperature: 25,
    alerts: []
  },
  {
    id: 'EV-201700325',
    truck_id: 'TN-005',
    position: [33.8869, 10.0982], // Gabes
    speed: 0,
    state: 'Maintenance',
    ecoMode: false,
    vehicle: 'Iveco Stralis',
    cargo: 'Medical Supplies',
    cargo_type: 'Urgent',
    status: 'delayed',
    weight: 5500,
    route_progress: 78,
    bearing: 0,
    route: [
      { latitude: 34.7406, longitude: 10.7603 },
      { latitude: 34.0, longitude: 10.5 },
      { latitude: 33.8869, longitude: 10.0982 }
    ],
    pickup: {
      address: 'Hôpital Sfax',
      city: 'Sfax, Tunisia',
      coordinates: [34.7406, 10.7603]
    },
    destination: 'Hôpital Gabes',
    destinationCoords: [33.8869, 10.0982],
    driver: {
      name: 'Fatma Gharbi',
      company: 'MediTransport',
      contact: '+216 75 456 789'
    },
    last_update: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 3600000 * 2).toISOString(),
    fuel_level: 23,
    temperature: 8,
    alerts: []
  }
];

// Système d'alertes intelligent
const mockAlerts = [
  {
    id: 'alert-001',
    type: 'weather',
    title: 'Pluie forte sur A1',
    description: 'Conditions météo dangereuses détectées',
    severity: 'warning',
    position: [36.6, 10.2],
    affectedRoutes: ['TN-001', 'TN-003'],
    timestamp: new Date().toISOString(),
    delay: 15,
    icon: '🌧️',
    location: 'Autoroute A1 - Tunis'
  },
  {
    id: 'alert-002',
    type: 'traffic',
    title: 'Embouteillage Sousse',
    description: 'Trafic dense, ralentissements importants',
    severity: 'warning',
    position: [35.8256, 10.6369],
    affectedRoutes: ['TN-002'],
    timestamp: new Date().toISOString(),
    delay: 25,
    icon: '🚦',
    location: 'Centre-ville Sousse'
  },
  {
    id: 'alert-003',
    type: 'maintenance',
    title: 'Maintenance requise TN-005',
    description: 'Niveau de carburant critique',
    severity: 'danger',
    position: [33.8869, 10.0982],
    affectedRoutes: ['TN-005'],
    timestamp: new Date().toISOString(),
    delay: 45,
    icon: '⛽',
    location: 'Gabes - Station service'
  },
  {
    id: 'alert-004',
    type: 'construction',
    title: 'Travaux Route GP1',
    description: 'Circulation alternée, ralentissements',
    severity: 'info',
    position: [36.4, 10.6],
    affectedRoutes: ['TN-004'],
    timestamp: new Date().toISOString(),
    delay: 12,
    icon: '🚧',
    location: 'Route GP1 vers Nabeul'
  }
];

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(mockTrucks[0]);
  const [isAsideOpen, setIsAsideOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 100 && isAsideOpen) {
        setIsAsideOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Appliquer au chargement initial
    return () => window.removeEventListener('resize', handleResize);
  }, [isAsideOpen]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleDeliverySelect = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const handleMapStyleChange = (style) => {
    setMapStyle(style);
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const handleToggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  // Simuler des mises à jour d'alertes en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulation de nouvelles alertes
      const newAlertTypes = [
        {
          type: 'weather',
          icons: ['🌧️', '🌫️', '❄️', '⛈️'],
          severities: ['warning', 'danger'],
          locations: ['Autoroute A1', 'Route GP8', 'Centre-ville']
        },
        {
          type: 'traffic',
          icons: ['🚦', '🚗', '⚠️'],
          severities: ['info', 'warning'],
          locations: ['Rond-point', 'Avenue Habib Bourguiba', 'Zone industrielle']
        }
      ];

      if (Math.random() < 0.3) { // 30% de chance d'avoir une nouvelle alerte
        const alertType = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)];
        const newAlert = {
          id: `alert-${Date.now()}`,
          type: alertType.type,
          title: `${alertType.type === 'weather' ? 'Météo' : 'Trafic'} - ${alertType.locations[Math.floor(Math.random() * alertType.locations.length)]}`,
          description: `Nouvelle alerte ${alertType.type} détectée`,
          severity: alertType.severities[Math.floor(Math.random() * alertType.severities.length)],
          position: [36.8 + (Math.random() - 0.5) * 2, 10.2 + (Math.random() - 0.5) * 2],
          affectedRoutes: [`TN-00${Math.floor(Math.random() * 5) + 1}`],
          timestamp: new Date().toISOString(),
          delay: Math.floor(Math.random() * 30) + 5,
          icon: alertType.icons[Math.floor(Math.random() * alertType.icons.length)],
          location: alertType.locations[Math.floor(Math.random() * alertType.locations.length)]
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Garder max 10 alertes
      }
    }, 45000); // Nouvelle alerte potentielle toutes les 45 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${isAsideOpen ? 'bg-background' : 'bg-white'} overflow-hidden`}>
      <Header />

      {/* MapControlPanel selon capture 3 */}
      <MapControlPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMapStyleChange={handleMapStyleChange}
        mapStyle={mapStyle}
        alertsCount={alerts.length}
        onToggleAlerts={handleToggleAlerts}
        showAlerts={showAlerts}
      />

      {/* Panneau de notifications amélioré - glissé vers le bas */}
      {showAlerts && alerts.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '160px', // Plus bas pour éviter conflit avec MapControlPanel
          right: '20px',
          zIndex: 2000,
          width: '380px',
          maxWidth: '90vw',
          maxHeight: '500px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          animation: 'slideInRight 0.5s ease-out'
        }}>
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚨 Alertes Actives ({alerts.length})
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{
            padding: '16px 24px',
            overflowY: 'auto',
            maxHeight: '400px'
          }}>
            {alerts.map((alert, index) => (
              <div key={alert.id} style={{
                padding: '16px',
                margin: '0 0 12px 0',
                background: alert.severity === 'danger'
                  ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                  : alert.severity === 'warning'
                  ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                border: `2px solid ${
                  alert.severity === 'danger' ? '#fecaca' :
                  alert.severity === 'warning' ? '#fde68a' : '#bfdbfe'
                }`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '2px'
                    }}>
                      {alert.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      📍 {alert.location}
                    </div>
                  </div>
                  <div style={{
                    background: alert.severity === 'danger' ? '#ef4444' :
                              alert.severity === 'warning' ? '#f59e0b' : '#3b82f6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    +{alert.delay}min
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4b5563',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {alert.description}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10px',
                  color: '#9ca3af'
                }}>
                  <span>🚛 {alert.affectedRoutes?.join(', ')}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-60px)] w-full">
        <aside
          className={`transition-all duration-300 ${isAsideOpen ? 'w-full max-w-[280px] xxs:max-w-[300px] xs:max-w-[320px] xs2:max-w-[340px] sm:max-w-[360px] sm2:max-w-[380px] md:max-w-[400px]' : 'w-0'} bg-background border-r border-border flex-shrink-0 overflow-hidden`}
        >
          <DeliveryList
            deliveries={mockTrucks}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectDelivery={handleDeliverySelect}
            selectedDelivery={selectedDelivery}
          />
        </aside>
        <main
          className={`flex-1 min-w-0 overflow-hidden ${isAsideOpen ? '' : 'w-full'}`}
        >
          <MapCanvas
            deliveries={mockTrucks}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={handleDeliverySelect}
            alerts={alerts}
            mapStyle={mapStyle}
            onMapReady={setMapInstance}
            showAlerts={showAlerts}
          />
        </main>
        <button
          onClick={() => setIsAsideOpen(!isAsideOpen)}
          style={{
            position: 'absolute',
            top: '180px', // Glissé vers le bas pour éviter conflit avec MapControlPanel
            left: isAsideOpen ? '10px' : '10px',
            zIndex: 3000,
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'left 0.3s ease, transform 0.3s ease',
            touchAction: 'manipulation',
          }}
          className={`${isAsideOpen ? 'transform rotate-180' : ''}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
           <path d={isAsideOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
          </svg>
        </button>
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;

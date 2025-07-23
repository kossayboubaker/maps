import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header.js';
import TruckList from './components/TruckList/TruckList.js';
import MapCanvas from './components/MapCanvas/MapCanvas.js';

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
  const [selectedTruck, setSelectedTruck] = useState(mockTrucks[0]);
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

  const handleTruckSelect = (truck) => {
    setSelectedTruck(truck);
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
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMapStyleChange={handleMapStyleChange}
        mapStyle={mapStyle}
        alertsCount={alerts.length}
        onToggleAlerts={handleToggleAlerts}
        showAlerts={showAlerts}
      />
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 76px)',
        width: '100%'
      }}>
        <aside
          style={{
            transition: 'all 0.3s ease',
            width: isAsideOpen ? '400px' : '0',
            maxWidth: isAsideOpen ? '400px' : '0',
            background: '#ffffff',
            borderRight: '2px solid rgba(59, 130, 246, 0.1)',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: isAsideOpen ? '4px 0 20px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          <TruckList
            trucks={mockTrucks}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSelectTruck={handleTruckSelect}
            selectedTruck={selectedTruck}
            alerts={alerts}
          />
        </aside>
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <MapCanvas
            trucks={mockTrucks}
            selectedTruck={selectedTruck}
            onSelectTruck={handleTruckSelect}
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
            top: '90px',
            left: isAsideOpen ? '410px' : '10px',
            zIndex: 3000,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            touchAction: 'manipulation',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
          }}
          title={isAsideOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isAsideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
           <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;

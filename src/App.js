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
  const [selectedDelivery, setSelectedDelivery] = useState(mockDeliveries[0]);
  const [isAsideOpen, setIsAsideOpen] = useState(true);

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

  return (
    <div className={`min-h-screen ${isAsideOpen ? 'bg-background' : 'bg-white'} overflow-hidden`}>
      <Header />
      <div className="flex h-[calc(100vh-60px)] w-full">
        <aside
          className={`transition-all duration-300 ${isAsideOpen ? 'w-full max-w-[280px] xxs:max-w-[300px] xs:max-w-[320px] xs2:max-w-[340px] sm:max-w-[360px] sm2:max-w-[380px] md:max-w-[400px]' : 'w-0'} bg-background border-r border-border flex-shrink-0 overflow-hidden`}
        >
          <DeliveryList
            deliveries={mockDeliveries}
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
            deliveries={mockDeliveries}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={handleDeliverySelect}
          />
        </main>
        <button
          onClick={() => setIsAsideOpen(!isAsideOpen)}
          style={{
            position: 'absolute',
            top: '80px',
            left: isAsideOpen ? '10px' : '10px',
            zIndex: 3000, // Priorité maximale
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px', // Augmenté pour une meilleure interaction mobile
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'left 0.3s ease, transform 0.3s ease', // Transition fluide
            touchAction: 'manipulation', // Améliore les événements tactiles sur mobile
          }}
          className={`${isAsideOpen ? 'transform rotate-180' : ''}`} // Rotation subtile
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
    </div>
  );
};

export default App;

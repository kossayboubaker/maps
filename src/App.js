import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header.js';
import TruckList from './components/TruckList/TruckList.js';
import MapCanvas from './components/MapCanvas/MapCanvas.js';

const mockDeliveries = [
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
    destination: {
      address: '8502 Preston',
      city: 'Rd. Inglewood, Maine 98380',
      coordinates: [34.7406, 10.7603] // Sfax
    },
    driver: {
      name: 'Darrell Steward',
      company: 'Marlene, LTD',
      contact: '+216 12 345 678'
    },
    last_update: new Date().toISOString(),
    estimated_arrival: new Date(Date.now() + 3600000 * 5).toISOString(),
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
    status: 'pending',
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
    destination: {
      address: '1234 Oak Street',
      city: 'Downtown, California 90210',
      coordinates: [35.8256, 10.6369]
    },
    driver: {
      name: 'Jenny Wilson',
      company: 'Transport Co.',
      contact: '+216 98 765 432'
    },
    last_update: new Date().toISOString(),
    estimated_arrival: new Date().toISOString(),
    fuel_level: 45,
    temperature: 18,
    alerts: ['Maintenance due']
  },
  {
    id: 'EV-201700321',
    truck_id: 'TN-003',
    position: [35.8256, 10.6369], // Sousse
    speed: 0,
    state: 'At Destination',
    ecoMode: false,
    vehicle: 'Dodge Ram 1500',
    cargo: 'Food Materials',
    cargo_type: 'Dry Goods',
    status: 'pending',
    weight: 12000,
    route_progress: 100,
    bearing: 0,
    route: [
      { latitude: 36.8065, longitude: 10.1815 },
      { latitude: 35.8256, longitude: 10.6369 }
    ],
    pickup: {
      address: '2972 Westheimer',
      city: 'Rd. Santa Ana, Illinois 85486',
      coordinates: [36.8065, 10.1815]
    },
    destination: {
      address: '1234 Oak Street',
      city: 'Downtown, California 90210',
      coordinates: [35.8256, 10.6369]
    },
    driver: {
      name: 'Jenny Wilson',
      company: 'Transport Co.',
      contact: '+216 98 765 432'
    },
    last_update: new Date().toISOString(),
    estimated_arrival: new Date().toISOString(),
    fuel_level: 45,
    temperature: 18,
    alerts: ['Maintenance due']
  },
  {
    id: 'EV-201700322',
    truck_id: 'TN-004',
    position: [35.8256, 10.6369], // Sousse
    speed: 150,
    state: 'At Destination',
    ecoMode: false,
    vehicle: 'MARCEDES VITARA',
    cargo: 'Food Materials',
    cargo_type: 'Dry Goods',
    status: 'pending',
    weight: 12000,
    route_progress: 100,
    bearing: 0,
    route: [
      { latitude: 36.8065, longitude: 10.1815 },
      { latitude: 35.8256, longitude: 10.6369 }
    ],
    pickup: {
      address: '2972 Westheimer',
      city: 'Rd. Santa Ana, Illinois 85486',
      coordinates: [36.8065, 10.1815]
    },
    destination: {
      address: '1234 Oak Street',
      city: 'Downtown, California 90210',
      coordinates: [35.8256, 10.6369]
    },
    driver: {
      name: 'Jenny Wilson',
      company: 'Transport Co.',
      contact: '+216 98 765 432'
    },
    last_update: new Date().toISOString(),
    estimated_arrival: new Date().toISOString(),    
    fuel_level: 45,
    temperature: 18,
    alerts: ['Maintenance due']
  }
  // add more mock deliveries
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

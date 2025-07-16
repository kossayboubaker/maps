import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header.js';
import DeliveryList from './components/DeliveryList/DeliveryList.js';
import MapCanvas from './components/MapCanvas/MapCanvas.js';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);

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

  // Gestion du redimensionnement pour fermer automatiquement sur mobile (< 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Appliquer au chargement initial
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Toggle pour le bouton isOpen
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    console.log("Toggle clicked, isOpen:", !isOpen); // Débogage
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isOpen && (
          <div className="w-full sm:w-[30%] md:w-[28%] lg:w-[25%] xl:w-[22%] 2xl:w-[20%] bg-background border-r border-border overflow-hidden transition-all duration-300">
            <DeliveryList
              deliveries={mockDeliveries}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        )}
        <div className="flex-1 overflow-hidden relative">
          <div style={{ position: 'relative', zIndex: 1000 }}>
            <MapCanvas deliveries={mockDeliveries} />
          </div>
          <button
            onClick={handleToggleOpen}
            style={{
              position: 'absolute',
              top: '25px', // Ajusté pour éviter le Header
              left: '10px',
              zIndex: 3000, // Priorité maximale pour éviter les conflits
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px', // Taille augmentée pour faciliter le clic sur mobile
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'left 0.1s ease, transform 0.1s ease 0.1s'
            }}
            className={`${isOpen ? 'transform rotate-360' : ''}`}
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
              <path d={isOpen ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
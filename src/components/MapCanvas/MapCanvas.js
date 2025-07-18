import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithTrucks = () => {
  const [map, setMap] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [followTruck, setFollowTruck] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [mapStyle, setMapStyle] = useState('standard');

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Appliquer au chargement initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configuration des icônes Leaflet
  const configureLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  };

  // Trajectoires réalistes
  const realTrajectories = {
    'TN-001': [
      { lat: 36.8065, lng: 10.1815, name: 'Tunis Centre' },
      { lat: 36.8128, lng: 10.1658, name: 'Lac 1' },
      { lat: 36.8342, lng: 10.1456, name: 'Ariana Ville' },
      { lat: 36.8567, lng: 10.1234, name: 'Raoued' },
      { lat: 36.8234, lng: 10.0987, name: 'Autoroute A4' },
      { lat: 36.7456, lng: 10.0654, name: 'Manouba' },
      { lat: 36.6789, lng: 10.0321, name: 'Jedaida' },
      { lat: 36.5432, lng: 9.9876, name: 'Testour' },
      { lat: 36.4123, lng: 9.9543, name: 'Beja Sud' },
      { lat: 36.2876, lng: 9.9210, name: 'Medjez el Bab' },
      { lat: 36.1543, lng: 9.8987, name: 'Goubellat' },
      { lat: 36.0234, lng: 9.8654, name: 'El Kef Route' },
      { lat: 35.8765, lng: 9.8321, name: 'Maktar' },
      { lat: 35.7432, lng: 9.7998, name: 'Siliana' },
      { lat: 35.6109, lng: 9.7665, name: 'Bargou' },
      { lat: 35.4876, lng: 9.7332, name: 'Rohia' },
      { lat: 35.3543, lng: 9.6999, name: 'Kesra' },
      { lat: 35.2210, lng: 9.6666, name: 'Ain Draham Route' },
      { lat: 35.0987, lng: 9.6333, name: 'Fernana' },
      { lat: 34.9654, lng: 9.6000, name: 'Tabarka Road' },
      { lat: 34.8321, lng: 9.5667, name: 'Nefza' },
      { lat: 34.7406, lng: 10.7603, name: 'Sfax Centre' },
    ],
    'TN-002': [
      { lat: 36.8065, lng: 10.1815, name: 'Tunis Centre' },
      { lat: 36.7234, lng: 10.2987, name: 'Ben Arous' },
      { lat: 36.6543, lng: 10.3654, name: 'Hammam Lif' },
      { lat: 36.5876, lng: 10.4321, name: 'Soliman' },
      { lat: 36.5109, lng: 10.4988, name: 'Grombalia' },
      { lat: 36.4432, lng: 10.5655, name: 'Bou Argoub' },
      { lat: 36.3765, lng: 10.6322, name: 'Nabeul Sud' },
      { lat: 36.3098, lng: 10.6989, name: 'Hammamet Nord' },
      { lat: 36.2431, lng: 10.7656, name: 'Yasmine Hammamet' },
      { lat: 36.1764, lng: 10.8323, name: 'Bouficha' },
      { lat: 36.1097, lng: 10.8990, name: 'Enfidha' },
      { lat: 36.0430, lng: 10.9657, name: 'Hergla' },
      { lat: 35.9763, lng: 11.0324, name: 'Sousse Nord' },
      { lat: 35.8256, lng: 10.6369, name: 'Sousse Port' },
    ],
  };

  // Fetch realistic route from OSRM
  const getRealRoute = async (truck) => {
    const coordinates = realTrajectories[truck.id].map((point) => `${point.lng},${point.lat}`).join(';');
    const url = `http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.routes[0]?.geometry.coordinates.map((coord) => [coord[1], coord[0]]) || realTrajectories[truck.id].map((point) => [point.lat, point.lng]);
    } catch (error) {
      console.error('Error fetching route for truck', truck.id, ':', error);
      return realTrajectories[truck.id].map((point) => [point.lat, point.lng]);
    }
  };

  // Données simulées
  const generateSampleTrucks = async () => {
    const sampleTrucks = [
      {
        id: 'TN-001',
        position: [36.8065, 10.1815],
        speed: 65,
        state: 'En Route',
        driver: 'Ahmed Ben Ali',
        destination: 'Sfax',
        route_progress: 35,
        bearing: 45,
        route: realTrajectories['TN-001'].map((point) => [point.lat, point.lng]),
      },
      {
        id: 'TN-002',
        position: [35.8256, 10.6369],
        speed: 0,
        state: 'At Destination',
        driver: 'Mohamed Trabelsi',
        destination: 'Sousse Port',
        route_progress: 100,
        bearing: 0,
        route: realTrajectories['TN-002'].map((point) => [point.lat, point.lng]),
      },
    ];

    const updatedTrucks = await Promise.all(
      sampleTrucks.map(async (truck) => ({
        ...truck,
        route: await getRealRoute(truck),
      }))
    );

    return updatedTrucks;
  };

  // Création d'icône pour camion
  const createTruckIcon = (truck) => {
    const isSelected = selectedTruck && selectedTruck.id === truck.id;
    const speed = truck.speed || 0;
    const state = truck.state || 'Unknown';
    const bearing = truck.bearing || 0;

    let primaryColor = '#6B7280';
    if (isSelected) primaryColor = '#3B82F6';
    else if (state === 'En Route') primaryColor = '#10B981';
    else if (state === 'At Destination') primaryColor = '#8B5CF6';

    const baseSize = isSelected ? 28 : 24;
    const iconSize = [baseSize, baseSize];
    const iconAnchor = [baseSize / 2, baseSize / 2];

    const zoom = map ? map.getZoom() : 13;
    const scaleFactor = Math.max(0.4, Math.min(1.0, zoom / 13));
    const adjustedSize = [baseSize * scaleFactor, baseSize * scaleFactor];
    const adjustedAnchor = [adjustedSize[0] / 2, adjustedSize[1] / 2];

    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: ${adjustedSize[0]}px;
          height: ${adjustedSize[1]}px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${bearing}deg);
          transition: transform 0.2s ease;
        ">
          <div style="
            width: ${adjustedSize[0] - 6}px;
            height: ${adjustedSize[1] - 6}px;
            background: ${primaryColor};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 2px solid white;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
              <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-3c0-.6-.4-1-1-1h-5z"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M15 18H9"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            background: ${speed > 0 ? '#10B981' : '#6B7280'};
            color: white;
            padding: 2px 5px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: bold;
            white-space: nowrap;
            opacity: ${scaleFactor > 0.6 ? 1 : 0.7};
          ">
            ${Math.round(speed)} km/h
          </div>
        </div>
      `,
      className: '',
      iconSize: adjustedSize,
      iconAnchor: adjustedAnchor,
    });
  };

  // Initialisation de la carte
  useEffect(() => {
    configureLeafletIcons();

    generateSampleTrucks().then((sampleTrucks) => {
      setTrucks(sampleTrucks);
    });

    const leafletMap = L.map('map-container', {
      center: [36.8065, 10.1815],
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    const tileLayers = {
      standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }),
      terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap (www.opentopomap.org)',
      }),
    };

    tileLayers.standard.addTo(leafletMap);
    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []);

  // Mise à jour des camions et routes
  useEffect(() => {
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    trucks.forEach((truck) => {
      const marker = L.marker(truck.position, {
        icon: createTruckIcon(truck),
      }).addTo(map);

      marker.on('click', () => {
        setSelectedTruck(truck);
        if (followTruck) {
          map.flyTo(truck.position, map.getZoom(), { animate: true, duration: 1 });
        }
      });

      marker.on('mouseover', function () {
        this.openPopup();
      });

      marker.on('mouseout', function () {
        this.closePopup();
      });

      const currentPointIndex = Math.floor((truck.route_progress / 100) * (truck.route.length - 1));
      const nextPointIndex = Math.min(currentPointIndex + 1, truck.route.length - 1);
      const nextPoint = realTrajectories[truck.id]?.[nextPointIndex]?.name || truck.destination;

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px;">
            🚛 ${truck.id}
          </h4>
          <div style="font-size: 14px; color: #6B7280; line-height: 1.5;">
            <strong>Driver:</strong> ${truck.driver}<br>
            <strong>Destination:</strong> ${truck.destination}<br>
            <strong>Speed:</strong> ${truck.speed} km/h<br>
            <strong>Progress:</strong> ${truck.route_progress}%<br>
            <strong>Next:</strong> ${nextPoint}<br>
            <strong>Status:</strong> ${truck.state}
          </div>
        </div>
      `);

      if (showRoutes && truck.route && truck.route.length > 1) {
        const routeColor = selectedTruck && selectedTruck.id === truck.id ? '#3B82F6' : truck.state === 'En Route' ? '#10B981' : '#8B5CF6';

        L.polyline(truck.route, {
          color: routeColor,
          weight: selectedTruck && selectedTruck.id === truck.id ? 4 : 3,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: selectedTruck ? null : '5, 10',
        }).addTo(map);

        if (selectedTruck && selectedTruck.id === truck.id) {
          realTrajectories[truck.id]?.forEach((point, index) => {
            const isStart = index === 0;
            const isEnd = index === realTrajectories[truck.id].length - 1;

            L.circleMarker([point.lat, point.lng], {
              radius: isStart || isEnd ? 6 : 4,
              color: isStart ? '#10B981' : isEnd ? '#EF4444' : '#F59E0B',
              fillColor: isStart ? '#10B981' : isEnd ? '#EF4444' : '#F59E0B',
              fillOpacity: 1,
              weight: 1,
              stroke: true,
              strokeColor: '#fff',
            }).bindTooltip(point.name, {
              permanent: false,
              direction: 'top',
              offset: [0, -10],
              className: 'custom-tooltip',
            }).addTo(map);
          });
        }
      }
    });
  }, [map, trucks, showRoutes, selectedTruck, followTruck]);

  // Simulation de mouvement réaliste
  useEffect(() => {
    const interval = setInterval(() => {
      setTrucks((prev) =>
        prev.map((truck) => {
          if (truck.state === 'En Route' && truck.route && truck.route.length > 1) {
            const routeIndex = Math.floor((truck.route_progress / 100) * (truck.route.length - 1));
            const nextIndex = Math.min(routeIndex + 1, truck.route.length - 1);
            const progressBetweenPoints = ((truck.route_progress / 100) * (truck.route.length - 1)) % 1;

            const newLat =
              truck.route[routeIndex][0] +
              (truck.route[nextIndex][0] - truck.route[routeIndex][0]) * progressBetweenPoints;
            const newLng =
              truck.route[routeIndex][1] +
              (truck.route[nextIndex][1] - truck.route[routeIndex][1]) * progressBetweenPoints;

            const y = Math.sin(truck.route[nextIndex][1] - truck.route[routeIndex][1]) * Math.cos(truck.route[nextIndex][0]);
            const x =
              Math.cos(truck.route[routeIndex][0]) * Math.sin(truck.route[nextIndex][0]) -
              Math.sin(truck.route[routeIndex][0]) * Math.cos(truck.route[nextIndex][0]) * Math.cos(truck.route[nextIndex][1] - truck.route[routeIndex][1]);
            let newBearing = Math.atan2(y, x) * (180 / Math.PI);
            newBearing = (newBearing + 360) % 360;

            return {
              ...truck,
              position: [newLat, newLng],
              speed: Math.max(20, Math.min(80, truck.speed + (Math.random() - 0.5) * 5)),
              route_progress: Math.min(100, truck.route_progress + Math.random() * 2),
              bearing: newBearing,
            };
          }
          return truck;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Rendu du panneau de contrôle
  const renderControlPanel = () => {
    const isMobile = windowSize.width < 768;

    if (!isControlPanelOpen) {
      return (
        <button
          onClick={() => setIsControlPanelOpen(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '10px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      );
    }

    return (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: isMobile ? '90%' : '280px',
          maxWidth: '300px',
          maxHeight: '90vh',
          overflowY: 'auto',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>🚛 Truck Tracking</h3>
          <button
            onClick={() => setIsControlPanelOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
          <button
            onClick={() => map && map.zoomIn()}
            style={{
              flex: 1,
              padding: '8px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            <svg
              width="8"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => map && map.zoomOut()}
            style={{
              flex: 1,
              padding: '8px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <select
            value={mapStyle}
            onChange={(e) => {
              setMapStyle(e.target.value);
              if (map) {
                map.eachLayer((layer) => {
                  if (layer instanceof L.TileLayer) map.removeLayer(layer);
                });
                const tileLayers = {
                  standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                  }),
                  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                  }),
                  terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenTopoMap (www.opentopomap.org)',
                  }),
                };
                tileLayers[e.target.value].addTo(map);
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <option value="standard">Standard Map</option>
            <option value="satellite">Satellite View</option>
            <option value="terrain">Terrain View</option>
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={() => setShowRoutes(!showRoutes)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            Show Routes
          </label>
          <label style={{ display: 'block', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={followTruck}
              onChange={() => setFollowTruck(!followTruck)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            Follow Selected Truck
          </label>
        </div>
        {selectedTruck && (
          <div
            style={{
              padding: '12px',
              background: '#3B82F6',
              borderRadius: '8px',
              color: 'white',
              marginBottom: '12px',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>🚛 {selectedTruck.id}</div>
            <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{selectedTruck.state}</span>
              <span>{selectedTruck.speed} km/h</span>
              <span>{selectedTruck.route_progress}%</span>
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>To: {selectedTruck.destination}</div>
          </div>
        )}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
            Active Trucks ({trucks.length})
          </h4>
          {trucks.map((truck) => (
            <div
              key={truck.id}
              onClick={() => {
                setSelectedTruck(truck);
                if (followTruck && map) {
                  map.flyTo(truck.position, map.getZoom(), { animate: true, duration: 1 });
                }
              }}
              style={{
                padding: '10px',
                margin: '6px 0',
                background: selectedTruck && selectedTruck.id === truck.id ? '#EBF8FF' : 'white',
                border: selectedTruck && selectedTruck.id === truck.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
              }}
            >
              <div
                style={{
                  fontWeight: '600',
                  color: '#1F2937',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{truck.id}</span>
                <span
                  style={{
                    fontSize: '12px',
                    background: truck.state === 'En Route' ? '#10B981' : '#6B7280',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {truck.state}
                </span>
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                }}
              >
                <span>{truck.driver}</span>
                <span>{truck.speed} km/h</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>To: {truck.destination}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu principal
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        id="map-container"
        style={{
          height: '100%',
          width: '100%',
          minHeight: windowSize.width < 100 ? '300px' : '500px',
          transition: 'all 0.1s ease',
        }}
      />
      {renderControlPanel()}
    </div>
  );
};

export default MapWithTrucks;
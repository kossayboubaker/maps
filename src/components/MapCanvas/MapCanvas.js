import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WEATHER_API_KEY = '4437791bbdc183036e4e04dc15c92cb8';

const MapCanvas = ({
  deliveries = [],
  selectedDelivery,
  onSelectDelivery,
  alerts = [],
  mapStyle = 'standard',
  onMapReady,
  showAlerts = false
}) => {
  const [map, setMap] = useState(null);
  const [trucksData, setTrucksData] = useState(deliveries);
  const [showRoutes, setShowRoutes] = useState(true);
  const [followTruck, setFollowTruck] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [weatherLayer, setWeatherLayer] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // Trajectoires réelles avec uniquement des routes terrestres
  const realTrajectories = {
    'TN-001': [
      { lat: 36.8065, lng: 10.1815, name: 'Tunis Centre', type: 'city' },
      { lat: 36.8128, lng: 10.1658, name: 'Lac 1', type: 'district' },
      { lat: 36.8342, lng: 10.1456, name: 'Ariana Ville', type: 'city' },
      { lat: 36.8567, lng: 10.1234, name: 'Raoued', type: 'suburb' },
      { lat: 36.8234, lng: 10.0987, name: 'Autoroute A4', type: 'highway' },
      { lat: 36.7456, lng: 10.0654, name: 'Manouba', type: 'city' },
      { lat: 36.6789, lng: 10.0321, name: 'Jedaida', type: 'town' },
      { lat: 36.5432, lng: 9.9876, name: 'Testour', type: 'town' },
      { lat: 36.4123, lng: 9.9543, name: 'Beja Sud', type: 'city' },
      { lat: 36.2876, lng: 9.9210, name: 'Medjez el Bab', type: 'town' },
      { lat: 35.8765, lng: 9.8321, name: 'Maktar', type: 'town' },
      { lat: 35.7432, lng: 9.7998, name: 'Siliana', type: 'city' },
      { lat: 34.7406, lng: 10.7603, name: 'Sfax Centre', type: 'city' },
    ],
    'TN-002': [
      { lat: 36.8065, lng: 10.1815, name: 'Tunis Centre', type: 'city' },
      { lat: 36.7234, lng: 10.2987, name: 'Ben Arous', type: 'city' },
      { lat: 36.6543, lng: 10.3654, name: 'Hammam Lif', type: 'coastal_city' },
      { lat: 36.5876, lng: 10.4321, name: 'Soliman', type: 'town' },
      { lat: 36.5109, lng: 10.4988, name: 'Grombalia', type: 'town' },
      { lat: 36.4432, lng: 10.5655, name: 'Bou Argoub', type: 'village' },
      { lat: 36.3765, lng: 10.6322, name: 'Nabeul Sud', type: 'city' },
      { lat: 36.3098, lng: 10.6989, name: 'Hammamet Nord', type: 'coastal_city' },
      { lat: 35.8256, lng: 10.6369, name: 'Sousse Port', type: 'port_city' },
    ],
    'TN-003': [
      { lat: 36.4098, lng: 10.1398, name: 'Ariana Centre', type: 'city' },
      { lat: 36.3, lng: 10.1, name: 'Route GP7', type: 'highway' },
      { lat: 36.1, lng: 10.0, name: 'Mornag', type: 'town' },
      { lat: 35.9, lng: 9.9, name: 'Zaghouan', type: 'city' },
      { lat: 35.6786, lng: 10.0963, name: 'Kairouan Centre', type: 'city' }
    ],
    'TN-004': [
      { lat: 36.7538, lng: 10.2286, name: 'La Goulette Port', type: 'port' },
      { lat: 36.8, lng: 10.4, name: 'Route côtière', type: 'highway' },
      { lat: 36.6, lng: 10.6, name: 'Korba', type: 'town' },
      { lat: 36.4561, lng: 10.7376, name: 'Nabeul Industrial', type: 'city' }
    ],
    'TN-005': [
      { lat: 34.7406, lng: 10.7603, name: 'Sfax Centre', type: 'city' },
      { lat: 34.4, lng: 10.6, name: 'Route GP2', type: 'highway' },
      { lat: 34.1, lng: 10.4, name: 'Mahres', type: 'town' },
      { lat: 33.8869, lng: 10.0982, name: 'Gabes Centre', type: 'city' }
    ]
  };

  const configureLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  };

  const fetchWeatherData = async (lat, lng, locationName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`
      );
      const data = await response.json();
      
      const weatherInfo = {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        visibility: data.visibility / 1000,
        condition: data.weather[0].main,
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like)
      };

      setWeatherData(prev => ({
        ...prev,
        [locationName]: weatherInfo
      }));

      return weatherInfo;
    } catch (error) {
      console.error('Erreur lors de la récupération météo:', error);
      return null;
    }
  };

  const getRealRoute = async (startCoord, endCoord, waypoints = []) => {
    // Utiliser des routes pré-définies réalistes comme fallback principal
    const generateRealisticRoute = (start, end, waypoints = []) => {
      const route = [start];

      // Ajouter les waypoints
      waypoints.forEach(wp => {
        route.push([wp.lat || wp[0], wp.lng || wp[1]]);
      });

      // Interpoler entre les points pour une route plus réaliste
      const interpolatedRoute = [];
      for (let i = 0; i < route.length - 1; i++) {
        const currentPoint = route[i];
        const nextPoint = route[i + 1];

        interpolatedRoute.push(currentPoint);

        // Ajouter des points intermédiaires pour courber la route
        const steps = 8;
        for (let step = 1; step < steps; step++) {
          const ratio = step / steps;
          const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * ratio;
          const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * ratio;

          // Ajouter une légère courbure aléatoire pour simuler une vraie route
          const curvature = 0.01;
          const randomLat = lat + (Math.random() - 0.5) * curvature;
          const randomLng = lng + (Math.random() - 0.5) * curvature;

          interpolatedRoute.push([randomLat, randomLng]);
        }
      }

      interpolatedRoute.push(end);
      return interpolatedRoute;
    };

    try {
      // Essayer d'abord l'API OSRM avec un timeout court
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes timeout

      let coordinates = `${startCoord[1]},${startCoord[0]}`;

      if (waypoints && waypoints.length > 0) {
        waypoints.forEach(wp => {
          coordinates += `;${wp.lng || wp[1]},${wp.lat || wp[0]}`;
        });
      }

      coordinates += `;${endCoord[1]},${endCoord[0]}`;

      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&continue_straight=false`;

      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          return route;
        }
      }

      // Si l'API ne répond pas correctement, utiliser la route réaliste
      return generateRealisticRoute(startCoord, endCoord, waypoints);

    } catch (error) {
      // En cas d'erreur (réseau, CORS, timeout), utiliser la route réaliste
      console.warn('API OSRM non disponible, utilisation de routes simulées:', error.message);
      return generateRealisticRoute(startCoord, endCoord, waypoints);
    }
  };

  // Générer trajectoires réelles pour chaque camion avec routes vraies
  const generateRealRoutes = async () => {
    const routesMap = {};

    for (const truck of trucksData) {
      try {
        let startCoord, endCoord, waypoints = [];

        // Définir points de départ et arrivée selon truck_id
        switch (truck.truck_id) {
          case 'TN-001':
            startCoord = [36.8065, 10.1815]; // Tunis
            endCoord = [34.7406, 10.7603]; // Sfax
            waypoints = [
              [36.7456, 10.0654], // Manouba
              [36.4123, 9.9543], // Beja Sud
              [35.8765, 9.8321], // Maktar
            ];
            break;
          case 'TN-002':
            startCoord = [36.8065, 10.1815]; // Tunis
            endCoord = [35.8256, 10.6369]; // Sousse
            waypoints = [
              [36.6543, 10.3654], // Hammam Lif
              [36.5109, 10.4988], // Grombalia
            ];
            break;
          case 'TN-003':
            startCoord = [36.4098, 10.1398]; // Ariana
            endCoord = [35.6786, 10.0963]; // Kairouan
            waypoints = [
              [36.1, 10.0], // Mornag
              [35.9, 9.9], // Zaghouan
            ];
            break;
          case 'TN-004':
            startCoord = [36.7538, 10.2286]; // La Goulette
            endCoord = [36.4561, 10.7376]; // Nabeul
            waypoints = [
              [36.8, 10.4], // Route côtière
            ];
            break;
          case 'TN-005':
            startCoord = [34.7406, 10.7603]; // Sfax
            endCoord = [33.8869, 10.0982]; // Gabes
            waypoints = [
              [34.4, 10.6], // Route GP2
              [34.1, 10.4], // Mahres
            ];
            break;
          default:
            // Route par défaut
            startCoord = truck.pickup?.coordinates || truck.position;
            endCoord = truck.destinationCoords || truck.destination?.coordinates || truck.position;
        }

        const realRoute = await getRealRoute(startCoord, endCoord, waypoints);
        routesMap[truck.truck_id] = realRoute;

        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Erreur pour ${truck.truck_id}:`, error);
        // Fallback vers route simple
        routesMap[truck.truck_id] = [truck.position, truck.destinationCoords || truck.position];
      }
    }

    return routesMap;
  };

  const createTruckIcon = (truck) => {
    const isSelected = selectedDelivery && selectedDelivery.truck_id === truck.truck_id;
    const speed = truck.speed || 0;
    const state = truck.state || 'Unknown';
    const bearing = truck.bearing || 0;
    const hasAlerts = alerts.filter(alert =>
      alert.affectedRoutes && alert.affectedRoutes.includes(truck.truck_id)
    ).length > 0;

    let primaryColor = '#6B7280';
    if (isSelected) primaryColor = '#3B82F6';
    else if (state === 'En Route') primaryColor = '#10B981';
    else if (state === 'At Destination') primaryColor = '#8B5CF6';
    else if (state === 'Maintenance') primaryColor = '#F59E0B';

    const baseSize = isSelected ? 36 : 32;
    const zoom = map ? map.getZoom() : 13;
    const scaleFactor = Math.max(0.6, Math.min(1.4, zoom / 10));
    const adjustedSize = [baseSize * scaleFactor, baseSize * scaleFactor];

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
          transition: all 0.3s ease;
        ">
          <div style="
            width: ${adjustedSize[0] - 4}px;
            height: ${adjustedSize[1] - 4}px;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            border: 3px solid white;
            ${hasAlerts ? 'animation: alertPulse 2s infinite;' : ''}
            backdrop-filter: blur(10px);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
              <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-3c0-.6-.4-1-1-1h-5z"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M15 18H9"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
          ${hasAlerts ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
              color: white;
              border-radius: 50%;
              width: 22px;
              height: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              border: 2px solid white;
              font-weight: bold;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
              animation: bounce 2s infinite;
            ">
              !
            </div>
          ` : ''}
          <div style="
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${speed > 0 ? '#10B981' : '#6B7280'} 0%, ${speed > 0 ? '#059669' : '#4B5563'} 100%);
            color: white;
            padding: 4px 10px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid white;
          ">
            ${Math.round(speed)} km/h
          </div>
        </div>
        <style>
          @keyframes alertPulse {
            0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 8px 25px rgba(239, 68, 68, 0.8); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
          }
        </style>
      `,
      className: '',
      iconSize: adjustedSize,
      iconAnchor: [adjustedSize[0] / 2, adjustedSize[1] / 2],
    });
  };

  const createAlertIcon = (alert) => {
    const alertStyles = {
      // Accident - Rouge avec icône d'accident
      accident: {
        color: '#EF4444',
        icon: '⚠️',
        bgColor: '#FEE2E2',
        borderColor: '#EF4444'
      },
      // Travaux - Orange avec icône de construction
      construction: {
        color: '#F59E0B',
        icon: '🚧',
        bgColor: '#FEF3C7',
        borderColor: '#F59E0B'
      },
      // Embouteillage - Bleu avec icône de trafic
      traffic: {
        color: '#3B82F6',
        icon: '🚦',
        bgColor: '#DBEAFE',
        borderColor: '#3B82F6'
      },
      // Météo - Gris avec icône météo
      weather: {
        color: '#6B7280',
        icon: alert.icon || '🌧️',
        bgColor: '#F3F4F6',
        borderColor: '#6B7280'
      },
      // Police/contrôle - Violet
      police: {
        color: '#8B5CF6',
        icon: '👮',
        bgColor: '#EDE9FE',
        borderColor: '#8B5CF6'
      },
      // Maintenance - Vert
      maintenance: {
        color: '#10B981',
        icon: '🔧',
        bgColor: '#D1FAE5',
        borderColor: '#10B981'
      }
    };

    const style = alertStyles[alert.type] || alertStyles.accident;

    return L.divIcon({
      html: `
        <div style="
          width: 42px;
          height: 42px;
          background: ${style.bgColor};
          border: 3px solid ${style.borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          animation: alertPulse 2s infinite;
          position: relative;
        ">
          ${style.icon}
          <div style="
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: ${style.color};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid white;
          ">
            !
          </div>
        </div>
        <style>
          @keyframes alertPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }
            50% {
              transform: scale(1.1);
              box-shadow: 0 6px 20px ${style.color}60;
            }
          }
        </style>
      `,
      className: '',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  };

  const handleMapStyleChange = (style) => {
    if (!map) return;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && layer !== weatherLayer) {
        map.removeLayer(layer);
      }
    });

    const tileLayers = {
      standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
      }),
      terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
      }),
    };

    tileLayers[style].addTo(map);
  };

  // Suivi des mouvements de souris pour les tooltips
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    configureLeafletIcons();

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
        attribution: 'Tiles © Esri',
      }),
      terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
      }),
    };

    tileLayers.standard.addTo(leafletMap);
    setMap(leafletMap);

    if (onMapReady) {
      onMapReady(leafletMap);
    }

    // Générer les routes réelles après initialisation
    setTimeout(() => {
      generateRealRoutes().then(routes => {
        setTrucksData(prev => prev.map(truck => ({
          ...truck,
          realRoute: routes[truck.truck_id] || [truck.position, truck.destinationCoords || truck.position]
        })));
      });
    }, 1000);

    return () => {
      leafletMap.remove();
    };
  }, []);

  // Mise à jour du style de carte
  useEffect(() => {
    if (map) {
      handleMapStyleChange(mapStyle);
    }
  }, [mapStyle, map]);

  // Affichage des camions et alertes
  useEffect(() => {
    if (!map) return;

    // Nettoyer les marqueurs existants
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Ajouter les camions
    trucksData.forEach((truck) => {
      const marker = L.marker(truck.position, {
        icon: createTruckIcon(truck),
      }).addTo(map);

      // Événements de survol pour les tooltips
      marker.on('mouseover', (e) => {
        setHoveredItem({
          type: 'truck',
          data: truck,
          alerts: alerts.filter(alert => 
            alert.affectedRoutes && alert.affectedRoutes.includes(truck.truck_id)
          )
        });
      });

      marker.on('mouseout', () => {
        setHoveredItem(null);
      });

      marker.on('click', () => {
        onSelectDelivery(truck);
        if (followTruck) {
          map.flyTo(truck.position, Math.max(map.getZoom(), 12), { animate: true, duration: 1 });
        }
      });

      // Affichage des routes avec trajectoires réelles
      if (showRoutes && truck.realRoute) {
        const routeColor = selectedDelivery && selectedDelivery.truck_id === truck.truck_id ? '#3B82F6' :
                          truck.state === 'En Route' ? '#10B981' : '#8B5CF6';

        // Créer une polyligne avec style amélioré
        const routeLine = L.polyline(truck.realRoute, {
          color: routeColor,
          weight: selectedDelivery && selectedDelivery.truck_id === truck.truck_id ? 6 : 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: truck.state === 'En Route' ? null : '12, 8',
        }).addTo(map);

        // Ajouter un effet de gradient pour le camion sélectionné
        if (selectedDelivery && selectedDelivery.truck_id === truck.truck_id) {
          // Route parcourue (vert)
          const progressIndex = Math.floor((truck.route_progress / 100) * truck.realRoute.length);
          if (progressIndex > 0) {
            L.polyline(truck.realRoute.slice(0, progressIndex), {
              color: '#10B981',
              weight: 8,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);
          }

          // Route restante (bleu plus clair)
          if (progressIndex < truck.realRoute.length) {
            L.polyline(truck.realRoute.slice(progressIndex), {
              color: '#60A5FA',
              weight: 6,
              opacity: 0.6,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '8, 4',
            }).addTo(map);
          }

          // Marqueurs de départ et arrivée
          L.circleMarker(truck.realRoute[0], {
            radius: 8,
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 1,
            weight: 3,
            stroke: true,
            strokeColor: '#fff',
          }).addTo(map).bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong>🟢 Départ</strong><br>
              ${truck.pickup?.address || 'Point de départ'}
            </div>
          `);

          L.circleMarker(truck.realRoute[truck.realRoute.length - 1], {
            radius: 8,
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 1,
            weight: 3,
            stroke: true,
            strokeColor: '#fff',
          }).addTo(map).bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong>🔴 Destination</strong><br>
              ${truck.destination || truck.destination?.address || 'Point d\'arrivée'}
            </div>
          `);
        }
      }
    });

    // Ajouter les alertes
    if (showAlerts) {
      alerts.forEach(alert => {
        const alertMarker = L.marker(alert.position, {
          icon: createAlertIcon(alert),
        }).addTo(map);

        // Événements de survol pour les tooltips
        alertMarker.on('mouseover', () => {
          setHoveredItem({
            type: 'alert',
            data: alert
          });
        });

        alertMarker.on('mouseout', () => {
          setHoveredItem(null);
        });

        alertMarker.bindPopup(`
          <div style="padding: 12px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${alert.icon}</span>
              <strong style="color: #1f2937;">${alert.title}</strong>
            </div>
            <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">${alert.description}</p>
            <div style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
              📍 ${alert.location}<br>
              ⏱️ Retard estimé: +${alert.delay} minutes<br>
              🚛 Affecte: ${alert.affectedRoutes?.join(', ')}
            </div>
          </div>
        `);
      });
    }

  }, [map, trucksData, selectedDelivery, showRoutes, followTruck, alerts, showAlerts]);

  // Couche météo
  useEffect(() => {
    if (!map) return;

    if (showWeather && !weatherLayer) {
      const wLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`, {
        attribution: 'Weather data © OpenWeatherMap',
        opacity: 0.6,
      });
      wLayer.addTo(map);
      setWeatherLayer(wLayer);
    } else if (!showWeather && weatherLayer) {
      map.removeLayer(weatherLayer);
      setWeatherLayer(null);
    }
  }, [showWeather, map, weatherLayer]);

  // Animation des camions
  useEffect(() => {
    setTrucksData(deliveries);

    const interval = setInterval(() => {
      setTrucksData((prev) =>
        prev.map((truck) => {
          if (truck.state === 'En Route' && truck.realRoute && truck.realRoute.length > 1) {
            // Utiliser la vraie route pour l'animation
            const routeIndex = Math.floor((truck.route_progress / 100) * (truck.realRoute.length - 1));
            const nextIndex = Math.min(routeIndex + 1, truck.realRoute.length - 1);
            const progressBetweenPoints = ((truck.route_progress / 100) * (truck.realRoute.length - 1)) % 1;

            const currentPoint = truck.realRoute[routeIndex];
            const nextPoint = truck.realRoute[nextIndex];

            const newLat = currentPoint[0] +
              (nextPoint[0] - currentPoint[0]) * progressBetweenPoints;
            const newLng = currentPoint[1] +
              (nextPoint[1] - currentPoint[1]) * progressBetweenPoints;

            // Calcul de l'orientation basé sur la vraie route
            const deltaLat = nextPoint[0] - currentPoint[0];
            const deltaLng = nextPoint[1] - currentPoint[1];
            let newBearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
            newBearing = (newBearing + 360) % 360;

            const newProgress = Math.min(100, truck.route_progress + Math.random() * 1.2);
            const newSpeed = Math.max(25, Math.min(85, truck.speed + (Math.random() - 0.5) * 5));

            return {
              ...truck,
              position: [newLat, newLng],
              speed: newSpeed,
              route_progress: newProgress,
              bearing: newBearing,
            };
          }
          return truck;
        })
      );
    }, 4000); // Légèrement plus rapide pour smoother animation

    return () => clearInterval(interval);
  }, [deliveries]);

  // Panneau de contrôle
  const ControlPanel = () => {
    if (!isControlPanelOpen) {
      return (
        <button
          onClick={() => setIsControlPanelOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            height: '56px',
            width: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      );
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          width: '380px',
          maxWidth: '90vw',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(25px)',
          borderRadius: '24px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.12)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
                  <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-3c0-.6-.4-1-1-1h-5z"/>
                  <circle cx="7" cy="18" r="2"/>
                  <path d="M15 18H9"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '22px', 
                fontWeight: '800' 
              }}>
                Contrôles Carte
              </h2>
            </div>
            <button
              onClick={() => setIsControlPanelOpen(false)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ 
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Contrôles de couches */}
          <div style={{
            background: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#1f2937' 
            }}>
              Couches de carte
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: '#3B82F6'
                  }}
                />
                🛣️ Afficher les routes
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={showWeather}
                  onChange={(e) => setShowWeather(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: '#3B82F6'
                  }}
                />
                🌧️ Couche météo
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={followTruck}
                  onChange={(e) => setFollowTruck(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: '#3B82F6'
                  }}
                />
                📱 Suivre le camion sélectionné
              </label>
            </div>
          </div>

          {/* Camion sélectionné */}
          {selectedDelivery && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #bfdbfe'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#1e40af'
                }}>
                  🚛 {selectedDelivery.truck_id}
                </h3>
                <span style={{
                  background: selectedDelivery.state === 'En Route' ? '#10b981' : '#8b5cf6',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {selectedDelivery.state}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Conducteur</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    👤 {selectedDelivery.driver.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Destination</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    📍 {selectedDelivery.destination || selectedDelivery.destination?.address}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Vitesse</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    ⚡ {Math.round(selectedDelivery.speed)} km/h
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Progression</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    📊 {selectedDelivery.route_progress}%
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: `${selectedDelivery.route_progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '8px',
                  transition: 'width 0.5s ease'
                }} />
              </div>

              {/* Météo destination */}
              {weatherData[selectedDelivery.destination || selectedDelivery.destination?.address] && (
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {weatherData[selectedDelivery.destination || selectedDelivery.destination?.address].condition === 'Clear' ? '☀️' :
                     weatherData[selectedDelivery.destination || selectedDelivery.destination?.address].condition === 'Clouds' ? '☁️' :
                     weatherData[selectedDelivery.destination || selectedDelivery.destination?.address].condition === 'Rain' ? '🌧️' : '🌤️'}
                  </span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                      {weatherData[selectedDelivery.destination || selectedDelivery.destination?.address].temp}°C
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {weatherData[selectedDelivery.destination || selectedDelivery.destination?.address].description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: '100vh', 
      width: '100%', 
      overflow: 'hidden',
      background: '#f1f5f9'
    }}>
      <div
        id="map-container"
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          borderRadius: '0',
          overflow: 'hidden'
        }}
      />
      
      <ControlPanel />
      
      {/* Tooltip au survol */}
      {hoveredItem && (
        <div
          style={{
            position: 'fixed',
            left: mousePosition.x + 20,
            top: mousePosition.y - 10,
            zIndex: 10000,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            minWidth: '250px',
            maxWidth: '350px',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {hoveredItem.type === 'truck' ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  🚛
                </div>
                <div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '800', 
                    color: '#1f2937' 
                  }}>
                    {hoveredItem.data.truck_id}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    {hoveredItem.data.vehicle}
                  </p>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>👤 Conducteur:</span><br/>
                    <strong style={{ color: '#1f2937' }}>{hoveredItem.data.driver.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>📍 Destination:</span><br/>
                    <strong style={{ color: '#1f2937' }}>{hoveredItem.data.destination}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>⚡ Vitesse:</span><br/>
                    <strong style={{ color: '#1f2937' }}>{Math.round(hoveredItem.data.speed)} km/h</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>📊 Progression:</span><br/>
                    <strong style={{ color: '#1f2937' }}>{hoveredItem.data.route_progress}%</strong>
                  </div>
                </div>
              </div>

              {hoveredItem.alerts && hoveredItem.alerts.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  borderLeft: '4px solid #ef4444'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                    ⚠️ {hoveredItem.alerts.length} alerte{hoveredItem.alerts.length > 1 ? 's' : ''} active{hoveredItem.alerts.length > 1 ? 's' : ''}
                  </div>
                  {hoveredItem.alerts.slice(0, 2).map((alert, index) => (
                    <div key={index} style={{ fontSize: '11px', color: '#7f1d1d', marginBottom: '2px' }}>
                      {alert.icon} {alert.title} (+{alert.delay}min)
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>{hoveredItem.data.icon}</span>
                <div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#1f2937' 
                  }}>
                    {hoveredItem.data.title}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    {hoveredItem.data.location}
                  </p>
                </div>
              </div>
              
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '13px', 
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                {hoveredItem.data.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#9ca3af'
              }}>
                <span>🚛 {hoveredItem.data.affectedRoutes?.join(', ')}</span>
                <span style={{ 
                  background: hoveredItem.data.severity === 'danger' ? '#ef4444' : 
                             hoveredItem.data.severity === 'warning' ? '#f59e0b' : '#3b82f6',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  +{hoveredItem.data.delay}min
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {trucksData.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.9)',
          zIndex: 999
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '6px solid #e5e7eb',
              borderTop: '6px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px', 
              fontWeight: '600',
              margin: 0
            }}>
              Chargement de la flotte...
            </p>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Responsive Design */
          @media (max-width: 768px) {
            .control-panel {
              width: 95vw !important;
              right: 2.5vw !important;
            }
          }
          
          @media (max-width: 480px) {
            .control-panel {
              width: 100vw !important;
              right: 0 !important;
              top: 0 !important;
              border-radius: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MapCanvas;

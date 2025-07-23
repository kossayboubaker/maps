import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WEATHER_API_KEY = '4437791bbdc183036e4e04dc15c92cb8';

const MapCanvas = () => {
  const [map, setMap] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [followTruck, setFollowTruck] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [weatherLayer, setWeatherLayer] = useState(null);
  const mapRef = useRef(null);

  // Real trajectories with only terrestrial routes
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

  // Improved alert generation with better detection
  const fetchRealTimeTrafficAlerts = async () => {
    try {
      const alerts = [];
      const now = new Date();
      const currentHour = now.getHours();
      
      // Determine base alert probability based on time of day
      let baseAlertProbability = 0.08; // Default
      if (currentHour >= 7 && currentHour <= 9) baseAlertProbability = 0.15; // Morning rush hour
      else if (currentHour >= 16 && currentHour <= 19) baseAlertProbability = 0.18; // Evening rush hour
      else if (currentHour >= 22 || currentHour <= 5) baseAlertProbability = 0.05; // Night time

      for (const truckId in realTrajectories) {
        const route = realTrajectories[truckId];
        
        const terrestrialPoints = route.filter(point => 
          !['coastal_city', 'port_city'].includes(point.type)
        );
        
        for (let i = 0; i < terrestrialPoints.length - 1; i++) {
          const point = terrestrialPoints[i];
          const nextPoint = terrestrialPoints[i + 1];
          
          const weather = await fetchWeatherData(point.lat, point.lng, point.name);
          
          // Enhanced weather-based alerts
          if (weather) {
            // Rain alerts - higher probability if actually raining
            if (weather.condition.toLowerCase().includes('rain')) {
              const rainIntensity = weather.description.includes('légère') ? 0.6 : 
                                   weather.description.includes('forte') ? 0.9 : 0.75;
              if (Math.random() < rainIntensity) {
                alerts.push({
                  id: `weather-${Date.now()}-${i}`,
                  type: 'weather',
                  title: `Pluie signalée à ${point.name}`,
                  description: `Conditions météo: ${weather.description}`,
                  severity: 'warning',
                  delay: Math.floor(Math.random() * 15) + 5,
                  icon: '🌧️',
                  position: [point.lat, point.lng],
                  affectedRoutes: [truckId],
                  timestamp: new Date().toISOString(),
                  weather: weather,
                  location: point.name
                });
              }
            }
            
            // Wind alerts
            if (weather.windSpeed > 40) {
              alerts.push({
                id: `wind-${Date.now()}-${i}`,
                type: 'weather',
                title: `Vents forts à ${point.name}`,
                description: `Vitesse du vent: ${weather.windSpeed} km/h`,
                severity: weather.windSpeed > 60 ? 'danger' : 'warning',
                delay: Math.floor(Math.random() * 20) + 10,
                icon: '💨',
                position: [point.lat, point.lng],
                affectedRoutes: [truckId],
                timestamp: new Date().toISOString(),
                weather: weather,
                location: point.name
              });
            }

            // Fog alerts
            if (weather.visibility < 1 && weather.condition.toLowerCase().includes('fog')) {
              alerts.push({
                id: `fog-${Date.now()}-${i}`,
                type: 'weather',
                title: `Brouillard dense à ${point.name}`,
                description: `Visibilité réduite à ${weather.visibility} km`,
                severity: 'danger',
                delay: Math.floor(Math.random() * 25) + 15,
                icon: '🌫️',
                position: [point.lat, point.lng],
                affectedRoutes: [truckId],
                timestamp: new Date().toISOString(),
                weather: weather,
                location: point.name
              });
            }
          }
          
          // Road-specific alerts with enhanced logic
          if (['highway', 'city', 'town'].includes(point.type)) {
            let alertProbability = baseAlertProbability;
            
            // Increase probability for highways
            if (point.type === 'highway') alertProbability *= 1.5;
            
            // Increase probability during bad weather
            if (weather && ['rain', 'fog', 'thunderstorm'].includes(weather.condition.toLowerCase())) {
              alertProbability *= 2;
            }
            
            if (Math.random() < alertProbability) {
              const alertTypes = [
                {
                  type: 'construction',
                  title: `Travaux Route ${point.name}`,
                  description: 'Réduction à une voie, circulation alternée',
                  severity: 'warning',
                  delay: Math.floor(Math.random() * 25) + 15,
                  icon: '🚧'
                },
                {
                  type: 'accident',
                  title: `Accident Route ${point.name}`,
                  description: 'Véhicule accidenté, ralentissements',
                  severity: 'danger',
                  delay: Math.floor(Math.random() * 35) + 20,
                  icon: '⚠️'
                },
                {
                  type: 'traffic',
                  title: `Embouteillage ${point.name}`,
                  description: 'Trafic dense, vitesse réduite',
                  severity: 'warning',
                  delay: Math.floor(Math.random() * 18) + 8,
                  icon: '🚦'
                },
                {
                  type: 'police',
                  title: `Contrôle police ${point.name}`,
                  description: 'Contrôle de vitesse en cours',
                  severity: 'info',
                  delay: Math.floor(Math.random() * 10) + 5,
                  icon: '👮'
                }
              ];
              
              const selectedAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
              alerts.push({
                id: `alert-${Date.now()}-${i}`,
                ...selectedAlert,
                position: [point.lat, point.lng],
                affectedRoutes: [truckId],
                timestamp: new Date().toISOString(),
                location: point.name,
                weather: weather
              });
            }
          }
        }
      }
      
      setRealTimeAlerts(alerts);
      
      // Update notifications
      if (alerts.length > 0) {
        const newNotifications = alerts.filter(alert => 
          !notifications.some(notif => notif.id === alert.id)
        ).map(alert => ({
          id: alert.id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          timestamp: alert.timestamp,
          delay: alert.delay,
          location: alert.location,
          type: alert.type,
          icon: alert.icon,
          read: false
        }));
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  };

  const getRealRoute = async (startCoord, endCoord) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      }
      return [startCoord, endCoord];
    } catch (error) {
      console.error('Erreur lors de la récupération de la route:', error);
      return [startCoord, endCoord];
    }
  };

  const generateSampleTrucks = async () => {
    const sampleTrucks = [
      {
        id: 'TN-001',
        position: [36.8065, 10.1815],
        speed: 67,
        state: 'En Route',
        driver: 'Ahmed Ben Ali',
        destination: 'Sfax',
        route_progress: 35,
        bearing: 45,
        route: realTrajectories['TN-001'].map((point) => [point.lat, point.lng]),
        estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000),
        totalDistance: 280,
        fuelLevel: 75,
        alerts: []
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
        estimatedArrival: new Date(Date.now() - 30 * 60 * 1000),
        totalDistance: 140,
        fuelLevel: 60,
        alerts: []
      },
    ];

    for (let truck of sampleTrucks) {
      const trajectory = realTrajectories[truck.id];
      if (trajectory && trajectory.length > 1) {
        const realRoute = await getRealRoute(
          [trajectory[0].lat, trajectory[0].lng],
          [trajectory[trajectory.length - 1].lat, trajectory[trajectory.length - 1].lng]
        );
        truck.route = realRoute;
      }
    }

    return sampleTrucks;
  };

  const createTruckIcon = (truck) => {
    const isSelected = selectedTruck && selectedTruck.id === truck.id;
    const speed = truck.speed || 0;
    const state = truck.state || 'Unknown';
    const bearing = truck.bearing || 0;
    const hasAlerts = truck.alerts && truck.alerts.length > 0;

    let primaryColor = '#6B7280';
    if (isSelected) primaryColor = '#3B82F6';
    else if (state === 'En Route') primaryColor = '#10B981';
    else if (state === 'At Destination') primaryColor = '#8B5CF6';

    const baseSize = isSelected ? 32 : 28;
    const zoom = map ? map.getZoom() : 13;
    const scaleFactor = Math.max(0.6, Math.min(1.3, zoom / 10));
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
            background: ${primaryColor};
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
            border: 3px solid white;
            ${hasAlerts ? 'animation: alertPulse 2s infinite;' : ''}
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
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
              background: #EF4444;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              border: 2px solid white;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              !
            </div>
          ` : ''}
          <div style="
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: ${speed > 0 ? '#10B981' : '#6B7280'};
            color: white;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            border: 1px solid white;
          ">
            ${Math.round(speed)} km/h
          </div>
        </div>
        <style>
          @keyframes alertPulse {
            0%, 100% { box-shadow: 0 6px 16px rgba(0,0,0,0.25); }
            50% { box-shadow: 0 6px 16px rgba(239, 68, 68, 0.7); }
          }
        </style>
      `,
      className: '',
      iconSize: adjustedSize,
      iconAnchor: [adjustedSize[0] / 2, adjustedSize[1] / 2],
    });
  };

  const createAlertIcon = (alert) => {
    const colors = {
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6'
    };

    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${colors[alert.severity]};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          animation: alertBounce 3s infinite;
        ">
          ${alert.icon}
        </div>
        <style>
          @keyframes alertBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        </style>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const calculateEstimatedTime = (truck) => {
    let baseTime = truck.estimatedArrival;
    let totalDelay = 0;

    if (truck.alerts) {
      truck.alerts.forEach(alert => {
        totalDelay += alert.delay || 0;
      });
    }

    const adjustedTime = new Date(baseTime.getTime() + totalDelay * 60 * 1000);
    return { adjustedTime, totalDelay };
  };

  const getWeatherIcon = (condition, size = 16) => {
    const icons = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
      'fog': '🌫️'
    };
    
    return icons[condition?.toLowerCase()] || '☁️';
  };

  const handleMapStyleChange = (style) => {
    if (!map) return;
    
    setMapStyle(style);
    
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

  useEffect(() => {
    configureLeafletIcons();
    fetchRealTimeTrafficAlerts();

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
      weather: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`, {
        attribution: 'Weather data © OpenWeatherMap',
        opacity: 0.6,
      }),
    };

    tileLayers.standard.addTo(leafletMap);
    setMap(leafletMap);

    generateSampleTrucks().then(setTrucks);

    return () => {
      leafletMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
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
          map.flyTo(truck.position, Math.max(map.getZoom(), 12), { animate: true, duration: 1 });
        }
      });

      if (showRoutes && truck.route && truck.route.length > 1) {
        const routeColor = selectedTruck && selectedTruck.id === truck.id ? '#3B82F6' : 
                          truck.state === 'En Route' ? '#10B981' : '#8B5CF6';

        L.polyline(truck.route, {
          color: routeColor,
          weight: selectedTruck && selectedTruck.id === truck.id ? 6 : 4,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: truck.state === 'En Route' ? null : '12, 8',
        }).addTo(map);

        if (selectedTruck && selectedTruck.id === truck.id) {
          realTrajectories[truck.id]?.forEach((point, index) => {
            const isStart = index === 0;
            const isEnd = index === realTrajectories[truck.id].length - 1;
            const isCurrent = index === Math.floor((truck.route_progress / 100) * (realTrajectories[truck.id].length - 1));

            const waypoint = L.circleMarker([point.lat, point.lng], {
              radius: isStart || isEnd || isCurrent ? 10 : 6,
              color: isStart ? '#10B981' : isEnd ? '#EF4444' : isCurrent ? '#F59E0B' : '#6B7280',
              fillColor: isStart ? '#10B981' : isEnd ? '#EF4444' : isCurrent ? '#F59E0B' : '#6B7280',
              fillOpacity: 1,
              weight: 3,
              stroke: true,
              strokeColor: '#fff',
            }).addTo(map);
          });
        }
      }
    });

    realTimeAlerts.forEach(alert => {
      const alertMarker = L.marker(alert.position, {
        icon: createAlertIcon(alert),
      }).addTo(map);

      alertMarker.on('click', () => {
        const notification = notifications.find(n => n.id === alert.id);
        if (notification) {
          setNotifications(prev => 
            prev.map(n => n.id === alert.id ? {...n, read: true} : n)
          );
        }
      });
    });

  }, [map, trucks, showRoutes, selectedTruck, followTruck, weatherData, realTimeAlerts, notifications]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTrucks((prev) =>
        prev.map((truck) => {
          if (truck.state === 'En Route' && truck.route && truck.route.length > 1) {
            const routeIndex = Math.floor((truck.route_progress / 100) * (truck.route.length - 1));
            const nextIndex = Math.min(routeIndex + 1, truck.route.length - 1);
            const progressBetweenPoints = ((truck.route_progress / 100) * (truck.route.length - 1)) % 1;

            const newLat = truck.route[routeIndex][0] + 
              (truck.route[nextIndex][0] - truck.route[routeIndex][0]) * progressBetweenPoints;
            const newLng = truck.route[routeIndex][1] + 
              (truck.route[nextIndex][1] - truck.route[routeIndex][1]) * progressBetweenPoints;

            const y = Math.sin(truck.route[nextIndex][1] - truck.route[routeIndex][1]) * 
              Math.cos(truck.route[nextIndex][0]);
            const x = Math.cos(truck.route[routeIndex][0]) * Math.sin(truck.route[nextIndex][0]) - 
              Math.sin(truck.route[routeIndex][0]) * Math.cos(truck.route[nextIndex][0]) * 
              Math.cos(truck.route[nextIndex][1] - truck.route[routeIndex][1]);
            let newBearing = Math.atan2(y, x) * (180 / Math.PI);
            newBearing = (newBearing + 360) % 360;

            const newProgress = Math.min(100, truck.route_progress + Math.random() * 1.8);
            const newSpeed = Math.max(25, Math.min(85, truck.speed + (Math.random() - 0.5) * 4));

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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trucks.forEach(truck => {
      if (!weatherData[truck.destination]) {
        const destination = realTrajectories[truck.id]?.slice(-1)[0];
        if (destination) {
          fetchWeatherData(destination.lat, destination.lng, truck.destination);
        }
      }
    });
  }, [trucks]);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      fetchRealTimeTrafficAlerts();
    }, 45000);

    return () => clearInterval(alertInterval);
  }, []);

  // Fixed Control Panel without popups
  const ControlPanel = () => {
    if (!isControlPanelOpen) {
      return React.createElement('button', {
        onClick: () => setIsControlPanelOpen(true),
        style: {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          height: '48px',
          width: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }
      }, React.createElement('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: '#374151',
        strokeWidth: '2'
      }, React.createElement('path', {
        d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'
      }), React.createElement('circle', {
        cx: '12',
        cy: '12',
        r: '3'
      })));
    }

    return React.createElement('div', {
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        width: '360px',
        maxWidth: '90vw',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }
    }, 
      // Header
      React.createElement('div', {
        style: { 
          padding: '20px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      }, 
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '12px' }
        },
          React.createElement('div', {
            style: {
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, React.createElement('svg', {
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'white',
            strokeWidth: '2'
          }, React.createElement('path', {
            d: 'M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11'
          }), React.createElement('path', {
            d: 'M14 9h4l4 4v4c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-3c0-.6-.4-1-1-1h-5z'
          }), React.createElement('circle', {
            cx: '7',
            cy: '18',
            r: '2'
          }), React.createElement('path', {
            d: 'M15 18H9'
          }), React.createElement('circle', {
            cx: '17',
            cy: '18',
            r: '2'
          }))),
          React.createElement('h2', {
            style: { 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1F2937' 
            }
          }, 'Truck Control')
        ),
        React.createElement('div', {
          style: { display: 'flex', gap: '8px' }
        },
          React.createElement('button', {
            onClick: () => setShowNotifications(!showNotifications),
            style: {
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              background: showNotifications ? '#3B82F6' : 'white',
              color: showNotifications ? 'white' : '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }
          }, React.createElement('svg', {
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2'
          }, React.createElement('path', {
            d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'
          }), React.createElement('path', {
            d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'
          })), notifications.filter(n => !n.read).length > 0 && React.createElement('div', {
            style: {
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              background: '#EF4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: 'white',
              fontWeight: 'bold'
            }
          }, notifications.filter(n => !n.read).length)),
          React.createElement('button', {
            onClick: () => setIsControlPanelOpen(false),
            style: {
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              background: 'white',
              color: '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }
          }, React.createElement('svg', {
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: '2'
          }, React.createElement('path', {
            d: 'M18 6L6 18M6 6l12 12'
          })))
        )
      ),
      
      // Content - Fixed height with no scroll
      React.createElement('div', {
        style: { 
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }
      }, 
        // Map Controls Section
        React.createElement('div', {
          style: {
            background: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '12px',
            padding: '12px'
          }
        },
          React.createElement('div', {
            style: { display: 'flex', gap: '8px', marginBottom: '12px' }
          },
            React.createElement('button', {
              onClick: () => map?.zoomIn(),
              style: {
                flex: 1,
                padding: '8px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151'
              }
            }, 'Zoom +'),
            React.createElement('button', {
              onClick: () => map?.zoomOut(),
              style: {
                flex: 1,
                padding: '8px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151'
              }
            }, 'Zoom -')
          ),

          React.createElement('div', {
            style: { marginBottom: '12px' }
          },
            React.createElement('label', {
              style: { 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#374151' 
              }
            }, 'Style de carte'),
            React.createElement('select', {
              value: mapStyle,
              onChange: (e) => handleMapStyleChange(e.target.value),
              style: {
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '12px',
                cursor: 'pointer',
                background: 'white',
                outline: 'none',
                color: '#374151'
              }
            },
              React.createElement('option', { value: 'standard' }, 'Standard Map'),
              React.createElement('option', { value: 'satellite' }, 'Satellite View'),
              React.createElement('option', { value: 'terrain' }, 'Terrain View')
            )
          ),

          React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          },
            React.createElement('label', {
              style: { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151'
              }
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: showRoutes,
                onChange: (e) => setShowRoutes(e.target.checked),
                style: { 
                  width: '14px', 
                  height: '14px', 
                  cursor: 'pointer',
                  accentColor: '#3B82F6'
                }
              }),
              'Afficher les routes'
            ),
            
            React.createElement('label', {
              style: { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151'
              }
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: showWeather,
                onChange: (e) => setShowWeather(e.target.checked),
                style: { 
                  width: '14px', 
                  height: '14px', 
                  cursor: 'pointer',
                  accentColor: '#3B82F6'
                }
              }),
              'Couche météo'
            ),

            React.createElement('label', {
              style: { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151'
              }
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: followTruck,
                onChange: (e) => setFollowTruck(e.target.checked),
                style: { 
                  width: '14px', 
                  height: '14px', 
                  cursor: 'pointer',
                  accentColor: '#3B82F6'
                }
              }),
              'Suivre camion'
            )
          )
        ),

        // Selected Truck Section - More detailed view
        selectedTruck && React.createElement('div', {
          style: {
            background: 'linear-gradient(135deg, #EBF8FF 0%, #DBEAFE 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #BFDBFE'
          }
        },
          React.createElement('div', {
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '12px' 
            }
          },
            React.createElement('h3', {
              style: { 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '700', 
                color: '#1E40AF' 
              }
            }, `🚛 ${selectedTruck.id}`),
            React.createElement('span', {
              style: {
                background: selectedTruck.state === 'En Route' ? '#10B981' : '#8B5CF6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }
            }, selectedTruck.state)
          ),
          
          React.createElement('div', {
            style: { 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }
          },
            React.createElement('div', null, 
              React.createElement('div', { style: { fontSize: '11px', color: '#6B7280' } }, 'Conducteur'),
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '600' } }, selectedTruck.driver)
            ),
            React.createElement('div', null, 
              React.createElement('div', { style: { fontSize: '11px', color: '#6B7280' } }, 'Destination'),
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '600' } }, selectedTruck.destination)
            ),
            React.createElement('div', null, 
              React.createElement('div', { style: { fontSize: '11px', color: '#6B7280' } }, 'Vitesse'),
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '600' } }, `${Math.round(selectedTruck.speed)} km/h`)
            ),
            React.createElement('div', null, 
              React.createElement('div', { style: { fontSize: '11px', color: '#6B7280' } }, 'Progression'),
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '600' } }, `${selectedTruck.route_progress}%`)
            )
          ),
          
          // Weather information
          weatherData[selectedTruck.destination] && React.createElement('div', {
            style: {
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          },
            React.createElement('span', { style: { fontSize: '20px' } }, 
              getWeatherIcon(weatherData[selectedTruck.destination].condition)
            ),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '600' } },
                `${weatherData[selectedTruck.destination].temp}°C (ressenti ${weatherData[selectedTruck.destination].feelsLike}°C)`
              ),
              React.createElement('div', { style: { fontSize: '12px', color: '#6B7280' } },
                weatherData[selectedTruck.destination].description
              )
            )
          )
        ),

        // Trucks List Section - Compact view
        React.createElement('div', null,
          React.createElement('h3', {
            style: { 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '700', 
              color: '#1F2937' 
            }
          }, `Camions actifs (${trucks.length})`),
          React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
          }, trucks.map((truck) => {
            const { adjustedTime } = calculateEstimatedTime(truck);
            const currentWeather = weatherData[truck.destination];
            
            return React.createElement('div', {
              key: truck.id,
              onClick: () => {
                setSelectedTruck(truck);
                if (followTruck && map) {
                  map.flyTo(truck.position, Math.max(map.getZoom(), 12), {
                    animate: true,
                    duration: 1
                  });
                }
              },
              style: {
                padding: '12px',
                background: selectedTruck?.id === truck.id 
                  ? 'linear-gradient(135deg, #EBF8FF 0%, #DBEAFE 100%)' 
                  : 'white',
                border: selectedTruck?.id === truck.id 
                  ? '2px solid #3B82F6' 
                  : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }
            },
              React.createElement('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }
              },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                  React.createElement('span', { style: { fontSize: '14px', fontWeight: '700', color: '#1F2937' } }, truck.id),
                  truck.alerts && truck.alerts.length > 0 && React.createElement('div', {
                    style: {
                      background: '#EF4444',
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: '600'
                    }
                  }, truck.alerts.length)
                ),
                React.createElement('span', {
                  style: {
                    background: truck.state === 'En Route' ? '#10B981' : '#8B5CF6',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }
                }, truck.state)
              ),
              
              React.createElement('div', {
                style: {
                  fontSize: '12px',
                  color: '#6B7280',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4px'
                }
              },
                React.createElement('span', null, `👤 ${truck.driver}`),
                React.createElement('span', { style: { fontWeight: '600' } }, `⚡ ${Math.round(truck.speed)} km/h`),
                React.createElement('span', null, `📍 ${truck.destination}`),
                React.createElement('span', null, `🕒 ${adjustedTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`)
              )
            );
          }))
        )
      )
    );
  };

  // Notification Panel - Maintained as before
  const NotificationPanel = () => {
    if (!showNotifications || notifications.length === 0) return null;

    return React.createElement('div', {
      style: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 999,
        width: '350px',
        maxWidth: '90vw',
        maxHeight: '500px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden'
      }
    },
      React.createElement('div', {
        style: { 
          padding: '16px 20px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      },
        React.createElement('h3', {
          style: { 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#1F2937' 
          }
        }, `🔔 Notifications (${notifications.length})`),
        React.createElement('button', {
          onClick: () => setNotifications(prev => prev.map(n => ({...n, read: true}))),
          style: {
            background: 'none',
            border: 'none',
            fontSize: '11px',
            color: '#6B7280',
            cursor: 'pointer',
            textDecoration: 'underline'
          }
        }, 'Tout marquer lu')
      ),
      React.createElement('div', {
        style: { 
          padding: '12px',
          overflowY: 'auto',
          maxHeight: '400px'
        }
      }, notifications.map((notification) =>
        React.createElement('div', {
          key: notification.id,
          style: {
            padding: '12px',
            margin: '6px 0',
            background: notification.read ? '#F9FAFB' : '#FEF3C7',
            borderRadius: '10px',
            border: '1px solid ' + (notification.read ? '#E5E7EB' : '#F59E0B'),
            position: 'relative'
          }
        },
          !notification.read && React.createElement('div', {
            style: {
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '6px',
              height: '6px',
              background: '#EF4444',
              borderRadius: '50%'
            }
          }),
          React.createElement('div', {
            style: { 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px'
            }
          },
            React.createElement('span', { style: { fontSize: '16px' } }, notification.icon),
            React.createElement('div', {
              style: { 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#1F2937'
              }
            }, notification.title)
          ),
          React.createElement('div', {
            style: { 
              fontSize: '11px', 
              color: '#6B7280',
              marginBottom: '6px',
              lineHeight: '1.4'
            }
          }, notification.description),
          React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              color: '#9CA3AF'
            }
          },
            React.createElement('span', null, `📍 ${notification.location}`),
            React.createElement('span', null, `⏱️ +${notification.delay}min`),
            React.createElement('span', null, new Date(notification.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
          )
        )
      ))
    );
  };

  return React.createElement('div', {
    style: { 
      position: 'relative', 
      height: '100vh', 
      width: '100%', 
      overflow: 'hidden',
      background: '#F3F4F6'
    }
  },
    React.createElement('div', {
      id: 'map-container',
      ref: mapRef,
      style: {
        height: '100%',
        width: '100%',
        minHeight: '400px'
      }
    }),
    
    React.createElement(ControlPanel),
    React.createElement(NotificationPanel),
    
    trucks.length === 0 && React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.9)',
        zIndex: 999
      }
    }, React.createElement('div', {
      style: { textAlign: 'center' }
    },
      React.createElement('div', {
        style: {
          width: '48px',
          height: '48px',
          border: '4px solid #E5E7EB',
          borderTop: '4px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }
      }),
      React.createElement('p', {
        style: { 
          color: '#6B7280', 
          fontSize: '16px', 
          fontWeight: '500' 
        }
      }, 'Chargement des données des camions...')
    )),
    
    React.createElement('style', null, `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
    `)
  );
};

export default MapCanvas;
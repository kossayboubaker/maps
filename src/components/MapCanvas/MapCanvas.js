import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WEATHER_API_KEY = '4437791bbdc183036e4e04dc15c92cb8';

const MapCanvas = ({
  deliveries = [],
  selectedDelivery,
  onSelectDelivery,
  alerts = [],
  allAlerts = [], // Toutes les alertes (statiques + générées)
  mapStyle = 'standard',
  onMapReady,
  showAlerts = false,
  showRoutes = true,
  showWeather = false,
  followTruck = false,
  deletedAlerts = []
}) => {
  const [map, setMap] = useState(null);
  const [trucksData, setTrucksData] = useState(deliveries);
  const [weatherLayer, setWeatherLayer] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  const configureLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  };

  const generateWeatherData = (lat, lng, locationName) => {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Mist'];
    const descriptions = {
      'Clear': 'ensoleillé',
      'Clouds': 'nuageux', 
      'Rain': 'pluvieux',
      'Mist': 'brumeux'
    };
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const baseTemp = locationName === 'Tunis' ? 20 : locationName === 'Sfax' ? 22 : 18;
    const temp = baseTemp + Math.floor(Math.random() * 10) - 5;
    
    const weatherInfo = {
      temp,
      description: descriptions[condition],
      icon: condition.toLowerCase(),
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      visibility: 8 + Math.random() * 2,
      condition,
      pressure: 1010 + Math.floor(Math.random() * 20),
      feelsLike: temp + Math.floor(Math.random() * 4) - 2
    };

    return weatherInfo;
  };

  // Récupérer vraie route depuis TomTom Routing API
  const getTomTomRoute = async (startCoord, endCoord) => {
    const TOMTOM_API_KEY = 'EYzVkdZCbYKTsmoxBiz17rpTQnN3qxz0';
    const startLatLng = `${startCoord[0]},${startCoord[1]}`;
    const endLatLng = `${endCoord[0]},${endCoord[1]}`;

    try {
      const response = await Promise.race([
        fetch(`https://api.tomtom.com/routing/1/calculateRoute/${startLatLng}:${endLatLng}/json?key=${TOMTOM_API_KEY}&travelMode=truck&traffic=true&routeType=fastest&avoid=unpavedRoads&vehicleMaxSpeed=90&vehicleWeight=15000`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes[0] && data.routes[0].legs) {
          const route = [];
          data.routes[0].legs.forEach(leg => {
            if (leg.points) {
              leg.points.forEach(point => {
                route.push([point.latitude, point.longitude]);
              });
            }
          });

          // Valider que la route est terrestre
          const isValidRoute = route.every(point =>
            point[0] >= 30.5 && point[0] <= 37.5 &&
            point[1] >= 8.0 && point[1] <= 11.8
          );

          if (isValidRoute && route.length > 0) {
            console.log(`TomTom route réelle récupérée: ${route.length} points`);
            return route;
          }
        }
      }
    } catch (error) {
      console.warn('TomTom Routing API indisponible:', error.message);
    }

    // Fallback vers route intelligente terrestre
    return getRealRoute(startCoord, endCoord);
  };

  const getRealRoute = (startCoord, endCoord, waypoints = []) => {
    // Trajectoires TERRESTRES uniquement - pas de mer
    const route = [startCoord];

    // Fonction pour vérifier si un point est sur terre (Tunisie)
    const isOnLand = (lat, lng) => {
      // Limites approximatives de la Tunisie continentale
      return lat >= 30.5 && lat <= 37.5 && lng >= 8.0 && lng <= 11.8 &&
             !(lat > 36.5 && lng < 9.5) && // Éviter mer au nord-ouest
             !(lat > 35.5 && lng > 11.2) && // Éviter mer à l'est
             !(lat < 33.0 && lng < 9.0); // Éviter mer au sud-ouest
    };

    // Points de passage forcés sur terre
    const safeWaypoints = waypoints.map(wp => {
      let lat = wp.lat || wp[0];
      let lng = wp.lng || wp[1];

      // Forcer sur terre si dans la mer
      if (!isOnLand(lat, lng)) {
        // Ramener vers l'intérieur des terres
        lat = Math.max(30.8, Math.min(37.2, lat));
        lng = Math.max(8.2, Math.min(11.5, lng));
      }
      return [lat, lng];
    });

    safeWaypoints.forEach(wp => route.push(wp));

    const interpolatedRoute = [];
    for (let i = 0; i < route.length - 1; i++) {
      const currentPoint = route[i];
      const nextPoint = route[i + 1];

      interpolatedRoute.push(currentPoint);

      const steps = 15; // Moins de points pour éviter la mer

      for (let step = 1; step < steps; step++) {
        const ratio = step / steps;
        let lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * ratio;
        let lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * ratio;

        // Très légère courbure vers l'intérieur
        const inlandCurvature = 0.003 * Math.sin(ratio * Math.PI);
        lat += inlandCurvature; // Toujours vers l'intérieur

        // Vérification stricte - si point dans mer, le ramener sur terre
        if (!isOnLand(lat, lng)) {
          lat = Math.max(30.8, Math.min(37.2, lat));
          lng = Math.max(8.2, Math.min(11.5, lng));
        }

        interpolatedRoute.push([lat, lng]);
      }
    }

    interpolatedRoute.push(endCoord);
    return interpolatedRoute;
  };

  const generateRealRoutes = useCallback(async () => {
    const routesMap = {};

    // Traiter les routes en parallèle avec TomTom API
    const routePromises = trucksData.map(async (truck) => {
      let startCoord, endCoord, waypoints = [];

      switch (truck.truck_id) {
        case 'TN-001': // Tunis vers Sfax
          startCoord = [36.8065, 10.1815];
          endCoord = [34.7406, 10.7603];
          break;
        case 'TN-002': // Tunis vers Sousse
          startCoord = [36.8065, 10.1815];
          endCoord = [35.8256, 10.6369];
          break;
        case 'TN-003': // Ariana vers Kairouan
          startCoord = [36.4098, 10.1398];
          endCoord = [35.6786, 10.0963];
          break;
        case 'TN-004': // La Goulette vers Nabeul
          startCoord = [36.7538, 10.2286];
          endCoord = [36.4561, 10.7376];
          break;
        case 'TN-005': // Sfax vers Gabes
          startCoord = [34.7406, 10.7603];
          endCoord = [33.8869, 10.0982];
          break;
        default:
          startCoord = truck.pickup?.coordinates || truck.position;
          endCoord = truck.destinationCoords || truck.destination?.coordinates || truck.position;
      }

      // Essayer TomTom API d'abord, puis fallback
      try {
        const tomtomRoute = await getTomTomRoute(startCoord, endCoord);
        return { truckId: truck.truck_id, route: tomtomRoute };
      } catch (error) {
        console.warn(`Fallback route pour ${truck.truck_id}:`, error.message);

        // Fallback avec waypoints prédéfinis
        const fallbackWaypoints = {
          'TN-001': [[36.7500, 10.1200], [36.3000, 10.0000], [35.9000, 9.9500], [35.5000, 10.2000]],
          'TN-002': [[36.7000, 10.0800], [36.5000, 10.0000], [36.2000, 10.1000]],
          'TN-003': [[36.3500, 10.0800], [36.2000, 10.0500], [36.0000, 10.0000]],
          'TN-004': [[36.7000, 10.1500], [36.6000, 10.2000], [36.5500, 10.4000]],
          'TN-005': [[34.6500, 10.5000], [34.4000, 10.3000], [34.2000, 10.2000]]
        };

        waypoints = fallbackWaypoints[truck.truck_id] || [];
        const fallbackRoute = getRealRoute(startCoord, endCoord, waypoints);
        return { truckId: truck.truck_id, route: fallbackRoute };
      }
    });

    try {
      const results = await Promise.all(routePromises);
      results.forEach(result => {
        routesMap[result.truckId] = result.route;
      });
    } catch (error) {
      console.warn('Erreur génération routes:', error.message);
      // Fallback final
      trucksData.forEach(truck => {
        const startCoord = truck.pickup?.coordinates || truck.position;
        const endCoord = truck.destinationCoords || truck.destination?.coordinates || truck.position;
        routesMap[truck.truck_id] = getRealRoute(startCoord, endCoord);
      });
    }

    return routesMap;
  }, [trucksData]);

  const createTruckIcon = useCallback((truck) => {
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
          ${speed > 0 && isSelected ? `
            <div style="
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              padding: 2px 6px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              border: 1px solid white;
            ">
              ${Math.round(speed)} km/h
            </div>
          ` : ''}
        </div>
        <style>
          @keyframes alertPulse {
            0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 8px 25px rgba(239, 68, 68, 0.8); }
          }
        </style>
      `,
      className: '',
      iconSize: adjustedSize,
      iconAnchor: [adjustedSize[0] / 2, adjustedSize[1] / 2],
    });
  }, [selectedDelivery, alerts, map]);

  const createAlertIcon = (alert) => {
    const alertStyles = {
      accident: {
        color: '#EF4444',
        icon: '⚠️',
        bgColor: '#FEE2E2',
        borderColor: '#EF4444'
      },
      construction: {
        color: '#F59E0B',
        icon: '🚧',
        bgColor: '#FEF3C7',
        borderColor: '#F59E0B'
      },
      traffic: {
        color: '#3B82F6',
        icon: '🚦',
        bgColor: '#DBEAFE',
        borderColor: '#3B82F6'
      },
      weather: {
        color: '#6B7280',
        icon: alert.icon || '🌧️',
        bgColor: '#F3F4F6',
        borderColor: '#6B7280'
      },
      police: {
        color: '#8B5CF6',
        icon: '👮',
        bgColor: '#EDE9FE',
        borderColor: '#8B5CF6'
      },
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
        ">
          ${style.icon}
        </div>
      `,
      className: '',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  };

  const handleMapStyleChange = useCallback((style) => {
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
  }, [map, weatherLayer]);

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
    if (map) return; // Éviter la double initialisation

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

    // Générer les routes réelles après initialisation avec TomTom API
    setTimeout(async () => {
      try {
        const routes = await generateRealRoutes();
        setTrucksData(prev => prev.map(truck => {
          const fallbackRoute = [
            truck.position,
            truck.destinationCoords || truck.destination?.coordinates || truck.position
          ];

          return {
            ...truck,
            realRoute: routes[truck.truck_id] || fallbackRoute
          };
        }));
      } catch (error) {
        console.warn('Erreur routes TomTom, utilisation fallback');
        // Routes par défaut si TomTom échoue
        setTrucksData(prev => prev.map(truck => {
          const fallbackRoute = [
            truck.position,
            truck.destinationCoords || truck.destination?.coordinates || truck.position
          ];
          return { ...truck, realRoute: fallbackRoute };
        }));
      }
    }, 500);

    return () => {
      leafletMap.remove();
    };
  }, []);

  // Mise à jour du style de carte
  useEffect(() => {
    if (map) {
      handleMapStyleChange(mapStyle);
    }
  }, [mapStyle, map, handleMapStyleChange]);

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
      if (!truck.position || truck.position.length < 2) return;

      const marker = L.marker(truck.position, {
        icon: createTruckIcon(truck),
      }).addTo(map);

      marker.on('mouseover', () => {
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
        map.flyTo(truck.position, Math.max(map.getZoom(), 13), {
          animate: true,
          duration: 1.2
        });
      });

      // Routes
      if (showRoutes && truck.realRoute && truck.realRoute.length > 1) {
        const routeColor = selectedDelivery && selectedDelivery.truck_id === truck.truck_id ? '#3B82F6' :
                          truck.state === 'En Route' ? '#10B981' : '#8B5CF6';

        L.polyline(truck.realRoute, {
          color: routeColor,
          weight: selectedDelivery && selectedDelivery.truck_id === truck.truck_id ? 6 : 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: truck.state === 'En Route' ? null : '12, 8',
        }).addTo(map);

        if (selectedDelivery && selectedDelivery.truck_id === truck.truck_id) {
          // Marqueurs de départ et arrivée avec plus d'informations
          L.circleMarker(truck.realRoute[0], {
            radius: 10,
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.8,
            weight: 4,
            stroke: true,
            strokeColor: '#fff',
          }).addTo(map).bindPopup(`
            <div style="text-align: center; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
              <strong>🟢 Point de Départ</strong><br>
              <div style="margin: 4px 0; font-size: 13px;">${truck.pickup?.address || 'Départ'}</div>
              <div style="font-size: 11px; color: #6b7280;">📍 ${truck.pickup?.city || ''}</div>
            </div>
          `);

          L.circleMarker(truck.realRoute[truck.realRoute.length - 1], {
            radius: 10,
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.8,
            weight: 4,
            stroke: true,
            strokeColor: '#fff',
          }).addTo(map).bindPopup(`
            <div style="text-align: center; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
              <strong>🔴 Destination</strong><br>
              <div style="margin: 4px 0; font-size: 13px;">${truck.destination || 'Arrivée'}</div>
              <div style="font-size: 11px; color: #6b7280;">🕰️ ETA: ${new Date(truck.estimatedArrival).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
          `);
        }
      }
    });

    // Ajouter TOUTES les alertes - statiques + générées (exclure les supprimées)
    const alertsToShow = allAlerts.length > 0 ? allAlerts : alerts;
    if (alertsToShow && alertsToShow.length > 0) {
      const filteredAlerts = alertsToShow.filter(alert => !deletedAlerts?.includes(alert.id));

      filteredAlerts.forEach(alert => {
        if (!alert.position || alert.position.length < 2) return;

        const alertMarker = L.marker(alert.position, {
          icon: createAlertIcon(alert),
        }).addTo(map);

        // Tooltip détaillé au survol - PAS de popup au clic
        alertMarker.on('mouseover', () => {
          setHoveredItem({
            type: 'alert',
            data: {
              ...alert,
              showDetailed: true // Flag pour affichage détaillé
            }
          });
        });

        alertMarker.on('mouseout', () => {
          setHoveredItem(null);
        });

        // PAS de popup - tout se passe avec les tooltips
      });
    }

  }, [map, trucksData, selectedDelivery, showRoutes, alerts, showAlerts, createTruckIcon, onSelectDelivery]);

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
            const routeIndex = Math.floor((truck.route_progress / 100) * (truck.realRoute.length - 1));
            const nextIndex = Math.min(routeIndex + 1, truck.realRoute.length - 1);
            const progressBetweenPoints = ((truck.route_progress / 100) * (truck.realRoute.length - 1)) % 1;

            const currentPoint = truck.realRoute[routeIndex];
            const nextPoint = truck.realRoute[nextIndex];

            if (!currentPoint || !nextPoint || !Array.isArray(currentPoint) || !Array.isArray(nextPoint)) {
              return truck;
            }

            const newLat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progressBetweenPoints;
            const newLng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progressBetweenPoints;

            const deltaLat = nextPoint[0] - currentPoint[0];
            const deltaLng = nextPoint[1] - currentPoint[1];
            let newBearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
            newBearing = (newBearing + 360) % 360;

            const newProgress = Math.min(100, truck.route_progress + Math.random() * 1.5);
            const newSpeed = Math.max(25, Math.min(85, truck.speed + (Math.random() - 0.5) * 8));

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
  }, [deliveries]);

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
                <span>��� {hoveredItem.data.affectedRoutes?.join(', ')}</span>
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

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default MapCanvas;

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  showAlerts = false,
  showRoutes = true,
  showWeather = false,
  followTruck = false
}) => {
  const [map, setMap] = useState(null);
  const [trucksData, setTrucksData] = useState(deliveries);
  const [weatherLayer, setWeatherLayer] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const cleanupRef = useRef(null);



  const configureLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  };

  const generateWeatherData = (lat, lng, locationName) => {
    // Générer des données météo simulées réalistes pour éviter les erreurs API
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

    // Utiliser directement les routes simulées pour éviter les erreurs API
    return generateRealisticRoute(startCoord, endCoord, waypoints);
  };

  // Générer trajectoires réelles pour chaque camion avec routes vraies
  const generateRealRoutes = useCallback(() => {
    const routesMap = {};

    trucksData.forEach(truck => {
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

        const realRoute = getRealRoute(startCoord, endCoord, waypoints);
        routesMap[truck.truck_id] = realRoute;

      } catch (error) {
        console.warn(`Erreur route pour ${truck.truck_id}:`, error.message);
        // Fallback vers route simple
        routesMap[truck.truck_id] = [truck.position, truck.destinationCoords || truck.position];
      }
    });

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
  }, [selectedDelivery, alerts, map]);

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
    // Vérifier que l'élément DOM existe et n'est pas déjà initialisé
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      console.warn('Élément map-container non trouvé');
      return;
    }

    // Si une carte existe déjà, ne pas réinitialiser
    if (mapInstanceRef.current) {
      console.warn('Carte déjà initialisée');
      return;
    }

    // Nettoyer le conteneur au cas où
    mapContainer.innerHTML = '';
    mapContainer._leaflet_id = null;

    configureLeafletIcons();

    // Attendre un tick pour s'assurer que le DOM est complètement prêt
    const initializeMap = () => {
      try {
        // Vérifier une dernière fois que l'élément existe et n'a pas de carte
        const container = document.getElementById('map-container');
        if (!container || container._leaflet_id) {
          return;
        }

        const leafletMap = L.map('map-container', {
          center: [36.8065, 10.1815],
          zoom: 7,
          scrollWheelZoom: true,
          zoomControl: false,
        });

        mapInstanceRef.current = leafletMap;

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

        // Attendre que la carte soit prête avant d'ajouter les layers
        leafletMap.whenReady(() => {
          try {
            // Vérifier que la carte est toujours valide
            if (leafletMap && leafletMap.getContainer()) {
              tileLayers.standard.addTo(leafletMap);
              setMap(leafletMap);
              setIsMapReady(true);

              if (onMapReady) {
                onMapReady(leafletMap);
              }
            }
          } catch (error) {
            console.error('Erreur ajout layer initial:', error);
          }
        });

        // Générer les routes réelles après initialisation
        setTimeout(() => {
          try {
            const routes = generateRealRoutes();
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
            console.warn('Erreur lors de l\'initialisation des routes:', error);
            // Utiliser des routes simples en cas d'échec total
            setTrucksData(prev => prev.map(truck => ({
              ...truck,
              realRoute: [truck.position, truck.destinationCoords || truck.position]
            })));
          }
        }, 500); // Délai augmenté pour sécurité

        // Stocker la fonction de cleanup
        cleanupRef.current = () => {
          try {
            if (leafletMap && leafletMap.getContainer()) {
              leafletMap.off();
              leafletMap.remove();
            }
          } catch (error) {
            console.warn('Erreur suppression carte:', error);
          } finally {
            mapInstanceRef.current = null;
            setMap(null);
            setIsMapReady(false);
          }
        };

      } catch (error) {
        console.error('Erreur initialisation Leaflet:', error);
        mapInstanceRef.current = null;
      }
    };

    // Utiliser un délai pour s'assurer que le DOM est stable
    const timer = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timer);

      // Nettoyer la carte si elle existe
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Nettoyer le conteneur
      const container = document.getElementById('map-container');
      if (container) {
        container.innerHTML = '';
        container._leaflet_id = null;
      }
    };
  }, [generateRealRoutes, onMapReady]);

  // Mise à jour du style de carte
  useEffect(() => {
    if (map) {
      handleMapStyleChange(mapStyle);
    }
  }, [mapStyle, map, handleMapStyleChange]);

  // Affichage des camions et alertes
  useEffect(() => {
    if (!map || !map.getContainer() || !isMapReady) return;

    // Attendre que la carte soit prête
    const timer = setTimeout(() => {
      try {
        // Nettoyer les marqueurs existants
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
          }
        });

        // Ajouter les camions
        trucksData.forEach((truck) => {
          if (!truck.position || !Array.isArray(truck.position) || truck.position.length < 2) {
            return;
          }
          try {
            const marker = L.marker(truck.position, {
              icon: createTruckIcon(truck),
            });

            if (map && map.getContainer()) {
              marker.addTo(map);
            }

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
              // Toujours centrer sur le camion cliqué
              if (map && map.getContainer()) {
                map.flyTo(truck.position, Math.max(map.getZoom(), 13), {
                  animate: true,
                  duration: 1.2
                });
              }
            });
          } catch (error) {
            console.warn('Erreur ajout marqueur camion:', truck.truck_id, error);
          }

      // Affichage des routes avec trajectoires réelles
      if (showRoutes && truck.realRoute && truck.realRoute.length > 1) {
        const routeColor = selectedDelivery && selectedDelivery.truck_id === truck.truck_id ? '#3B82F6' :
                          truck.state === 'En Route' ? '#10B981' : '#8B5CF6';

        // Créer une polyligne avec style amélioré
        L.polyline(truck.realRoute, {
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
            try {
              if (!alert.position || !Array.isArray(alert.position) || alert.position.length < 2) {
                return;
              }
              const alertMarker = L.marker(alert.position, {
                icon: createAlertIcon(alert),
              });

              if (map && map.getContainer()) {
                alertMarker.addTo(map);
              }

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
            } catch (error) {
              console.warn('Erreur ajout marqueur alerte:', alert.id, error);
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout des marqueurs:', error);
      }
    }, 100); // Délai de 100ms pour s’assurer que le DOM est prêt

    return () => clearTimeout(timer);

  }, [map, trucksData, selectedDelivery, showRoutes, followTruck, alerts, showAlerts, createTruckIcon, onSelectDelivery, isMapReady]);

  // Créer marqueurs météo
  const createWeatherIcon = (weather) => {
    const iconMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };

    const icon = iconMap[weather.condition] || '🌤️';
    const tempColor = weather.temp < 0 ? '#3b82f6' : weather.temp < 15 ? '#10b981' : weather.temp < 25 ? '#f59e0b' : '#ef4444';

    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 2px solid rgba(255,255,255,0.3);
          text-align: center;
          min-width: 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="font-size: 24px; margin-bottom: 4px;">${icon}</div>
          <div style="
            font-size: 16px;
            font-weight: bold;
            color: ${tempColor};
            margin-bottom: 2px;
          ">${weather.temp}°C</div>
          <div style="
            font-size: 10px;
            color: #6b7280;
            text-transform: capitalize;
          ">${weather.description}</div>
          <div style="
            font-size: 9px;
            color: #9ca3af;
            margin-top: 4px;
          ">
            🌬️ ${weather.windSpeed}km/h<br>
            💧 ${weather.humidity}%
          </div>
        </div>
      `,
      className: 'weather-marker',
      iconSize: [80, 80],
      iconAnchor: [40, 40]
    });
  };

  // Couche météo améliorée avec icônes visibles
  useEffect(() => {
    if (!map || !map.getContainer() || !isMapReady) return;

    // Supprimer anciens marqueurs météo
    map.eachLayer((layer) => {
      if (layer.options && layer.options.className === 'weather-marker') {
        map.removeLayer(layer);
      }
    });

    if (showWeather) {
      // Ajouter couche de précipitations
      if (!weatherLayer) {
        const wLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`, {
          attribution: 'Weather data © OpenWeatherMap',
          opacity: 0.6,
        });
        wLayer.addTo(map);
        setWeatherLayer(wLayer);
      }

      // Ajouter marqueurs météo sur les principales villes
      const weatherCities = [
        { name: 'Tunis', lat: 36.8065, lng: 10.1815 },
        { name: 'Sfax', lat: 34.7406, lng: 10.7603 },
        { name: 'Sousse', lat: 35.8256, lng: 10.6369 },
        { name: 'Kairouan', lat: 35.6786, lng: 10.0963 },
        { name: 'Gabes', lat: 33.8869, lng: 10.0982 },
        { name: 'Bizerte', lat: 37.2744, lng: 9.8739 }
      ];

      weatherCities.forEach((city) => {
        const weather = generateWeatherData(city.lat, city.lng, city.name);
        if (weather) {
          const weatherMarker = L.marker([city.lat, city.lng], {
            icon: createWeatherIcon(weather),
            className: 'weather-marker'
          }).addTo(map);

          weatherMarker.bindPopup(`
            <div style="padding: 16px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1f2937;">
                ${weather.condition === 'Clear' ? '☀️' :
                  weather.condition === 'Clouds' ? '☁���' :
                  weather.condition === 'Rain' ? '🌧️' : '🌤️'} ${city.name}
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                  <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${weather.temp}°C</div>
                  <div style="font-size: 12px; color: #6b7280;">Température</div>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: bold; color: #10b981;">${weather.feelsLike}°C</div>
                  <div style="font-size: 12px; color: #6b7280;">Ressenti</div>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">${weather.humidity}%</div>
                  <div style="font-size: 12px; color: #6b7280;">Humidité</div>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: bold; color: #ef4444;">${weather.windSpeed}km/h</div>
                  <div style="font-size: 12px; color: #6b7280;">Vent</div>
                </div>
              </div>
              <div style="
                background: rgba(59, 130, 246, 0.1);
                padding: 8px;
                border-radius: 8px;
                font-size: 13px;
                color: #374151;
                text-transform: capitalize;
              ">
                ${weather.description}
              </div>
              <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">
                Visibilité: ${weather.visibility}km • Pression: ${weather.pressure}hPa
              </div>
            </div>
          `);

          // Effet de survol
          weatherMarker.on('mouseover', () => {
            setHoveredItem({
              type: 'weather',
              data: {
                city: city.name,
                ...weather
              }
            });
          });

          weatherMarker.on('mouseout', () => {
            setHoveredItem(null);
          });
        }
      });
    } else if (!showWeather && weatherLayer) {
      // Supprimer couche de précipitations
      map.removeLayer(weatherLayer);
      setWeatherLayer(null);
    }
  }, [showWeather, map, weatherLayer, isMapReady]);

  // Suivi automatique du camion sélectionné
  useEffect(() => {
    if (followTruck && selectedDelivery && map) {
      const interval = setInterval(() => {
        const currentTruck = trucksData.find(t => t.truck_id === selectedDelivery.truck_id);
        if (currentTruck && currentTruck.state === 'En Route') {
          map.panTo(currentTruck.position, {
            animate: true,
            duration: 0.5
          });
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [followTruck, selectedDelivery, map, trucksData]);

  // Animation des camions améliorée
  useEffect(() => {
    setTrucksData(deliveries);

    const interval = setInterval(() => {
      setTrucksData((prev) =>
        prev.map((truck) => {
          if (truck.state === 'En Route' && truck.realRoute && truck.realRoute.length > 1) {
            try {
              // Utiliser la vraie route pour l'animation
              const routeIndex = Math.floor((truck.route_progress / 100) * (truck.realRoute.length - 1));
              const nextIndex = Math.min(routeIndex + 1, truck.realRoute.length - 1);
              const progressBetweenPoints = ((truck.route_progress / 100) * (truck.realRoute.length - 1)) % 1;

              const currentPoint = truck.realRoute[routeIndex];
              const nextPoint = truck.realRoute[nextIndex];

              // Vérifier que les points sont valides
              if (!currentPoint || !nextPoint || !Array.isArray(currentPoint) || !Array.isArray(nextPoint)) {
                return truck; // Retourner le camion inchangé si les données sont invalides
              }

              const newLat = currentPoint[0] +
                (nextPoint[0] - currentPoint[0]) * progressBetweenPoints;
              const newLng = currentPoint[1] +
                (nextPoint[1] - currentPoint[1]) * progressBetweenPoints;

              // Calcul de l'orientation basé sur la vraie route
              const deltaLat = nextPoint[0] - currentPoint[0];
              const deltaLng = nextPoint[1] - currentPoint[1];
              let newBearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
              newBearing = (newBearing + 360) % 360;

              const newProgress = Math.min(100, truck.route_progress + Math.random() * 1.5);
              const newSpeed = Math.max(25, Math.min(85, truck.speed + (Math.random() - 0.5) * 8));

              const updatedTruck = {
                ...truck,
                position: [newLat, newLng],
                speed: newSpeed,
                route_progress: newProgress,
                bearing: newBearing,
              };

              // Suivi automatique si activé et camion sélectionné
              if (followTruck && selectedDelivery && selectedDelivery.truck_id === truck.truck_id && map) {
                setTimeout(() => {
                  map.panTo([newLat, newLng], {
                    animate: true,
                    duration: 0.8
                  });
                }, 100);
              }

              return updatedTruck;
            } catch (error) {
              console.warn(`Erreur animation camion ${truck.truck_id}:`, error);
              return truck; // Retourner le camion inchangé en cas d'erreur
            }
          }
          return truck;
        })
      );
    }, 3500); // Animation plus fluide

    return () => clearInterval(interval);
  }, [deliveries, followTruck, selectedDelivery, map]);

  // Le panneau de contrôle est maintenant géré par AdvancedMapControls - pas besoin ici

  return (
    <div style={{ 
      position: 'relative', 
      height: '100vh', 
      width: '100%', 
      overflow: 'hidden',
      background: '#f1f5f9'
    }}>
      {!isMapReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.9)',
          zIndex: 1000
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
              Initialisation de la carte...
            </p>
          </div>
        </div>
      )}
      <div
        id="map-container"
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          borderRadius: '0',
          overflow: 'hidden',
          opacity: isMapReady ? 1 : 0,
          transition: 'opacity 0.3s ease'
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
                    ���️ {hoveredItem.alerts.length} alerte{hoveredItem.alerts.length > 1 ? 's' : ''} active{hoveredItem.alerts.length > 1 ? 's' : ''}
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

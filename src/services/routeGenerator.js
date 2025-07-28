// Générateur de routes avec trajectoires réalistes suivant les vraies routes tunisiennes
class RouteGenerator {
  constructor() {
    // Routes prédéfinies pour la Tunisie (trajectoires réalistes suivant les routes terrestres)
    this.predefinedRoutes = {
      'TN-001': {
        // Tunis vers Sfax (Autoroute A1 - Route terrestre réelle)
        startPoint: [36.8065, 10.1815],
        endPoint: [34.7406, 10.7603],
        color: '#1e90ff', // Bleu pour trajets actifs
        status: 'active',
        waypoints: [
          [36.8065, 10.1815], // Tunis départ
          [36.7500, 10.1200], // Sortie Tunis vers A1
          [36.6500, 10.0800], // Manouba
          [36.5500, 10.0500], // Mohammedia
          [36.4000, 10.0200], // Enfidha (A1)
          [36.2000, 9.9800],  // Sud d'Enfidha
          [35.9000, 9.9500],  // Vers Kairouan
          [35.6000, 10.0000], // Kairouan région
          [35.3000, 10.2000], // Approche Sfax par l'ouest
          [35.0000, 10.4000], // Périphérie ouest Sfax
          [34.7406, 10.7603]  // Sfax centre (côte)
        ]
      },
      'TN-002': {
        // Tunis vers Sousse (Route terrestre A1 puis côtière)
        startPoint: [36.8065, 10.1815],
        endPoint: [35.8256, 10.6369],
        color: '#22c55e', // Vert pour trajets terminés
        status: 'completed',
        waypoints: [
          [36.8065, 10.1815], // Tunis
          [36.7500, 10.1200], // Sortie Tunis
          [36.6500, 10.0800], // Manouba
          [36.5000, 10.0500], // Vers Mohammedia
          [36.3500, 10.1000], // Bou Argoub
          [36.2000, 10.2000], // Vers Grombalia
          [36.1000, 10.3500], // Grombalia
          [36.0000, 10.4500], // Nabeul région
          [35.9000, 10.5500], // Hammamet
          [35.8256, 10.6369]  // Sousse
        ]
      },
      'TN-003': {
        // Ariana vers Kairouan (Route intérieure P5 puis P12)
        startPoint: [36.4098, 10.1398],
        endPoint: [35.6786, 10.0963],
        color: '#1e90ff',
        status: 'active',
        waypoints: [
          [36.4098, 10.1398], // Ariana
          [36.3500, 10.1000], // Sud Ariana
          [36.2500, 10.0500], // Mornaguia
          [36.1500, 10.0000], // Vers Zaghouan
          [36.0500, 9.9500],  // Zaghouan région
          [35.9500, 9.9800],  // Sud Zaghouan
          [35.8500, 10.0300], // Vers Kairouan
          [35.7500, 10.0600], // Approche Kairouan
          [35.6786, 10.0963]  // Kairouan centre
        ]
      },
      'TN-004': {
        // La Goulette vers Nabeul (Route côtière puis P1)
        startPoint: [36.7538, 10.2286],
        endPoint: [36.4561, 10.7376],
        color: '#1e90ff',
        status: 'active',
        waypoints: [
          [36.7538, 10.2286], // La Goulette
          [36.7200, 10.2500], // Vers Carthage
          [36.6800, 10.3000], // Sidi Bou Saïd
          [36.6500, 10.3500], // La Marsa
          [36.6000, 10.4000], // Gammarth
          [36.5500, 10.4500], // Côte vers Soliman
          [36.5000, 10.5500], // Soliman
          [36.4800, 10.6500], // Approche Nabeul
          [36.4561, 10.7376]  // Nabeul
        ]
      },
      'TN-005': {
        // Sfax vers Gabès (Route GP1 terrestre)
        startPoint: [34.7406, 10.7603],
        endPoint: [33.8869, 10.0982],
        color: '#f59e0b', // Orange pour maintenance
        status: 'maintenance',
        waypoints: [
          [34.7406, 10.7603], // Sfax
          [34.6500, 10.6500], // Sortie sud Sfax
          [34.5000, 10.5000], // Route vers l'intérieur
          [34.3500, 10.3500], // Mahrès région
          [34.2000, 10.2000], // Vers El Hencha
          [34.0500, 10.1500], // El Hencha
          [33.9500, 10.1200], // Approche Gabès
          [33.8869, 10.0982]  // Gabès centre
        ]
      }
    };
  }

  // Générer route avec animation progressive
  generateRouteWithProgress(truckId, progress = 0) {
    const routeData = this.predefinedRoutes[truckId];
    if (!routeData) {
      console.warn(`⚠️ Route non trouvée pour ${truckId}`);
      return null;
    }

    const waypoints = routeData.waypoints;
    const totalPoints = waypoints.length;
    
    // Calculer position actuelle selon progression
    const progressIndex = Math.floor((progress / 100) * (totalPoints - 1));
    const nextIndex = Math.min(progressIndex + 1, totalPoints - 1);
    
    // Interpolation entre deux points
    const progressBetween = ((progress / 100) * (totalPoints - 1)) % 1;
    const currentPoint = waypoints[progressIndex];
    const nextPoint = waypoints[nextIndex];
    
    let currentPosition;
    if (progressBetween === 0 || progressIndex === nextIndex) {
      currentPosition = currentPoint;
    } else {
      currentPosition = [
        currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progressBetween,
        currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progressBetween
      ];
    }

    return {
      fullRoute: waypoints,
      currentPosition: currentPosition,
      completedRoute: waypoints.slice(0, progressIndex + 1),
      remainingRoute: waypoints.slice(progressIndex),
      color: routeData.color,
      status: routeData.status,
      progress: progress
    };
  }

  // Générer toutes les routes avec couleurs appropriées
  generateAllRoutes(trucks) {
    const routes = {};
    
    trucks.forEach(truck => {
      const routeInfo = this.generateRouteWithProgress(
        truck.truck_id, 
        truck.route_progress || 0
      );
      
      if (routeInfo) {
        // Déterminer couleur selon état
        let routeColor = routeInfo.color;
        if (truck.state === 'En Route') {
          routeColor = '#1e90ff'; // Bleu pour actifs
        } else if (truck.state === 'At Destination') {
          routeColor = '#22c55e'; // Vert pour terminés
        } else if (truck.state === 'Maintenance') {
          routeColor = '#f59e0b'; // Orange pour maintenance
        }
        
        routes[truck.truck_id] = {
          ...routeInfo,
          color: routeColor,
          truck: truck
        };
      }
    });
    
    return routes;
  }

  // Créer ligne de route avec style selon état (SANS ANIMATIONS)
  createRoutePolyline(routeInfo, isSelected = false) {
    if (!routeInfo || !routeInfo.fullRoute) return null;

    const baseWeight = isSelected ? 6 : 4;
    const opacity = routeInfo.status === 'completed' ? 0.7 : 0.9;
    
    // Style selon état (STATIQUE - SANS ANIMATIONS)
    const lineStyle = {
      color: routeInfo.color,
      weight: baseWeight,
      opacity: opacity,
      lineCap: 'round',
      lineJoin: 'round'
    };
    
    // Ligne discontinue pour trajets terminés
    if (routeInfo.status === 'completed') {
      lineStyle.dashArray = '12, 8';
    }
    
    // Style statique pour tous les trajets (PLUS D'ANIMATION)
    if (routeInfo.status === 'active' && isSelected) {
      lineStyle.weight = baseWeight + 1;
    }

    return lineStyle;
  }

  // Points d'étapes avec informations
  createRouteMarkers(routeInfo) {
    if (!routeInfo || !routeInfo.fullRoute) return [];

    const markers = [];
    const waypoints = routeInfo.fullRoute;
    
    // Marqueur de départ
    markers.push({
      position: waypoints[0],
      type: 'start',
      icon: '🟢',
      popup: `<div style="text-align: center; font-family: sans-serif;">
        <strong>🟢 Point de Départ</strong><br>
        <span style="font-size: 12px;">${routeInfo.truck?.pickup?.address || 'Départ'}</span>
      </div>`
    });
    
    // Marqueur d'arrivée
    markers.push({
      position: waypoints[waypoints.length - 1],
      type: 'end',
      icon: '🔴',
      popup: `<div style="text-align: center; font-family: sans-serif;">
        <strong>🔴 Destination</strong><br>
        <span style="font-size: 12px;">${routeInfo.truck?.destination || 'Arrivée'}</span><br>
        <span style="font-size: 10px; color: #666;">ETA: ${routeInfo.truck?.estimatedArrival ? new Date(routeInfo.truck.estimatedArrival).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : 'N/A'}</span>
      </div>`
    });
    
    // Points d'étapes intermédiaires (tous les 2-3 points)
    for (let i = 2; i < waypoints.length - 2; i += 3) {
      markers.push({
        position: waypoints[i],
        type: 'waypoint',
        icon: '🔵',
        popup: `<div style="text-align: center; font-family: sans-serif;">
          <strong>🔵 Point d'Étape</strong><br>
          <span style="font-size: 10px;">Étape ${Math.floor(i/2) + 1}</span>
        </div>`
      });
    }
    
    return markers;
  }

  // Obtenir position actuelle du camion sur sa route
  getCurrentTruckPosition(truckId, progress) {
    const routeInfo = this.generateRouteWithProgress(truckId, progress);
    return routeInfo ? routeInfo.currentPosition : null;
  }

  // Calculer direction du camion (pour orientation de l'icône)
  calculateBearing(truckId, progress) {
    const routeInfo = this.generateRouteWithProgress(truckId, progress);
    if (!routeInfo || !routeInfo.fullRoute) return 0;
    
    const waypoints = routeInfo.fullRoute;
    const totalPoints = waypoints.length;
    const progressIndex = Math.floor((progress / 100) * (totalPoints - 1));
    const nextIndex = Math.min(progressIndex + 1, totalPoints - 1);
    
    if (progressIndex === nextIndex) return 0;
    
    const current = waypoints[progressIndex];
    const next = waypoints[nextIndex];
    
    const deltaLat = next[0] - current[0];
    const deltaLng = next[1] - current[1];
    
    let bearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }
}

const routeGenerator = new RouteGenerator();
export default routeGenerator;

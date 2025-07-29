// Générateur de routes avec trajectoires réalistes pour éviter les problèmes d'API
class RouteGenerator {
  constructor() {
    // Routes prédéfinies pour la Tunisie (trajectoires réalistes)
   this.predefinedRoutes = {
  'TN-001': {
    // Tunis vers Sfax (Autoroute A1)
    startPoint: [36.8065, 10.1815], // Tunis
    endPoint: [34.7406, 10.7603],   // Sfax
    color: '#1e90ff',
    status: 'active',
    waypoints: [
      [36.8065, 10.1815], // Tunis centre
      [36.8386, 10.1572], // Sortie Tunis Nord
      [36.8500, 10.1400], // Autoroute A1
      [36.8800, 10.1200], // Direction Sousse
      [36.9000, 10.1000], // Pont Radès
      [36.9200, 10.0800], // Mornag
      [36.9500, 10.0500], // Enfidha
      [37.0000, 10.0200], // Hergla
      [37.0500, 10.0000], // Sousse Nord
      [37.1000, 9.9500],  // M'saken
      [37.1500, 9.9000],  // Mahdia
      [37.2000, 9.8500],  // Ksour Essaf
      [37.2500, 9.8000],  // El Jem
      [37.3000, 9.7500],  // Sfax Nord
      [34.7406, 10.7603]  // Sfax centre
    ]
  },
  'TN-002': {
    // Tunis vers Sousse (Route côtière)
    startPoint: [36.8065, 10.1815], // Tunis
    endPoint: [35.8256, 10.6369],   // Sousse
    color: '#22c55e',
    status: 'completed',
    waypoints: [
      [36.8065, 10.1815], // Tunis centre
      [36.8000, 10.2000], // La Goulette
      [36.7900, 10.2200], // Route GP11
      [36.7700, 10.2500], // Khereddine
      [36.7500, 10.2800], // Gammarth
      [36.7300, 10.3100], // Raoued
      [36.7000, 10.3500], // Kalâat el-Andalous
      [36.6500, 10.4000], // Soliman
      [36.6000, 10.4500], // Hammamet
      [36.5500, 10.5000], // Nabeul
      [36.5000, 10.5500], // Korbous
      [36.4500, 10.5800], // Hergla
      [36.4000, 10.6000], // Sousse Nord
      [35.8256, 10.6369]  // Sousse centre
    ]
  },
  'TN-003': {
    // Ariana vers Kairouan (Route intérieure)
    startPoint: [36.4098, 10.1398], // Ariana
    endPoint: [35.6786, 10.0963],   // Kairouan
    color: '#1e90ff',
    status: 'active',
    waypoints: [
      [36.4098, 10.1398], // Ariana
      [36.4000, 10.1500], // Route RR82
      [36.3800, 10.1600], // Borj Louzir
      [36.3500, 10.1700], // Mornaguia
      [36.3000, 10.1800], // Oued Ellil
      [36.2500, 10.1900], // Testour
      [36.2000, 10.1800], // Tebourba
      [36.1500, 10.1700], // Medjez el-Bab
      [36.1000, 10.1600], // Bou Arada
      [36.0500, 10.1500], // Siliana
      [36.0000, 10.1400], // Makthar
      [35.9000, 10.1200], // Sbikha
      [35.8000, 10.1000], // Chebika
      [35.7000, 10.0900], // Kairouan Nord
      [35.6786, 10.0963]  // Kairouan centre
    ]
  },
  'TN-004': {
    // La Goulette vers Nabeul (Route côtière)
    startPoint: [36.7538, 10.2286], // La Goulette
    endPoint: [36.4561, 10.7376],   // Nabeul
    color: '#1e90ff',
    status: 'active',
    waypoints: [
      [36.7538, 10.2286], // La Goulette
      [36.7500, 10.2500], // Khereddine
      [36.7400, 10.2800], // Carthage
      [36.7300, 10.3100], // Sidi Bou Said
      [36.7200, 10.3400], // La Marsa
      [36.7000, 10.3700], // Gammarth
      [36.6800, 10.4000], // Raoued
      [36.6500, 10.4300], // Kalâat el-Andalous
      [36.6200, 10.4600], // Soliman
      [36.5900, 10.4900], // Bou Argoub
      [36.5600, 10.5200], // Hammamet
      [36.5300, 10.5500], // Nabeul Nord
      [36.5000, 10.5800], // Dar Chaabane
      [36.4700, 10.6100], // Béni Khiar
      [36.4561, 10.7376]  // Nabeul centre
    ]
  },
  'TN-005': {
    // Sfax vers Gabès (Route GP1)
    startPoint: [34.7406, 10.7603], // Sfax
    endPoint: [33.8869, 10.0982],   // Gabès
    color: '#f59e0b',
    status: 'maintenance',
    waypoints: [
      [34.7406, 10.7603], // Sfax centre
      [34.7300, 10.7400], // Route GP1
      [34.7000, 10.7000], // Sakiet Ezzit
      [34.6500, 10.6500], // El Amra
      [34.6000, 10.6000], // Mahres
      [34.5500, 10.5500], // Skhira
      [34.5000, 10.5000], // Ghraiba
      [34.4500, 10.4500], // El Hencha
      [34.4000, 10.4000], // Bouchemma
      [34.3500, 10.3500], // Gabès Nord
      [34.3000, 10.3000], // Chenini
      [34.2500, 10.2500], // Oudhref
      [34.2000, 10.2000], // Métouia
      [34.1500, 10.1500], // Gabès Ouest
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
        } else if (truck.state === 'Delayed') {
          routeColor = '#ef4444'; // Rouge pour retardés
        } else {
          routeColor = '#9ca3af'; // Gris pour autres états
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

  // Créer ligne de route avec style selon état
  createRoutePolyline(routeInfo, isSelected = false) {
    if (!routeInfo || !routeInfo.fullRoute) return null;

    const baseWeight = isSelected ? 6 : 4;
    const opacity = routeInfo.status === 'completed' ? 0.7 : 0.9;
    
    // Style selon état
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
    
    // Style statique pour tous les trajets (plus d'animation)
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

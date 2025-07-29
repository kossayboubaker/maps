// Service pour extraire et améliorer les routes depuis les données des camions
class RouteService {
  constructor() {
    // Limites géographiques de la Tunisie (terrain terrestre uniquement)
    this.tunisianBounds = {
      north: 37.3,
      south: 30.2,
      east: 11.6,
      west: 7.5
    };

    // Points de contrôle pour éviter la mer
    this.landConstraints = [
      // Éviter le Golfe de Tunis
      { lat: { min: 36.7, max: 37.0 }, lng: { min: 10.0, max: 10.4 }, type: 'avoid' },
      // Éviter le Golfe de Hammamet
      { lat: { min: 35.5, max: 36.2 }, lng: { min: 10.8, max: 11.6 }, type: 'avoid' },
      // Éviter côte est Sfax
      { lat: { min: 34.5, max: 35.0 }, lng: { min: 10.8, max: 11.6 }, type: 'avoid' },
      // Éviter côte sud-est
      { lat: { min: 33.0, max: 34.5 }, lng: { min: 10.5, max: 11.6 }, type: 'avoid' }
    ];
  }

  // Extraire les routes depuis les données des camions
  extractRoutesFromTruckData(trucks) {
    const extractedRoutes = {};

    trucks.forEach(truck => {
      try {
        // Extraire les données de route existantes
        const routeData = {
          truckId: truck.truck_id,
          startPoint: truck.pickup?.coordinates || truck.position,
          endPoint: truck.destinationCoords || truck.destination?.coordinates || truck.position,
          currentPosition: truck.position,
          progress: truck.route_progress || 0,
          state: truck.state,
          existingRoute: truck.route || [],
          speed: truck.speed || 0,
          bearing: truck.bearing || 0
        };

        // Générer route améliorée
        const improvedRoute = this.generateImprovedRoute(routeData);
        extractedRoutes[truck.truck_id] = improvedRoute;

        console.log(`📍 Route extraite pour ${truck.truck_id}: ${improvedRoute.waypoints.length} points`);
      } catch (error) {
        console.warn(`⚠️ Erreur extraction route ${truck.truck_id}:`, error);
        // Route de secours
        extractedRoutes[truck.truck_id] = this.createFallbackRoute(truck);
      }
    });

    return extractedRoutes;
  }

  // Générer une route améliorée avec contraintes terrestres
  generateImprovedRoute(routeData) {
    const { startPoint, endPoint, currentPosition, progress, state, existingRoute } = routeData;

    // Valider les points de départ et d'arrivée
    const validatedStart = this.validateLandPoint(startPoint);
    const validatedEnd = this.validateLandPoint(endPoint);

    // Créer waypoints intelligents
    const waypoints = this.createIntelligentWaypoints(validatedStart, validatedEnd, existingRoute);

    // Déterminer la couleur selon l'état
    let color = '#6b7280'; // Gris par défaut
    if (state === 'En Route') color = '#1e90ff'; // Bleu
    else if (state === 'At Destination') color = '#22c55e'; // Vert
    else if (state === 'Maintenance') color = '#f59e0b'; // Orange

    return {
      truckId: routeData.truckId,
      waypoints: waypoints,
      startPoint: validatedStart,
      endPoint: validatedEnd,
      currentPosition: this.validateLandPoint(currentPosition),
      progress: progress,
      color: color,
      state: state,
      totalDistance: this.calculateRouteDistance(waypoints),
      estimatedDuration: this.calculateEstimatedDuration(waypoints, routeData.speed)
    };
  }

  // Créer des waypoints intelligents qui évitent la mer
  createIntelligentWaypoints(start, end, existingRoute = []) {
    const waypoints = [start];

    // Convertir route existante si disponible
    if (existingRoute && existingRoute.length > 0) {
      const convertedPoints = existingRoute.map(point => {
        if (point.latitude && point.longitude) {
          return [point.latitude, point.longitude];
        }
        return point;
      }).filter(point => Array.isArray(point) && point.length === 2);

      // Valider et corriger chaque point
      convertedPoints.forEach(point => {
        const validatedPoint = this.validateLandPoint(point);
        if (!this.isPointTooClose(validatedPoint, waypoints[waypoints.length - 1])) {
          waypoints.push(validatedPoint);
        }
      });
    } else {
      // Créer waypoints automatiques si pas de route existante
      const autoWaypoints = this.generateAutoWaypoints(start, end);
      waypoints.push(...autoWaypoints);
    }

    // Ajouter le point d'arrivée
    if (!this.isPointTooClose(end, waypoints[waypoints.length - 1])) {
      waypoints.push(end);
    }

    // Optimiser la route pour éviter la mer
    return this.optimizeRouteForLand(waypoints);
  }

  // Générer waypoints automatiques entre deux points
  generateAutoWaypoints(start, end) {
    const waypoints = [];
    const numSegments = Math.max(3, Math.floor(this.calculateDistance(start, end) / 50)); // 1 point tous les ~50km

    for (let i = 1; i < numSegments; i++) {
      const ratio = i / numSegments;
      const lat = start[0] + (end[0] - start[0]) * ratio;
      const lng = start[1] + (end[1] - start[1]) * ratio;

      // Ajouter variation pour suivre les routes terrestres
      const landAdjustedPoint = this.adjustPointToLand([lat, lng]);
      waypoints.push(landAdjustedPoint);
    }

    return waypoints;
  }

  // Valider qu'un point est sur terre
  validateLandPoint(point) {
    if (!point || !Array.isArray(point) || point.length < 2) {
      return [36.8, 10.2]; // Point par défaut en Tunisie
    }

    let [lat, lng] = point;

    // Vérifier les limites générales
    lat = Math.max(this.tunisianBounds.south, Math.min(this.tunisianBounds.north, lat));
    lng = Math.max(this.tunisianBounds.west, Math.min(this.tunisianBounds.east, lng));

    // Vérifier les contraintes spécifiques (éviter la mer)
    const adjustedPoint = this.adjustPointToLand([lat, lng]);
    return adjustedPoint;
  }

  // Ajuster un point pour qu'il soit sur terre
  adjustPointToLand(point) {
    let [lat, lng] = point;

    // Vérifier chaque contrainte
    for (const constraint of this.landConstraints) {
      if (constraint.type === 'avoid' &&
          lat >= constraint.lat.min && lat <= constraint.lat.max &&
          lng >= constraint.lng.min && lng <= constraint.lng.max) {
        
        // Déplacer vers l'intérieur des terres
        if (lng > 10.5) {
          lng = Math.min(lng - 0.3, 10.5); // Ramener vers l'ouest
        }
        if (lat > 36.5 && lng > 10.0) {
          lat = Math.min(lat - 0.1, 36.5); // Ramener vers le sud
        }
      }
    }

    return [lat, lng];
  }

  // Optimiser toute la route pour rester sur terre
  optimizeRouteForLand(waypoints) {
    return waypoints.map(point => this.validateLandPoint(point));
  }

  // Calculer la distance entre deux points
  calculateDistance(point1, point2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Calculer la distance totale d'une route
  calculateRouteDistance(waypoints) {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
    }
    return Math.round(totalDistance);
  }

  // Calculer la durée estimée
  calculateEstimatedDuration(waypoints, averageSpeed = 50) {
    const distance = this.calculateRouteDistance(waypoints);
    const speed = Math.max(averageSpeed, 30); // Vitesse minimum 30 km/h
    return Math.round(distance / speed * 60); // en minutes
  }

  // Vérifier si deux points sont trop proches
  isPointTooClose(point1, point2, minDistance = 5) {
    return this.calculateDistance(point1, point2) < minDistance;
  }

  // Créer une route de secours
  createFallbackRoute(truck) {
    const start = truck.position || [36.8, 10.2];
    const end = truck.destinationCoords || [36.8, 10.2];
    
    return {
      truckId: truck.truck_id,
      waypoints: [this.validateLandPoint(start), this.validateLandPoint(end)],
      startPoint: this.validateLandPoint(start),
      endPoint: this.validateLandPoint(end),
      currentPosition: this.validateLandPoint(truck.position),
      progress: truck.route_progress || 0,
      color: '#6b7280',
      state: truck.state || 'Unknown',
      totalDistance: this.calculateDistance(start, end),
      estimatedDuration: 60
    };
  }

  // Obtenir la position actuelle sur la route selon la progression
  getCurrentPositionOnRoute(routeData) {
    const { waypoints, progress } = routeData;
    if (!waypoints || waypoints.length < 2) return waypoints[0];

    const totalSegments = waypoints.length - 1;
    const progressRatio = progress / 100;
    const segmentIndex = Math.floor(progressRatio * totalSegments);
    const segmentProgress = (progressRatio * totalSegments) % 1;

    const currentSegment = Math.min(segmentIndex, totalSegments - 1);
    const nextSegment = Math.min(currentSegment + 1, totalSegments);

    const currentPoint = waypoints[currentSegment];
    const nextPoint = waypoints[nextSegment];

    if (segmentProgress === 0 || currentSegment === nextSegment) {
      return currentPoint;
    }

    // Interpolation entre les deux points
    const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * segmentProgress;
    const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * segmentProgress;

    return this.validateLandPoint([lat, lng]);
  }

  // Calculer l'orientation (bearing) entre deux points
  calculateBearing(point1, point2) {
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const lat1 = point1[0] * Math.PI / 180;
    const lat2 = point2[0] * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }
}

const routeService = new RouteService();
export default routeService;

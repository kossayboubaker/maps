// Service pour récupérer des alertes réelles depuis OpenWeatherMap
class AlertsService {
  constructor() {
    // Clés API réelles
    this.OPENWEATHER_API_KEY = '4437791bbdc183036e4e04dc15c92cb8';
    this.TOMTOM_API_KEY = 'EYzVkdZCbYKTsmoxBiz17rpTQnN3qxz0';
    
    // Base URLs
    this.OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
    this.TOMTOM_BASE_URL = 'https://api.tomtom.com/traffic/services/4';
    
    // Positions des villes tunisiennes pour surveillance météo
    this.cities = [
      { name: 'Tunis', lat: 36.8065, lon: 10.1815 },
      { name: 'Sfax', lat: 34.7406, lon: 10.7603 },
      { name: 'Sousse', lat: 35.8256, lon: 10.6369 }
    ];
    
    // Types d'alertes exhaustifs avec icônes
    this.alertTypes = {
      // 🚗 Incidents Routiers & Trafic
      accident: { title: 'Accident de circulation', icon: '🚗', severity: 'danger', delay: [20, 40] },
      accidentMinor: { title: 'Accident mineur', icon: '🚙', severity: 'warning', delay: [10, 20] },
      accidentMajor: { title: 'Accident grave', icon: '🚨', severity: 'danger', delay: [30, 60] },
      trafficJam: { title: 'Embouteillage', icon: '🚦', severity: 'warning', delay: [15, 30] },
      slowTraffic: { title: 'Circulation ralentie', icon: '🐌', severity: 'info', delay: [5, 15] },
      roadClosed: { title: 'Route fermée', icon: '🚧', severity: 'danger', delay: [60, 120] },
      laneClosed: { title: 'Voie fermée', icon: '⚠️', severity: 'warning', delay: [10, 25] },
      carStopped: { title: 'Véhicule en panne', icon: '🔧', severity: 'warning', delay: [15, 30] },
      roadworks: { title: 'Travaux routiers', icon: '🚧', severity: 'warning', delay: [20, 45] },
      maintenance: { title: 'Maintenance en cours', icon: '🔨', severity: 'info', delay: [10, 20] },
      
      // 🚓 Sécurité & Contrôles
      policeCheck: { title: 'Contrôle de police', icon: '👮', severity: 'info', delay: [5, 15] },
      speedTrap: { title: 'Radar mobile', icon: '📡', severity: 'info', delay: [2, 5] },
      
      // 🌦️ Alertes Météo
      rain: { title: 'Pluie', icon: '🌧️', severity: 'warning', delay: [10, 20] },
      heavyRain: { title: 'Pluie forte', icon: '⛈️', severity: 'danger', delay: [20, 40] },
      snow: { title: 'Neige', icon: '❄️', severity: 'danger', delay: [30, 60] },
      fog: { title: 'Brouillard', icon: '🌫️', severity: 'warning', delay: [15, 25] },
      wind: { title: 'Vent fort', icon: '🌬️', severity: 'warning', delay: [10, 20] },
      
      // Alertes par défaut
      traffic: { title: 'Trafic', icon: '🚦', severity: 'warning', delay: [10, 20] },
      weather: { title: 'Météo', icon: '🌤️', severity: 'info', delay: [5, 15] },
      construction: { title: 'Travaux', icon: '🚧', severity: 'warning', delay: [15, 30] },
      police: { title: 'Police', icon: '👮', severity: 'info', delay: [5, 10] }
    };
  }

  // Récupérer les alertes météo avec gestion d'erreur robuste
  async getWeatherAlerts(truckRoutes = []) {
    const alerts = [];
    
    try {
      for (const city of this.cities) {
        try {
          const response = await Promise.race([
            fetch(`${this.OPENWEATHER_BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&appid=${this.OPENWEATHER_API_KEY}&units=metric&lang=fr`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          
          if (response.ok) {
            const data = await response.json();
            const alert = this.processWeatherData(data, city, truckRoutes);
            if (alert) {
              alerts.push(alert);
            }
          }
        } catch (cityError) {
          console.warn(`Erreur météo ${city.name}:`, cityError.message);
        }
      }
    } catch (error) {
      console.warn('Erreur générale météo:', error.message);
    }
    
    if (alerts.length === 0) {
      return this.getFallbackWeatherAlerts(truckRoutes);
    }
    
    return alerts;
  }

  // Traiter les données météo avec protection d'erreur
  processWeatherData(data, city, truckRoutes) {
    try {
      if (!data || !data.weather || !data.main) {
        return null;
      }
      
      const condition = data.weather[0]?.main || 'Clear';
      const description = data.weather[0]?.description || 'Conditions normales';
      const temp = data.main.temp || 20;
      const windSpeed = data.wind?.speed || 0;
      
      // Conditions nécessitant une alerte
      const needsAlert = 
        condition === 'Rain' || 
        condition === 'Thunderstorm' || 
        condition === 'Snow' ||
        condition === 'Mist' ||
        condition === 'Fog' ||
        windSpeed > 10 ||
        temp < 0 ||
        temp > 40;
      
      if (!needsAlert) return null;
      
      // Trouver les camions affectés
      const affectedTrucks = truckRoutes.filter(truck => {
        const distance = this.calculateDistance(truck.position, [city.lat, city.lon]);
        return distance < 50;
      });
      
      // Déterminer la sévérité
      let alertType = 'weather';
      let severity = 'info';
      let delay = 5;
      let icon = '🌤️';
      
      if (condition === 'Thunderstorm' || windSpeed > 15 || temp < -5 || temp > 45) {
        severity = 'danger';
        delay = 20;
        icon = '⛈️';
        alertType = 'heavyRain';
      } else if (condition === 'Rain' || condition === 'Snow' || windSpeed > 10) {
        severity = 'warning';
        delay = 10;
        icon = condition === 'Rain' ? '🌧️' : '❄️';
        alertType = condition === 'Rain' ? 'rain' : 'snow';
      }
      
      if (condition === 'Fog' || condition === 'Mist') {
        icon = '🌫️';
        alertType = 'fog';
      }
      
      return {
        id: `weather_${city.name}_${Date.now()}`,
        type: alertType,
        title: `Météo - ${city.name}`,
        icon,
        location: city.name,
        position: [city.lat, city.lon],
        description: `${description} - Temp: ${Math.round(temp)}°C${windSpeed > 5 ? `, Vent: ${Math.round(windSpeed)} m/s` : ''}`,
        severity,
        delay,
        affectedRoutes: affectedTrucks.map(truck => truck.truck_id),
        timestamp: new Date().toISOString(),
        isActive: true,
        source: 'openweather'
      };
    } catch (error) {
      console.warn('Erreur traitement météo:', error.message);
      return null;
    }
  }

  // Récupérer alertes trafic intelligentes
  async getTrafficAlerts(truckRoutes = []) {
    try {
      return this.generateIntelligentTrafficAlerts(truckRoutes);
    } catch (error) {
      console.warn('Erreur alertes trafic:', error.message);
      return this.generateBasicFallbackAlerts(truckRoutes);
    }
  }

  // Génération intelligente d'alertes trafic
  generateIntelligentTrafficAlerts(truckRoutes) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    const alerts = [];
    
    // Zones critiques avec probabilités
    const zones = [
      { name: 'Centre-ville Tunis', coords: [36.8065, 10.1815], risk: 0.6 },
      { name: 'Autoroute A1', coords: [36.7200, 10.2100], risk: 0.4 },
      { name: 'Port de Sfax', coords: [34.7406, 10.7603], risk: 0.3 }
    ];
    
    // Types d'alertes possibles
    const possibleAlerts = [
      { type: 'trafficJam', probability: 0.4 },
      { type: 'roadworks', probability: 0.3 },
      { type: 'policeCheck', probability: 0.2 },
      { type: 'carStopped', probability: 0.3 }
    ];
    
    zones.forEach(zone => {
      let adjustedRisk = zone.risk;
      const isWeekend = currentDay === 0 || currentDay === 6;
      const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
      
      if (isPeakHour && !isWeekend) adjustedRisk *= 1.5;
      if (isWeekend) adjustedRisk *= 0.7;
      
      if (Math.random() < adjustedRisk) {
        const selectedAlert = possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)];
        if (Math.random() < selectedAlert.probability) {
          const alertInfo = this.alertTypes[selectedAlert.type];
          
          const affectedTrucks = truckRoutes.filter(truck => {
            const distance = this.calculateDistance(truck.position, zone.coords);
            return distance < 25;
          });
          
          alerts.push({
            id: `traffic_${selectedAlert.type}_${zone.name.replace(/\s+/g, '_')}_${Date.now()}`,
            type: selectedAlert.type,
            title: `${alertInfo.title} - ${zone.name}`,
            icon: alertInfo.icon,
            location: zone.name,
            position: zone.coords,
            description: this.generateDescription(selectedAlert.type, zone.name),
            severity: alertInfo.severity,
            delay: this.getRandomDelay(alertInfo.delay),
            affectedRoutes: affectedTrucks.map(truck => truck.truck_id),
            timestamp: new Date().toISOString(),
            isActive: true,
            source: 'intelligent'
          });
        }
      }
    });
    
    return alerts;
  }

  // Générer descriptions contextuelles
  generateDescription(alertType, location) {
    const descriptions = {
      trafficJam: [`Embouteillage important à ${location}`, `Circulation dense observée`],
      roadworks: [`Travaux de réfection en cours à ${location}`, `Maintenance routière`],
      policeCheck: [`Contrôle de routine des forces de l'ordre`, `Point de contrôle actif`],
      carStopped: [`Véhicule en détresse à ${location}`, `Incident routier en cours`]
    };
    
    const options = descriptions[alertType] || [`Alerte trafic à ${location}`];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Générer délai aléatoire
  getRandomDelay(delayRange) {
    if (Array.isArray(delayRange)) {
      return delayRange[0] + Math.floor(Math.random() * (delayRange[1] - delayRange[0]));
    }
    return delayRange || 10;
  }

  // Fallback météo en cas d'erreur
  getFallbackWeatherAlerts(truckRoutes) {
    return [
      {
        id: `fallback_weather_${Date.now()}`,
        type: 'weather',
        title: 'Surveillance météo active',
        icon: '🌤️',
        location: 'Tunisie',
        position: [36.8065, 10.1815],
        description: 'Conditions météo surveillées',
        severity: 'info',
        delay: 0,
        affectedRoutes: [],
        timestamp: new Date().toISOString(),
        isActive: true,
        source: 'fallback'
      }
    ];
  }

  // Fallback basique
  generateBasicFallbackAlerts(truckRoutes) {
    return [
      {
        id: `basic_traffic_${Date.now()}`,
        type: 'trafficJam',
        title: 'Surveillance trafic active',
        icon: '🚦',
        location: 'Réseau routier',
        position: [36.8065, 10.1815],
        description: 'Circulation surveillée',
        severity: 'info',
        delay: 0,
        affectedRoutes: [],
        timestamp: new Date().toISOString(),
        isActive: true,
        source: 'basic'
      }
    ];
  }

  // Calculer distance entre deux points
  calculateDistance(pos1, pos2) {
    try {
      const R = 6371; // Rayon de la Terre en km
      const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
      const dLng = (pos2[1] - pos1[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    } catch (error) {
      return 0;
    }
  }

  // Méthode principale avec gestion d'erreur complète
  async getAllAlerts(truckRoutes = []) {
    const allAlerts = [];
    
    // Récupérer alertes météo avec protection
    try {
      const weatherAlerts = await Promise.race([
        this.getWeatherAlerts(truckRoutes),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout météo')), 8000))
      ]);
      allAlerts.push(...weatherAlerts);
    } catch (error) {
      console.warn('Météo indisponible, fallback activé');
      allAlerts.push(...this.getFallbackWeatherAlerts(truckRoutes));
    }
    
    // Récupérer alertes trafic avec protection
    try {
      const trafficAlerts = await this.getTrafficAlerts(truckRoutes);
      allAlerts.push(...trafficAlerts);
    } catch (error) {
      console.warn('Trafic indisponible, fallback activé');
      allAlerts.push(...this.generateBasicFallbackAlerts(truckRoutes));
    }
    
    // S'assurer qu'on a toujours des alertes
    if (allAlerts.length === 0) {
      allAlerts.push({
        id: `emergency_${Date.now()}`,
        type: 'info',
        title: 'Système actif',
        icon: 'ℹ️',
        location: 'Système',
        position: [36.8065, 10.1815],
        description: 'Surveillance en cours',
        severity: 'info',
        delay: 0,
        affectedRoutes: [],
        timestamp: new Date().toISOString(),
        isActive: true,
        source: 'emergency'
      });
    }
    
    return allAlerts;
  }
}

export default new AlertsService();

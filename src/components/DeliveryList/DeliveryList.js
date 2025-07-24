import React, { useState, useMemo, useEffect } from 'react';
import DeliveryCard from '../DeliveryCard/DeliveryCard';

const DeliveryList = ({ deliveries, searchTerm, onSearchChange, selectedDelivery, onSelectDelivery, alerts = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // 3 éléments par page pour un design optimal

  // Recherche intelligente améliorée
  const filteredDeliveries = useMemo(() => {
    if (!searchTerm) return deliveries;

    const term = searchTerm.toLowerCase().trim();
    return deliveries.filter(delivery => {
      // Recherche dans tous les champs pertinents
      const searchableFields = [
        delivery.truck_id,
        delivery.id,
        delivery.driver?.name,
        delivery.pickup?.address,
        delivery.pickup?.city,
        delivery.destination,
        delivery.vehicle,
        delivery.cargo,
        delivery.cargo_type,
        delivery.state,
        delivery.driver?.company
      ].filter(Boolean).map(field => field.toString().toLowerCase());

      // Recherche par mots-clés multiples
      const searchWords = term.split(' ').filter(word => word.length > 0);

      return searchWords.every(word =>
        searchableFields.some(field => field.includes(word))
      );
    });
  }, [deliveries, searchTerm]);

  // Pagination intelligente
  const totalPages = Math.ceil(filteredDeliveries?.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filteredDeliveries?.slice(startIndex, endIndex);

  // Gestion des changements de page
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Reset page à 0 quand la recherche change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Statistiques réelles de la flotte connectées aux vraies données
  const fleetStats = useMemo(() => {
    const total = deliveries.length;
    const enRoute = deliveries.filter(d => d.state === 'En Route').length;
    const arrived = deliveries.filter(d => d.state === 'At Destination').length;

    // Calculer vraies alertes depuis le prop alerts
    const alertsAffectingTrucks = alerts.filter(alert =>
      alert.affectedRoutes && alert.affectedRoutes.length > 0
    ).length;

    // Vitesse moyenne des camions en route
    const trucksInRoute = deliveries.filter(d => d.state === 'En Route');
    const avgSpeed = trucksInRoute.length > 0
      ? Math.round(trucksInRoute.reduce((sum, d) => sum + (d.speed || 0), 0) / trucksInRoute.length)
      : 0;

    return { total, enRoute, arrived, totalAlerts: alertsAffectingTrucks, avgSpeed };
  }, [deliveries, alerts]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 border-b border-border flex-shrink-0">
        <div className="relative mb-3 ml-8">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 xxs:h-10 xs:h-10 pl-8 xxs:pl-9 xs:pl-10 pr-3 xxs:pr-4 rounded-lg border border-input bg-background text-xs xxs:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-smooth"
          />
        </div>

        {/* Statistiques optimisées - tailles réduites */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: '4px',
          marginBottom: '8px'
        }}>
          <div style={{
            background: '#10b981',
            borderRadius: '8px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.total}</div>
            <div style={{ fontSize: '9px', marginTop: '1px' }}>Camions</div>
          </div>
          <div style={{
            background: '#3b82f6',
            borderRadius: '8px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.enRoute}</div>
            <div style={{ fontSize: '9px', marginTop: '1px' }}>En route</div>
          </div>
          <div style={{
            background: '#8b5cf6',
            borderRadius: '8px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.arrived}</div>
            <div style={{ fontSize: '9px', marginTop: '1px' }}>Arrivés</div>
          </div>
          <div style={{
            background: '#ef4444',
            borderRadius: '8px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.totalAlerts}</div>
            <div style={{ fontSize: '9px', marginTop: '1px' }}>Alertes</div>
          </div>
          <div style={{
            background: '#f59e0b',
            borderRadius: '8px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.avgSpeed}</div>
            <div style={{ fontSize: '9px', marginTop: '1px' }}>km/h</div>
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-border flex-shrink-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-medium">Livraisons</div>
        {filteredDeliveries?.length > 0 && (
          <div className="text-xs xxs:text-sm text-muted-foreground">
            {startIndex + 1}-{Math.min(endIndex, filteredDeliveries?.length)}/{filteredDeliveries.length}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {currentDeliveries?.length > 0 ? (
          currentDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              isSelected={selectedDelivery?.truck_id === delivery.truck_id}
              onSelect={() => onSelectDelivery && onSelectDelivery(delivery)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 xxs:h-40 xs:h-48 text-center">
            <div className="h-8 w-8 xxs:h-12 xxs:w-12 xs:h-16 xs:w-16 bg-muted rounded-full flex items-center justify-center mb-2 xxs:mb-3 xs:mb-4">
              <svg
                className="h-4 w-4 xxs:h-6 xxs:w-6 xs:h-8 xs:w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xs xxs:text-sm xs:text-base font-medium text-foreground mb-1 xxs:mb-2">
              Aucune livraison
            </h3>
            <p className="text-xs xxs:text-sm text-muted-foreground">
              {searchTerm ? "Essayez d'autres termes" : 'Aucune livraison en cours'}
            </p>
          </div>
        )}
      </div>


    </div>
  );
};

export default DeliveryList;

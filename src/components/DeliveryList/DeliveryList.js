import React, { useState, useMemo, useEffect } from 'react';
import DeliveryCard from '../DeliveryCard/DeliveryCard';

const DeliveryList = ({ deliveries, searchTerm, onSearchChange, selectedDelivery, onSelectDelivery, alerts = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2; // Exactement 2 éléments par page

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

    // Calculer vraies alertes depuis les APIs - toutes les alertes actives
    const totalAlerts = alerts.length; // Toutes les alertes réelles

    // Vitesse moyenne des camions en route
    const trucksInRoute = deliveries.filter(d => d.state === 'En Route');
    const avgSpeed = trucksInRoute.length > 0
      ? Math.round(trucksInRoute.reduce((sum, d) => sum + (d.speed || 0), 0) / trucksInRoute.length)
      : 0;

    return { total, enRoute, arrived, totalAlerts, avgSpeed };
  }, [deliveries, alerts]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Barre de recherche - sans espacement */}
      <div style={{ 
        padding: '12px 16px 8px 16px', 
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
        margin: 0
      }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              width: '16px',
              height: '16px'
            }}
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
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '40px',
              paddingRight: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Statistiques compactes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          margin: 0
        }}>
          <div style={{
            background: '#10b981',
            borderRadius: '6px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.total}</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>Camions</div>
          </div>
          <div style={{
            background: '#3b82f6',
            borderRadius: '6px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.enRoute}</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>En route</div>
          </div>
          <div style={{
            background: '#8b5cf6',
            borderRadius: '6px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.arrived}</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>Arrivés</div>
          </div>
          <div style={{
            background: '#ef4444',
            borderRadius: '6px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.totalAlerts}</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>Alertes</div>
          </div>
          <div style={{
            background: '#f59e0b',
            borderRadius: '6px',
            padding: '6px 4px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.avgSpeed}</div>
            <div style={{ fontSize: '8px', marginTop: '1px' }}>km/h</div>
          </div>
        </div>
      </div>

      {/* En-tête livraisons */}
      <div style={{ 
        padding: '8px 16px', 
        borderBottom: '1px solid #e2e8f0', 
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 0
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Livraisons</div>
        {filteredDeliveries?.length > 0 && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {startIndex + 1}-{Math.min(endIndex, filteredDeliveries?.length)}/{filteredDeliveries.length}
          </div>
        )}
      </div>

      {/* Zone d'affichage des cartes - EXACTEMENT 2 cartes */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '12px 16px 0px 16px',
        gap: '12px',
        margin: 0
      }}>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <svg
                style={{ width: '24px', height: '24px', color: '#6b7280' }}
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
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#1f2937', 
              margin: '0 0 4px 0' 
            }}>
              Aucune livraison
            </h3>
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              margin: 0
            }}>
              {searchTerm ? "Essayez d'autres termes" : 'Aucune livraison en cours'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination collée en bas - SANS ESPACEMENT */}
      {totalPages > 1 && (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          backgroundColor: '#fff',
          margin: 0
        }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === 0 ? '#f9fafb' : '#fff',
              color: currentPage === 0 ? '#9ca3af' : '#374151',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 0) {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 0) {
                e.target.style.backgroundColor = '#fff';
              }
            }}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Préc
          </button>

          <div style={{ 
            fontSize: '12px', 
            color: '#374151', 
            fontWeight: '600' 
          }}>
            {currentPage + 1}/{totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === totalPages - 1 ? '#f9fafb' : '#fff',
              color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages - 1) {
                e.target.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages - 1) {
                e.target.style.backgroundColor = '#fff';
              }
            }}
          >
            Suiv
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;

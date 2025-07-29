import React, { useState, useMemo, useEffect } from 'react';
import DeliveryCard from '../DeliveryCard/DeliveryCard';

const DeliveryList = ({ deliveries, searchTerm, onSearchChange, selectedDelivery, onSelectDelivery, alerts = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const itemsPerPage = 2; // Exactement 2 éléments par page

  // Surveiller les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Configuration responsive adaptative
  const getResponsiveConfig = () => {
    const { width, height } = screenSize;
    
    if (width >= 3840) { // 4K+
      return {
        padding: '20px 24px',
        searchPadding: '16px 24px 12px 24px',
        cardGap: '16px',
        fontSize: '16px',
        headerHeight: 90,
        statsHeight: 50,
        searchHeight: 48,
        cardsHeight: height - 250 // Hauteur restante pour les cartes
      };
    } else if (width >= 2560) { // 2K
      return {
        padding: '16px 20px',
        searchPadding: '14px 20px 10px 20px',
        cardGap: '14px',
        fontSize: '15px',
        headerHeight: 80,
        statsHeight: 45,
        searchHeight: 44,
        cardsHeight: height - 220
      };
    } else if (width >= 1920) { // Full HD
      return {
        padding: '14px 18px',
        searchPadding: '12px 18px 8px 18px',
        cardGap: '12px',
        fontSize: '14px',
        headerHeight: 75,
        statsHeight: 42,
        searchHeight: 42,
        cardsHeight: height - 200
      };
    } else if (width >= 1440) { // Desktop
      return {
        padding: '12px 16px',
        searchPadding: '12px 16px 8px 16px',
        cardGap: '12px',
        fontSize: '14px',
        headerHeight: 70,
        statsHeight: 40,
        searchHeight: 40,
        cardsHeight: height - 180
      };
    } else if (width >= 1024) { // Laptop
      return {
        padding: '10px 14px',
        searchPadding: '10px 14px 6px 14px',
        cardGap: '10px',
        fontSize: '13px',
        headerHeight: 65,
        statsHeight: 38,
        searchHeight: 38,
        cardsHeight: height - 160
      };
    } else if (width >= 768) { // Tablet
      return {
        padding: '8px 12px',
        searchPadding: '8px 12px 6px 12px',
        cardGap: '8px',
        fontSize: '13px',
        headerHeight: 60,
        statsHeight: 36,
        searchHeight: 36,
        cardsHeight: height - 140
      };
    } else if (width >= 480) { // Mobile Large
      return {
        padding: '6px 10px',
        searchPadding: '6px 10px 4px 10px',
        cardGap: '6px',
        fontSize: '12px',
        headerHeight: 55,
        statsHeight: 34,
        searchHeight: 34,
        cardsHeight: height - 120
      };
    } else { // Mobile Small
      return {
        padding: '4px 8px',
        searchPadding: '4px 8px 4px 8px',
        cardGap: '4px',
        fontSize: '11px',
        headerHeight: 50,
        statsHeight: 32,
        searchHeight: 32,
        cardsHeight: height - 110
      };
    }
  };

  const config = getResponsiveConfig();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      backgroundColor: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* Barre de recherche responsive */}
      <div style={{ 
        padding: config.searchPadding,
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
        margin: 0,
        height: config.headerHeight + 'px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', marginBottom: '8px', flex: 1 }}>
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              width: Math.max(14, config.searchHeight * 0.4) + 'px',
              height: Math.max(14, config.searchHeight * 0.4) + 'px'
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
              height: config.searchHeight + 'px',
              paddingLeft: Math.max(32, config.searchHeight * 0.8) + 'px',
              paddingRight: '12px',
              borderRadius: Math.max(6, config.searchHeight * 0.2) + 'px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              fontSize: config.fontSize,
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
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

        {/* Statistiques responsives */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenSize.width >= 768 ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
          gap: Math.max(2, screenSize.width * 0.002) + 'px',
          margin: 0,
          height: config.statsHeight + 'px',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#10b981',
            borderRadius: Math.max(4, config.statsHeight * 0.15) + 'px',
            padding: `${Math.max(3, config.statsHeight * 0.15)}px ${Math.max(2, config.statsHeight * 0.1)}px`,
            textAlign: 'center',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 1.1) + 'px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.total}</div>
            <div style={{ fontSize: Math.max(7, parseInt(config.fontSize) * 0.7) + 'px', marginTop: '1px' }}>Camions</div>
          </div>
          <div style={{
            background: '#3b82f6',
            borderRadius: Math.max(4, config.statsHeight * 0.15) + 'px',
            padding: `${Math.max(3, config.statsHeight * 0.15)}px ${Math.max(2, config.statsHeight * 0.1)}px`,
            textAlign: 'center',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 1.1) + 'px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.enRoute}</div>
            <div style={{ fontSize: Math.max(7, parseInt(config.fontSize) * 0.7) + 'px', marginTop: '1px' }}>En route</div>
          </div>
          <div style={{
            background: '#8b5cf6',
            borderRadius: Math.max(4, config.statsHeight * 0.15) + 'px',
            padding: `${Math.max(3, config.statsHeight * 0.15)}px ${Math.max(2, config.statsHeight * 0.1)}px`,
            textAlign: 'center',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 1.1) + 'px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.arrived}</div>
            <div style={{ fontSize: Math.max(7, parseInt(config.fontSize) * 0.7) + 'px', marginTop: '1px' }}>Arrivés</div>
          </div>
          {screenSize.width >= 768 && (
            <div style={{
              background: '#ef4444',
              borderRadius: Math.max(4, config.statsHeight * 0.15) + 'px',
              padding: `${Math.max(3, config.statsHeight * 0.15)}px ${Math.max(2, config.statsHeight * 0.1)}px`,
              textAlign: 'center',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 1.1) + 'px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.totalAlerts}</div>
              <div style={{ fontSize: Math.max(7, parseInt(config.fontSize) * 0.7) + 'px', marginTop: '1px' }}>Alertes</div>
            </div>
          )}
          {screenSize.width >= 768 && (
            <div style={{
              background: '#f59e0b',
              borderRadius: Math.max(4, config.statsHeight * 0.15) + 'px',
              padding: `${Math.max(3, config.statsHeight * 0.15)}px ${Math.max(2, config.statsHeight * 0.1)}px`,
              textAlign: 'center',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 1.1) + 'px', fontWeight: 'bold', lineHeight: '1' }}>{fleetStats.avgSpeed}</div>
              <div style={{ fontSize: Math.max(7, parseInt(config.fontSize) * 0.7) + 'px', marginTop: '1px' }}>km/h</div>
            </div>
          )}
        </div>
      </div>

      {/* En-tête livraisons responsive */}
      <div style={{ 
        padding: config.padding.split(' ').slice(0, 2).join(' ') + ' ' + config.padding.split(' ').slice(0, 2).join(' '), 
        borderBottom: '1px solid #e2e8f0', 
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 0,
        height: Math.max(32, screenSize.width * 0.02) + 'px',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px', color: '#6b7280', fontWeight: '500' }}>Livraisons</div>
        {filteredDeliveries?.length > 0 && (
          <div style={{ fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px', color: '#6b7280' }}>
            {startIndex + 1}-{Math.min(endIndex, filteredDeliveries?.length)}/{filteredDeliveries.length}
          </div>
        )}
      </div>

      {/* Zone d'affichage des cartes responsive - EXACTEMENT 2 cartes */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        padding: config.padding,
        gap: config.cardGap,
        margin: 0,
        height: config.cardsHeight + 'px',
        maxHeight: config.cardsHeight + 'px',
        boxSizing: 'border-box'
      }}>
        {currentDeliveries?.length > 0 ? (
          currentDeliveries.map((delivery) => (
            <div key={delivery.id} style={{ 
              flex: 1, 
              maxHeight: `calc((${config.cardsHeight}px - ${config.cardGap}) / 2)`,
              minHeight: `calc((${config.cardsHeight}px - ${config.cardGap}) / 2)`,
              overflow: 'hidden'
            }}>
              <DeliveryCard
                delivery={delivery}
                isSelected={selectedDelivery?.truck_id === delivery.truck_id}
                onSelect={() => onSelectDelivery && onSelectDelivery(delivery)}
                screenSize={screenSize}
                config={config}
              />
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: config.cardsHeight + 'px',
            textAlign: 'center'
          }}>
            <div style={{
              width: Math.max(32, screenSize.width * 0.03) + 'px',
              height: Math.max(32, screenSize.width * 0.03) + 'px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Math.max(8, screenSize.width * 0.008) + 'px'
            }}>
              <svg
                style={{ width: Math.max(16, screenSize.width * 0.015) + 'px', height: Math.max(16, screenSize.width * 0.015) + 'px', color: '#6b7280' }}
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
              fontSize: config.fontSize, 
              fontWeight: '500', 
              color: '#1f2937', 
              margin: '0 0 4px 0' 
            }}>
              Aucune livraison
            </h3>
            <p style={{ 
              fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px', 
              color: '#6b7280',
              margin: 0
            }}>
              {searchTerm ? "Essayez d'autres termes" : 'Aucune livraison en cours'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination responsive */}
      {totalPages > 1 && (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          padding: config.padding,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          backgroundColor: '#fff',
          margin: 0,
          height: Math.max(40, screenSize.width * 0.025) + 'px',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: Math.max(2, screenSize.width * 0.003) + 'px',
              padding: `${Math.max(4, screenSize.width * 0.004)}px ${Math.max(8, screenSize.width * 0.008)}px`,
              borderRadius: Math.max(4, screenSize.width * 0.004) + 'px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === 0 ? '#f9fafb' : '#fff',
              color: currentPage === 0 ? '#9ca3af' : '#374151',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              height: Math.max(28, screenSize.width * 0.018) + 'px',
              boxSizing: 'border-box'
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
            <svg style={{ width: Math.max(8, screenSize.width * 0.006) + 'px', height: Math.max(8, screenSize.width * 0.006) + 'px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Préc
          </button>

          <div style={{ 
            fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px', 
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
              gap: Math.max(2, screenSize.width * 0.003) + 'px',
              padding: `${Math.max(4, screenSize.width * 0.004)}px ${Math.max(8, screenSize.width * 0.008)}px`,
              borderRadius: Math.max(4, screenSize.width * 0.004) + 'px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage === totalPages - 1 ? '#f9fafb' : '#fff',
              color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: Math.max(10, parseInt(config.fontSize) * 0.85) + 'px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              height: Math.max(28, screenSize.width * 0.018) + 'px',
              boxSizing: 'border-box'
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
            <svg style={{ width: Math.max(8, screenSize.width * 0.006) + 'px', height: Math.max(8, screenSize.width * 0.006) + 'px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;

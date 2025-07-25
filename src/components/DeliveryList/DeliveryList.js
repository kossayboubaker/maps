import React, { useState, useMemo, useEffect } from 'react';
import DeliveryCard from '../DeliveryCard/DeliveryCard';

const DeliveryList = ({ deliveries, searchTerm, onSearchChange }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;

  // Filtrage des livraisons en fonction du terme de recherche
  const filteredDeliveries = useMemo(() => {
    if (!searchTerm) return deliveries;

    const term = searchTerm.toLowerCase();
    return deliveries.filter(delivery =>
      delivery.id.toLowerCase().includes(term) ||
      delivery.driver.name.toLowerCase().includes(term) ||
      delivery.pickup.address.toLowerCase().includes(term) ||
      delivery.destination.address.toLowerCase().includes(term) ||
      delivery.vehicle.toLowerCase().includes(term)
    );
  }, [deliveries, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries?.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filteredDeliveries?.slice(startIndex, endIndex);

  // Gestion des changements de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 xxs:p-3 xs:p-4 sm:p-5 border-b border-border flex-shrink-0">
        <div className="relative mb-6 ml-10">
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
      </div>

      <div className="p-1 xxs:p-3 xs:p-4 sm:p-3 border-b border-border flex-shrink-0 flex items-center justify-between">
        <div className="text-xs xxs:text-sm text-muted-foreground font-medium">Livraisons</div>
        {filteredDeliveries?.length > 0 && (
          <div className="text-xs xxs:text-sm text-muted-foreground">
            {startIndex + 1}-{Math.min(endIndex, filteredDeliveries?.length)}/{filteredDeliveries.length}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 xxs:px-3 xs:px-4 sm:px-5 space-y-2 xxs:space-y-3 xs:space-y-4">
        {currentDeliveries?.length > 0 ? (
          currentDeliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
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

      {totalPages > 1 && (
        <div className="sticky bottom-0 bg-background border-t border-border px-2 xxs:px-3 xs:px-4 sm:px-5 py-2 xxs:py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="h-6 w-6 xxs:h-7 xxs:w-7 xs:h-8 xs:w-8 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center text-xs xxs:text-sm"
          >
            <svg
              className="h-3 w-3 xxs:h-4 xxs:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-xs xxs:text-sm text-muted-foreground font-medium">
            {currentPage + 1}/{totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Next page"
            className="h-6 w-6 xxs:h-7 xxs:w-7 xs:h-8 xs:w-8 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center text-xs xxs:text-sm"
          >
            <svg
              className="h-3 w-3 xxs:h-4 xxs:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;

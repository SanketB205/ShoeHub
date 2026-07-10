import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

/**
 * Generates the page-number array with ellipsis.
 * e.g. totalPages=12, current=6  →  [1, '...', 5, 6, 7, '...', 12]
 */
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalProducts, productsPerPage }) => {
  if (totalPages <= 1) return null;

  const pageNums = getPageNumbers(currentPage, totalPages);

  const from = (currentPage - 1) * productsPerPage + 1;
  const to   = Math.min(currentPage * productsPerPage, totalProducts);

  return (
    <div className="pagination-wrapper">
      <p className="pagination-counter">
        Showing <strong>{from}–{to}</strong> of <strong>{totalProducts}</strong> Products
      </p>

      <nav className="pagination-nav" aria-label="Pagination">
        {/* Previous */}
        <button
          className="pg-btn pg-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="pg-label">Previous</span>
        </button>

        {/* Page numbers — hidden on mobile, replaced by text */}
        <div className="pg-numbers" role="list">
          {pageNums.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="pg-ellipsis" aria-hidden="true">…</span>
            ) : (
              <button
                key={p}
                className={`pg-btn pg-num ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="pg-mobile-indicator" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next */}
        <button
          className="pg-btn pg-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span className="pg-label">Next</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

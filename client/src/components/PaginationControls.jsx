// PaginationControls.jsx - компонент навигации по страницам

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  goToPage, 
  goToPrevPage, 
  goToNextPage 
}) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={goToPrevPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 text-sm border rounded ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        ←
      </button>
      
      {/* Номера страниц */}
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum
        if (totalPages <= 5) {
          pageNum = i + 1
        } else if (currentPage <= 3) {
          pageNum = i + 1
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i
        } else {
          pageNum = currentPage - 2 + i
        }
        
        return (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            className={`px-3 py-1 text-sm border rounded ${
              pageNum === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        )
      })}
      
      {totalPages > 5 && currentPage < totalPages - 2 && (
        <>
          <span className="px-2 text-gray-500">...</span>
          <button
            onClick={() => goToPage(totalPages)}
            className="px-3 py-1 text-sm border rounded bg-white text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 text-sm border rounded ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        →
      </button>
    </div>
  )
}
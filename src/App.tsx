import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProductDetail } from './pages/ProductDetail';
import { ProductList } from './pages/ProductList';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useProductHistory } from './hooks/useProductHistory';
import { useProductSearch } from './hooks/useProductSearch';
import { useNavigationHandlers } from './hooks/useNavigationHandlers';
import { AuthProvider } from './contexts/AuthContext';
import { SystemSettings } from './components/SystemSettings';
import { SearchParams } from './lib/api/types';

/**
 * Main App Component
 */
function App() {
  // Custom hooks
  const { 
    // Search parameters
    platform, setPlatform,
    viscosityGrade, setViscosityGrade,
    manufacturer, setManufacturer,
    productName, setProductName,
    showResults, setShowResults,
    scrollPosition, setScrollPosition,

    // Search results
    products: filteredProducts,
    setProducts: setFilteredProducts,
    isLoading,
    error,
    setError,
    filterProducts,
    filterOptions: { viscosityGrades, manufacturers }
  } = useProductSearch();
  
  const { searchHistory, addToSearchHistory, deleteSearchHistory, deleteAllSearchHistory } = useSearchHistory();
  const { productHistory, addToProductHistory, deleteProductHistory, deleteAllProductHistory } = useProductHistory();
  const { handleProductClick, handleProductHistoryItemClick: handleProductHistoryClick } = useNavigationHandlers({
    setPlatform,
    setProductName,
    setViscosityGrade,
    setManufacturer,
    setScrollPosition,
    products: filteredProducts,
    productHistory
  });
  
  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const location = useLocation();

  // Show results when returning to home page
  useEffect(() => {
    if (location.pathname === '/' && filteredProducts.length > 0) {
      setShowResults(true);
    }
  }, [location, filteredProducts.length, setShowResults]);

  const handleSearch = async (params: SearchParams) => {
    const result = await filterProducts(params);
    setFilteredProducts(result.products);
    return result;
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <SystemSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <ProductList
                  platform={platform}
                  setPlatform={setPlatform}
                  viscosityGrade={viscosityGrade}
                  setViscosityGrade={setViscosityGrade}
                  manufacturer={manufacturer}
                  setManufacturer={setManufacturer}
                  productName={productName}
                  setProductName={setProductName}
                  showResults={showResults}
                  setShowResults={setShowResults}
                  filteredProducts={filteredProducts}
                  setFilteredProducts={setFilteredProducts}
                  scrollPosition={scrollPosition}
                  setScrollPosition={setScrollPosition}
                  searchHistory={searchHistory}
                  addToSearchHistory={addToSearchHistory}
                  productHistory={productHistory}
                  addToProductHistory={addToProductHistory}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onHistoryItemClick={handleProductClick}
                  onProductHistoryItemClick={handleProductHistoryClick}
                  onDeleteSearchHistory={deleteSearchHistory}
                  onDeleteProductHistory={deleteProductHistory}
                  onDeleteAllSearchHistory={deleteAllSearchHistory}
                  onDeleteAllProductHistory={deleteAllProductHistory}
                  isLoading={isLoading}
                  error={error}
                  setError={setError}
                  filterProducts={handleSearch}
                  viscosityGrades={viscosityGrades}
                  manufacturers={manufacturers}
                />
              }
            />
            <Route 
              path="/product/:id" 
              element={
                <ProductDetail 
                  addToProductHistory={addToProductHistory}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
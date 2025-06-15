import { useNavigate } from 'react-router-dom';
import { Platform, Product, ProductHistory, SearchHistory } from '../types';
import { Database } from '../types/supabase';

interface NavigationHandlersProps {
  setPlatform: (platform: Platform) => void;
  setProductName: (name: string) => void;
  setViscosityGrade: (grade: string) => void;
  setManufacturer: (manufacturer: string) => void;
  setScrollPosition: (position: number) => void;
  products: Product[];
  productHistory: ProductHistory[];
}

/**
 * Custom hook for handling navigation between pages
 */
export const useNavigationHandlers = ({
  setPlatform,
  setProductName,
  setViscosityGrade,
  setManufacturer,
  setScrollPosition,
  products,
  productHistory
}: NavigationHandlersProps) => {
  const navigate = useNavigate();

  const handleProductClick = (history: SearchHistory) => {
    setPlatform(history.platform as Platform);
    setProductName(history.product_name);
    setViscosityGrade(history.viscosity_grade || '');
    setManufacturer(history.manufacturer || '');
    setScrollPosition(window.scrollY);
  };

  const handleProductHistoryItemClick = (history: ProductHistory) => {
    const product = products.find(p => p.id === history.product_id);
    if (product) {
      setPlatform(product.platform as Platform);
      setProductName(product.name);
      setViscosityGrade(product.viscosity_grade || '');
      setManufacturer(product.manufacturer || '');
      setScrollPosition(window.scrollY);
      navigate(`/product/${history.product_id}`);
    }
  };

  return {
    handleProductClick,
    handleProductHistoryItemClick
  };
};
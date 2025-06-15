import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { SearchFormProps } from '../types';
import { Combobox } from './Combobox';
import { ErrorDialog } from './ErrorDialog';
import { ERROR_MESSAGES } from '../lib/constants';

/**
 * Search form component for filtering products
 */
export function SearchForm({
  platform,
  setPlatform,
  viscosityGrade,
  setViscosityGrade,
  manufacturer,
  setManufacturer,
  productName,
  setProductName,
  onSubmit,
  onClear,
  isLoading,
  error,
  viscosityGrades,
  manufacturers
}: SearchFormProps) {
  // State
  const [showError, setShowError] = React.useState(false);
  const [errorField, setErrorField] = React.useState<'viscosity' | 'manufacturer'>('viscosity');
  const [isSearching, setIsSearching] = React.useState(false);

  const [filteredViscosityGrades, setFilteredViscosityGrades] = React.useState(viscosityGrades);
  const [filteredManufacturers, setFilteredManufacturers] = React.useState(manufacturers);
  const [showViscosityList, setShowViscosityList] = React.useState(false);
  const [showManufacturerList, setShowManufacturerList] = React.useState(false);
  const [viscositySearchTerm, setViscositySearchTerm] = React.useState('');
  const [manufacturerSearchTerm, setManufacturerSearchTerm] = React.useState('');

  // Refs
  const viscosityRef = useRef<HTMLDivElement>(null);
  const manufacturerRef = useRef<HTMLDivElement>(null);

  // Close lists when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viscosityRef.current && !viscosityRef.current.contains(event.target as Node)) {
        setShowViscosityList(false);
      }
      if (manufacturerRef.current && !manufacturerRef.current.contains(event.target as Node)) {
        setShowManufacturerList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on input
  const filteredOptions = useMemo(() => ({
    viscosityGrades: viscosityGrades.filter(grade => 
      grade.toLowerCase().includes(viscositySearchTerm.toLowerCase())
    ),
    manufacturers: manufacturers.filter(maker => 
      maker.toLowerCase().includes(manufacturerSearchTerm.toLowerCase())
    )
  }), [viscositySearchTerm, viscosityGrades, manufacturerSearchTerm, manufacturers]);

  // Update filtered lists when original lists change
  React.useEffect(() => {
    setFilteredViscosityGrades(viscosityGrades);
  }, [viscosityGrades]);

  React.useEffect(() => {
    setFilteredManufacturers(manufacturers);
  }, [manufacturers]);

  // Validation handlers
  const validateInput = (value: string, options: string[]): boolean => {
    return !value || options.includes(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('検索中にエラーが発生しました:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setViscosityGrade('');
    setManufacturer('');
    setProductName('');
    setViscositySearchTerm('');
    setManufacturerSearchTerm('');
    setFilteredViscosityGrades(viscosityGrades);
    setFilteredManufacturers(manufacturers);
    setShowViscosityList(false);
    setShowManufacturerList(false);
    onClear();
  };

  // Focus handling
  const handleErrorClosed = () => {
    const ref = errorField === 'viscosity' ? viscosityRef : manufacturerRef;
    const input = ref.current?.querySelector('input');
    if (input) {
      input.focus();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg shadow-blue-100/50 overflow-visible relative z-[50]">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">検索条件</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform and Product Name */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 lg:grid-cols-12">
            <div className="lg:col-span-3 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                プラットフォーム
              </label>
              <input
                type="text"
                value="Amazon"
                readOnly
                onFocus={(e) => e.target.blur()}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors bg-gray-50 cursor-default"
              />
            </div>

            <div className="lg:col-span-9 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                商品名
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="商品名を入力してください"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Amazon-specific filters */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 lg:grid-cols-12 mt-4">
            <div className="lg:col-span-4 space-y-2 relative" ref={viscosityRef}>
              <label className="block text-sm font-medium text-gray-700">
                粘度グレード（複数選択可）
              </label>
              {/* Selected viscosity grades */}
              {viscosityGrade && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {viscosityGrade.split(',').filter(Boolean).map((grade) => (
                    <span
                      key={grade}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {grade}
                      <button
                        type="button"
                        onClick={() => {
                          const grades = viscosityGrade.split(',').filter(g => g !== grade);
                          setViscosityGrade(grades.join(','));
                        }}
                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="粘度グレードを入力して絞り込み"
                  value={viscositySearchTerm}
                  onClick={() => setShowViscosityList(true)}
                  onChange={(e) => {
                    const searchTerm = e.target.value;
                    setViscositySearchTerm(searchTerm);
                    const filteredGrades = viscosityGrades.filter(grade =>
                      grade.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    setFilteredViscosityGrades(filteredGrades);
                    setShowViscosityList(true);
                  }}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  disabled={isLoading}
                />
                {showViscosityList && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-300 shadow-lg max-h-32 overflow-y-auto">
                    {filteredViscosityGrades.map((grade) => {
                      const isSelected = viscosityGrade.split(',').includes(grade);
                      return (
                        <div
                          key={grade}
                          onClick={() => {
                            const currentGrades = viscosityGrade.split(',').filter(Boolean);
                            const newGrades = isSelected
                              ? currentGrades.filter(g => g !== grade)
                              : [...currentGrades, grade];
                            setViscosityGrade(newGrades.join(','));
                            setViscositySearchTerm('');
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                            isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-900'
                          }`}
                        >
                          {grade}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2 relative" ref={manufacturerRef}>
              <label className="block text-sm font-medium text-gray-700">
                メーカー（複数選択可）
              </label>
              {/* Selected manufacturers */}
              {manufacturer && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {manufacturer.split(',').filter(Boolean).map((maker) => (
                    <span
                      key={maker}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800"
                    >
                      {maker}
                      <button
                        type="button"
                        onClick={() => {
                          const makers = manufacturer.split(',').filter(m => m !== maker);
                          setManufacturer(makers.join(','));
                        }}
                        className="ml-1.5 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="メーカーを入力して絞り込み"
                  value={manufacturerSearchTerm}
                  onClick={() => setShowManufacturerList(true)}
                  onChange={(e) => {
                    const searchTerm = e.target.value;
                    setManufacturerSearchTerm(searchTerm);
                    const filteredMakers = manufacturers.filter(maker =>
                      maker.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    setFilteredManufacturers(filteredMakers);
                    setShowManufacturerList(true);
                  }}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  disabled={isLoading}
                />
                {showManufacturerList && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-300 shadow-lg max-h-32 overflow-y-auto">
                    {filteredManufacturers.map((maker) => {
                      const isSelected = manufacturer.split(',').includes(maker);
                      return (
                        <div
                          key={maker}
                          onClick={() => {
                            const currentMakers = manufacturer.split(',').filter(Boolean);
                            const newMakers = isSelected
                              ? currentMakers.filter(m => m !== maker)
                              : [...currentMakers, maker];
                            setManufacturer(newMakers.join(','));
                            setManufacturerSearchTerm('');
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-green-50 ${
                            isSelected ? 'bg-green-100 text-green-800' : 'text-gray-900'
                          }`}
                        >
                          {maker}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex items-end justify-end space-x-4">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                クリア
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent hover:before:translate-x-[100%] before:transition-transform before:duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? '検索中...' : '商品検索'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Dialog */}
      {showError && (
        <ErrorDialog
          isOpen={showError}
          message={
            errorField === 'manufacturer'
              ? ERROR_MESSAGES.INVALID_MANUFACTURER
              : ERROR_MESSAGES.INVALID_VISCOSITY
          }
          onClose={() => setShowError(false)}
          onClosed={handleErrorClosed}
        />
      )}
    </div>
  );
}
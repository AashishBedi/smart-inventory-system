
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  available: number;
  onReserve: (sku: string) => void;
  isLoading: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, available, onReserve, isLoading }) => {
  const isSoldOut = available === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <div className="relative aspect-video">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        {available <= 3 && !isSoldOut && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            Only {available} Left!
          </div>
        )}
      </div>
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{product.name}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-extrabold text-slate-900">${product.price.toLocaleString()}</span>
          <div className="flex flex-col items-end">
            <span className={`text-sm font-medium ${isSoldOut ? 'text-red-500' : 'text-emerald-600'}`}>
              {isSoldOut ? 'Out of Stock' : `${available} Available`}
            </span>
          </div>
        </div>
      </div>
      <div className="p-5 pt-0 mt-auto">
        <button
          onClick={() => onReserve(product.sku)}
          disabled={isSoldOut || isLoading}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isSoldOut 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <><i className="fas fa-shopping-cart text-sm"></i> Reserve Now</>
          )}
        </button>
      </div>
    </div>
  );
};

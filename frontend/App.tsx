
import React, { useState, useEffect, useCallback } from 'react';
import { Product, Reservation, InventoryStats, AIInsight, ReservationStatus } from './types';
import { inventoryStore } from './services/inventoryService';
import { getInventoryInsights } from './services/geminiService';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { Countdown } from './components/Countdown';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Load initial data
  const refreshData = useCallback(() => {
    setProducts(inventoryStore.getProducts());
    setStats(inventoryStore.getStats());
  }, []);

  useEffect(() => {
    refreshData();
    // Poll for inventory changes to simulate high traffic
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Handle Notifications
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReserve = async (sku: string) => {
    if (activeReservation) {
      notify('error', 'You already have an active reservation. Complete or cancel it first.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await inventoryStore.reserve(sku, 'USER_001');
      setActiveReservation(res);
      notify('success', 'Item reserved! You have 5 minutes to checkout.');
      refreshData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!activeReservation) return;
    setIsProcessing(true);
    try {
      await inventoryStore.confirm(activeReservation.id);
      setActiveReservation(null);
      notify('success', 'Checkout successful! Your order is confirmed.');
      refreshData();
    } catch (err: any) {
      notify('error', err.message);
      if (err.message.includes('expired') || err.message.includes('not found')) {
        setActiveReservation(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!activeReservation) return;
    await inventoryStore.cancel(activeReservation.id);
    setActiveReservation(null);
    notify('info', 'Reservation cancelled. The item is now available for others.');
    refreshData();
  };

  const handleFetchInsights = async () => {
    setIsInsightLoading(true);
    try {
      const newInsights = await getInventoryInsights(stats);
      setInsights(newInsights);
    } finally {
      setIsInsightLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-boxes-stacked"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Flash Inventory</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Smart Reservation System</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Concurrency Tracking
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Notifications */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
            'bg-indigo-50 text-indigo-800 border border-indigo-100'
          }`}>
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check-circle' :
              notification.type === 'error' ? 'fa-exclamation-triangle' :
              'fa-info-circle'
            }`}></i>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Product Feed */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Flash Sale Items</h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                  <i className="fas fa-bolt text-amber-500"></i>
                  ENDING SOON
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map(product => {
                  const s = stats.find(st => st.sku === product.sku);
                  return (
                    <ProductCard
                      key={product.sku}
                      product={product}
                      available={s ? s.available : 0}
                      onReserve={handleReserve}
                      isLoading={isProcessing && activeReservation?.sku === product.sku}
                    />
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar / Admin Panel */}
          <div className="lg:col-span-4 space-y-6">
             <AdminPanel 
              stats={stats} 
              insights={insights} 
              isInsightLoading={isInsightLoading} 
              onRefreshInsights={handleFetchInsights}
            />
          </div>
        </div>
      </main>

      {/* Floating Reservation Status / Checkout UI */}
      {activeReservation && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-amber-500 px-6 py-2 flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Item Reserved</span>
              <div className="flex items-center gap-2 text-white">
                <i className="fas fa-clock text-xs"></i>
                <Countdown 
                  expiresAt={activeReservation.expiresAt} 
                  onExpire={() => {
                    setActiveReservation(null);
                    notify('error', 'Your reservation has expired.');
                  }} 
                />
              </div>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                    <i className="fas fa-shopping-bag text-slate-400"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {products.find(p => p.sku === activeReservation.sku)?.name || 'Product'}
                    </h4>
                    <p className="text-sm text-slate-500">Reserved until {new Date(activeReservation.expiresAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleCancel}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check-circle"></i> Confirm Purchase</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

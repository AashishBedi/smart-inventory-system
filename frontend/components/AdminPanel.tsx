
import React from 'react';
import { InventoryStats, AIInsight } from '../types';

interface AdminPanelProps {
  stats: InventoryStats[];
  insights: AIInsight[];
  isInsightLoading: boolean;
  onRefreshInsights: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ stats, insights, isInsightLoading, onRefreshInsights }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-chart-line text-indigo-500"></i>
          Real-time Inventory Monitor
        </h2>
        <button 
          onClick={onRefreshInsights}
          disabled={isInsightLoading}
          className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
        >
          {isInsightLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
          AI Insights
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {stats.map(s => {
          const insight = insights.find(i => i.sku === s.sku);
          return (
            <div key={s.sku} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-700">{s.sku}</div>
                  <div className="text-xs text-slate-500">Active Monitoring</div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avail</div>
                    <div className="text-sm font-bold text-slate-800">{s.available}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Resrv</div>
                    <div className="text-sm font-bold text-amber-600">{s.reserved}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sold</div>
                    <div className="text-sm font-bold text-emerald-600">{s.sold}</div>
                  </div>
                </div>
              </div>
              
              {insight && (
                <div className="mt-3 flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-100">
                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    insight.riskLevel === 'high' ? 'bg-red-500' : insight.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                  <p className="text-xs text-slate-600 italic">
                    <span className="font-bold uppercase text-[10px] mr-1">AI Recommendation:</span>
                    {insight.recommendation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-900 text-white p-4 rounded-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">System Status</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] font-medium">API: Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-[11px] font-medium">Redis Sync: Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-[11px] font-medium">TTL Engine: Running</span>
          </div>
        </div>
      </div>
    </div>
  );
};

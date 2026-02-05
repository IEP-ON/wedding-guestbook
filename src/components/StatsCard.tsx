'use client';

import { useState } from 'react';
import { WeddingStats } from '@/types/wedding';

interface StatsCardProps {
  stats: WeddingStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const [showSensitive, setShowSensitive] = useState(true);

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toLocaleString()}만`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const toggleSensitive = () => {
    setShowSensitive(!showSensitive);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold">{stats.totalGuests}</div>
          <div className="text-xs opacity-80">인원</div>
        </div>
        
        <div 
          className="border-x border-white/20 cursor-pointer hover:bg-white/10 rounded transition-colors"
          onClick={toggleSensitive}
          title="클릭하여 표시/숨김"
        >
          <div className="text-2xl font-bold" style={{ filter: showSensitive ? 'none' : 'blur(8px)' }}>
            {formatAmount(stats.totalAmount)}
          </div>
          <div className="text-xs opacity-80">총액 {!showSensitive && '🔒'}</div>
        </div>
        
        <div 
          className="border-r border-white/20 cursor-pointer hover:bg-white/10 rounded transition-colors"
          onClick={toggleSensitive}
          title="클릭하여 표시/숨김"
        >
          <div className="text-2xl font-bold" style={{ filter: showSensitive ? 'none' : 'blur(8px)' }}>
            {formatAmount(stats.averageAmount)}
          </div>
          <div className="text-xs opacity-80">평균 {!showSensitive && '🔒'}</div>
        </div>

        <div>
          <div className="text-2xl font-bold">{stats.totalMealTickets}</div>
          <div className="text-xs opacity-80">식권</div>
        </div>
      </div>
    </div>
  );
}

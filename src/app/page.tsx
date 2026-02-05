'use client';

import { useState, useEffect } from 'react';
import { GuestForm } from '@/components/GuestForm';
import { GuestList } from '@/components/GuestList';
import { StatsCard } from '@/components/StatsCard';
import { GuestbookDocument } from '@/components/GuestbookDocument';
import { useWeddingData } from '@/hooks/useWeddingData';
import { WeddingGuest } from '@/types/wedding';
import { exportToCSV } from '@/utils/exportCSV';

export default function Home() {
  const { guests, isLoading, addGuest, removeGuest, updateGuest, getStats } = useWeddingData();
  const [highlightId, setHighlightId] = useState<string>('');
  const stats = getStats();

  const nextEnvelopeNumber = guests.length > 0 
    ? Math.max(...guests.map(g => g.envelopeNumber || 0)) + 1 
    : 1;

  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        setHighlightId('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  const handleAddGuest = async (guestData: Omit<WeddingGuest, 'id' | 'timestamp' | 'envelopeNumber'>) => {
    const newGuest = await addGuest(guestData);
    setHighlightId(newGuest.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const date = new Date().toISOString().slice(0, 10);
    exportToCSV(guests, `축의금명부_${date}.csv`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden print:hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-2 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-900">축의금 기록부</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={guests.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={guests.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PDF
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input Form (Hidden on mobile) */}
          <div className="hidden md:block md:w-[38%] bg-white border-r p-4 overflow-y-auto custom-scrollbar">
            <GuestForm onSubmit={handleAddGuest} nextEnvelopeNumber={nextEnvelopeNumber} />
          </div>

          {/* Right Panel - Stats & List (Full width on mobile) */}
          <div className="w-full md:w-[62%] bg-gray-50 p-4 flex flex-col overflow-hidden gap-4">
            <div className="shrink-0">
              <StatsCard stats={stats} />
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <GuestList 
                guests={guests} 
                onDelete={removeGuest}
                onUpdate={updateGuest}
                highlightId={highlightId}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Hidden Print Document */}
      <GuestbookDocument guests={guests} />
    </>
  );
}

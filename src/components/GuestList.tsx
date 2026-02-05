'use client';

import { useState } from 'react';
import { WeddingGuest } from '@/types/wedding';

interface GuestListProps {
  guests: WeddingGuest[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WeddingGuest>) => void;
  highlightId?: string;
}

function formatRemarks(guest: WeddingGuest): string {
  const parts: string[] = [];
  
  if (guest.mealTickets > 0) {
    parts.push(`식권 ${guest.mealTickets}장`);
  }
  
  if (guest.message) {
    parts.push(guest.message);
  }
  
  return parts.join(' · ') || '-';
}

export function GuestList({ guests, onDelete, onUpdate, highlightId }: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WeddingGuest>>({});
  
  const sortedGuests = [...guests].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredGuests = searchTerm 
    ? sortedGuests.filter(g => 
        g.name.includes(searchTerm) || 
        g.envelopeNumber.toString().includes(searchTerm)
      )
    : sortedGuests;

  const formatAmount = (amount: number) => {
    if (amount === 0) return '-';
    if (amount >= 10000) {
      return `${(amount / 10000).toLocaleString()}만`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const startEdit = (guest: WeddingGuest) => {
    setEditingId(guest.id);
    setEditData({
      name: guest.name,
      amount: guest.amount,
      mealTickets: guest.mealTickets,
      message: guest.message
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  if (guests.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-xl font-medium">아직 등록된 내역이 없습니다</p>
        <p className="text-base mt-2">좌측에서 축의금을 등록해주세요</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 검색 및 헤더 */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="text-sm text-gray-600 font-medium">
            총 {guests.length}건 (최신순)
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름/번호 검색"
            className="px-3 py-2 md:py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-full md:w-60"
          />
        </div>
        
        {/* 테이블 헤더 (데스크탑 전용) */}
        <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-bold text-gray-500 border-b border-gray-200 pb-2">
          <div className="col-span-1 text-center">No.</div>
          <div className="col-span-2">성명</div>
          <div className="col-span-2 text-right">축의금</div>
          <div className="col-span-6">비고</div>
          <div className="col-span-1"></div>
        </div>
      </div>
      
      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 md:space-y-1 custom-scrollbar">
        {filteredGuests.map((guest) => (
          <div
            key={guest.id}
            className={`rounded-lg transition-all duration-300 p-3 md:py-3 md:px-2 ${
              highlightId === guest.id 
                ? 'bg-blue-100 border-2 border-blue-400 shadow-md' 
                : editingId === guest.id
                ? 'bg-yellow-50 border-2 border-yellow-400'
                : 'bg-white border border-gray-100 hover:bg-gray-50 shadow-sm md:shadow-none'
            }`}
          >
            {editingId === guest.id ? (
              <div className="w-full">
                {/* 모바일 편집 모드 */}
                <div className="md:hidden space-y-3">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-gray-500 w-8 text-center">{guest.envelopeNumber}</span>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 text-base border border-gray-300 rounded"
                      placeholder="이름"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editData.amount?.toLocaleString() || ''}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/[^0-9]/g, '');
                        setEditData(prev => ({ ...prev, amount: numeric ? parseInt(numeric) : 0 }));
                      }}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded text-right font-bold text-blue-600"
                      placeholder="금액"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">식권</span>
                    <input
                      type="number"
                      value={editData.mealTickets || 0}
                      onChange={(e) => setEditData(prev => ({ ...prev, mealTickets: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded text-center"
                      min="0"
                    />
                  </div>
                  <input
                    type="text"
                    value={editData.message || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    placeholder="비고를 입력하세요"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(guest.id)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                    >
                      취소
                    </button>
                  </div>
                </div>

                {/* 데스크탑 편집 모드 */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center text-sm font-bold text-gray-600">
                    {guest.envelopeNumber}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={editData.amount?.toLocaleString() || ''}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/[^0-9]/g, '');
                        setEditData(prev => ({ ...prev, amount: numeric ? parseInt(numeric) : 0 }));
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right"
                    />
                  </div>
                  <div className="col-span-5 flex gap-1 items-center text-xs">
                    <span>식권</span>
                    <input
                      type="number"
                      value={editData.mealTickets || 0}
                      onChange={(e) => setEditData(prev => ({ ...prev, mealTickets: parseInt(e.target.value) || 0 }))}
                      className="w-16 px-1 py-1 border border-gray-300 rounded text-center"
                      min="0"
                    />
                    <input 
                      type="text"
                      value={editData.message || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, message: e.target.value }))}
                      className="flex-1 px-1 py-1 border border-gray-300 rounded"
                      placeholder="비고"
                    />
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <button
                      onClick={() => saveEdit(guest.id)}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {/* 모바일 일반 모드 */}
                <div className="md:hidden flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                        {guest.envelopeNumber || '-'}
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        {guest.name}
                      </span>
                    </div>
                    <span className={`font-bold text-lg ${guest.amount === 0 ? 'text-gray-300' : 'text-blue-600'}`}>
                      {formatAmount(guest.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-1">
                    <span className="text-sm text-gray-500 truncate max-w-[180px]">
                      {formatRemarks(guest)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(guest)}
                        className="px-3 py-1.5 bg-gray-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${guest.name}님의 기록을 삭제하시겠습니까?`)) {
                            onDelete(guest.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>

                {/* 데스크탑 일반 모드 */}
                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                      {guest.envelopeNumber || '-'}
                    </span>
                  </div>
                  <div className="col-span-2 font-bold text-gray-900 truncate">
                    {guest.name}
                  </div>
                  <div className={`col-span-2 text-right font-bold ${guest.amount === 0 ? 'text-gray-300' : 'text-blue-600'}`}>
                    {formatAmount(guest.amount)}
                  </div>
                  <div className="col-span-6 text-sm text-gray-600 truncate">
                    {formatRemarks(guest)}
                  </div>
                  <div className="col-span-1 flex gap-1 justify-end">
                    <button
                      onClick={() => startEdit(guest)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${guest.name}님의 기록을 삭제하시겠습니까?`)) {
                          onDelete(guest.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

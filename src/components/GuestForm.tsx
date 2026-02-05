'use client';

import { useState, useRef, useEffect } from 'react';
import { WeddingGuest } from '@/types/wedding';
import { numberToKorean } from '@/utils/currency';

interface GuestFormProps {
  onSubmit: (guest: Omit<WeddingGuest, 'id' | 'timestamp' | 'envelopeNumber'>) => void;
  nextEnvelopeNumber: number;
}

const QUICK_AMOUNTS = [
  { label: '3만', value: 30000 },
  { label: '5만', value: 50000 },
  { label: '10만', value: 100000 },
  { label: '20만', value: 200000 },
  { label: '30만', value: 300000 },
  { label: '50만', value: 500000 },
];

export function GuestForm({ onSubmit, nextEnvelopeNumber }: GuestFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    mealTickets: 0,
    message: ''
  });
  
  const [showMessage, setShowMessage] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const amountStr = formData.amount.replace(/[^0-9]/g, '');
    const amount = amountStr ? parseInt(amountStr) : 0;

    onSubmit({
      name: formData.name.trim(),
      amount,
      mealTickets: formData.mealTickets,
      message: formData.message.trim() || undefined
    });

    setFormData({
      name: '',
      amount: '',
      mealTickets: 0,
      message: ''
    });

    nameInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, amount: numeric }));
  };

  const addToAmount = (value: number) => {
    setFormData(prev => {
      const currentAmount = prev.amount ? parseInt(prev.amount) : 0;
      return { ...prev, amount: (currentAmount + value).toString() };
    });
    amountInputRef.current?.focus();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      mealTickets: 0,
      message: ''
    });
    nameInputRef.current?.focus();
  };

  const adjustMealTickets = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      mealTickets: Math.max(0, prev.mealTickets + delta)
    }));
  };

  const koreanAmount = formData.amount ? numberToKorean(parseInt(formData.amount)) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
      {/* 상단 영역: 봉투번호 & 초기화 */}
      <div className="flex gap-2">
        <div className="flex-1 bg-blue-600 text-white rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="text-blue-200 text-xs font-bold mb-0.5">다음 봉투 번호</div>
          <div className="text-4xl font-black leading-none tracking-tight">{nextEnvelopeNumber}</div>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="px-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-xl font-medium text-sm transition-colors border-2 border-transparent hover:border-red-200 flex flex-col items-center justify-center gap-1 min-w-[4.5rem]"
        >
          <span className="text-xl">↺</span>
          <span>초기화</span>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-1 py-1">
        {/* 이름 입력 */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-base font-bold text-gray-700 ml-1">
            성명 <span className="text-red-500">*</span>
          </label>
          <input
            ref={nameInputRef}
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value.slice(0, 10);
              setFormData(prev => ({ ...prev, name: val }));
            }}
            onKeyDown={(e) => handleKeyDown(e, amountInputRef)}
            className="w-full px-4 py-4 text-3xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm placeholder-gray-300"
            placeholder="이름 입력"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            required
            maxLength={10}
          />
        </div>

        {/* 금액 입력 */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="block text-base font-bold text-gray-700 ml-1">
            축의금
          </label>
          <div className="relative">
            <input
              ref={amountInputRef}
              type="text"
              id="amount"
              inputMode="numeric"
              value={formData.amount ? parseInt(formData.amount).toLocaleString() : ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full px-4 py-3.5 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm text-right pr-12 placeholder-gray-300"
              placeholder="0 (선택)"
              autoComplete="off"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-bold">
              원
            </span>
          </div>
          {/* 한국어 금액 표시 (고정 높이) */}
          <div className="h-7 text-right text-blue-600 font-bold text-lg flex items-center justify-end">
            {koreanAmount || <span className="invisible">금액을 입력하세요</span>}
          </div>
        </div>

        {/* 빠른 금액 버튼 */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 ml-1">빠른 가산</div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt.label}
                type="button"
                onClick={() => addToAmount(amt.value)}
                className="py-3 px-1 bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 active:border-blue-300 text-gray-700 rounded-xl font-bold text-lg transition-all touch-manipulation shadow-sm"
              >
                +{amt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 식권 카운터 */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-700 ml-1">
            식권 (대/소인 공통)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-between bg-gray-50 border-2 border-gray-100 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => adjustMealTickets(-1)}
                className="w-14 h-14 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 text-gray-600 font-bold text-2xl rounded-lg transition-all touch-manipulation flex items-center justify-center shadow-sm"
              >
                −
              </button>
              <span className="text-3xl font-black text-gray-800 min-w-[60px] text-center">
                {formData.mealTickets}
              </span>
              <button
                type="button"
                onClick={() => adjustMealTickets(1)}
                className="w-14 h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-2xl rounded-lg transition-colors touch-manipulation flex items-center justify-center shadow-md"
              >
                +
              </button>
            </div>
            <span className="text-lg text-gray-500 font-medium whitespace-nowrap px-2">장</span>
          </div>
        </div>

        {/* 비고/특이사항 토글 */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowMessage(!showMessage)}
            className="w-full text-left text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2 text-sm py-2 group"
          >
            <span className="group-hover:text-blue-600 transition-colors">{showMessage ? '▼' : '▶'}</span>
            <span>비고 / 특이사항 입력 {showMessage ? '' : '(선택)'}</span>
          </button>
          
          {showMessage && (
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={2}
              className="w-full mt-1 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-600 transition-all resize-none"
              placeholder="특이사항을 입력하세요"
            />
          )}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        className="w-full bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-bold py-4 px-6 rounded-xl text-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 mt-auto"
      >
        <span>#{nextEnvelopeNumber}번 등록하기</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </form>
  );
}

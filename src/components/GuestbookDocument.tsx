'use client';

import { WeddingGuest } from '@/types/wedding';
import { formatCurrency, numberToKorean } from '@/utils/currency';

interface GuestbookDocumentProps {
  guests: WeddingGuest[];
  title?: string;
}

function formatRemarks(guest: WeddingGuest): string {
  const parts: string[] = [];
  
  if (guest.mealTickets > 0) {
    parts.push(`식권 ${guest.mealTickets}장`);
  }
  
  if (guest.message) {
    parts.push(guest.message);
  }
  
  return parts.join(' · ') || '';
}

export function GuestbookDocument({ guests, title = 'Guest Book' }: GuestbookDocumentProps) {
  const totalAmount = guests.reduce((sum, guest) => sum + guest.amount, 0);
  const totalMealTickets = guests.reduce((sum, guest) => sum + (guest.mealTickets || 0), 0);

  const sortedGuests = [...guests].sort((a, b) => a.envelopeNumber - b.envelopeNumber);

  const ITEMS_PER_PAGE = 20;
  const pages: WeddingGuest[][] = [];
  for (let i = 0; i < sortedGuests.length; i += ITEMS_PER_PAGE) {
    pages.push(sortedGuests.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <div className="hidden print:block print:w-full bg-white text-black font-serif">
      {pages.map((pageGuests, pageIndex) => (
        <div key={pageIndex} className="print-page p-8" style={{ pageBreakAfter: 'always' }}>
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold tracking-widest italic">{title}</h1>
            {pageIndex === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="py-2 px-3 w-16 text-center font-bold">번호</th>
                <th className="py-2 px-3 w-32 text-center font-bold">성 명</th>
                <th className="py-2 px-3 w-40 text-center font-bold">축의금 및 선물</th>
                <th className="py-2 px-3 text-center font-bold">비 고</th>
              </tr>
            </thead>
            <tbody>
              {pageGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-center text-gray-600">
                    {guest.envelopeNumber}
                  </td>
                  <td className="py-2 px-3 text-center font-medium">
                    {guest.name}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {guest.amount > 0 ? formatCurrency(guest.amount) : '-'}
                  </td>
                  <td className="py-2 px-3 text-left text-gray-600 text-xs">
                    {formatRemarks(guest)}
                  </td>
                </tr>
              ))}
              
              {/* 빈 줄 채우기 (20줄 맞추기) */}
              {Array.from({ length: ITEMS_PER_PAGE - pageGuests.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-center text-gray-300">
                    {(pageIndex * ITEMS_PER_PAGE) + pageGuests.length + i + 1}
                  </td>
                  <td className="py-2 px-3">&nbsp;</td>
                  <td className="py-2 px-3">&nbsp;</td>
                  <td className="py-2 px-3">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지 번호 */}
          <div className="text-center text-xs text-gray-400 mt-4">
            {pageIndex + 1} / {pages.length}
          </div>
        </div>
      ))}

      {/* 마지막 페이지: 합계 */}
      <div className="print-page p-8">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold tracking-widest">합 계</h1>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-gray-300">
            <span className="text-xl font-medium">총 인원</span>
            <span className="text-2xl font-bold">{guests.length}명</span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-b border-gray-300">
            <span className="text-xl font-medium">축의금 합계</span>
            <span className="text-2xl font-bold text-blue-700">{formatCurrency(totalAmount)}</span>
          </div>
          
          <div className="text-right text-lg text-gray-600 -mt-2">
            {numberToKorean(totalAmount)}
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-300">
            <span className="text-xl font-medium">식권 합계</span>
            <span className="text-2xl font-bold">{totalMealTickets}장</span>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>위와 같이 정히 영수함.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print-page {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

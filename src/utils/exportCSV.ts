import { WeddingGuest } from '@/types/wedding';

export function exportToCSV(guests: WeddingGuest[], filename: string = 'wedding-guests.csv'): void {
  const headers = [
    '번호',
    '성명',
    '축의금',
    '식권',
    '비고',
    '등록시간'
  ];

  const sortedGuests = [...guests].sort((a, b) => a.envelopeNumber - b.envelopeNumber);

  const rows = sortedGuests.map(guest => [
    guest.envelopeNumber,
    guest.name,
    guest.amount,
    guest.mealTickets || 0,
    guest.message || '',
    new Date(guest.timestamp).toLocaleString('ko-KR')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface WeddingGuest {
  id: string;
  envelopeNumber: number;
  name: string;
  amount: number;
  mealTickets: number;
  message?: string;
  timestamp: Date;
}

export interface WeddingStats {
  totalGuests: number;
  totalAmount: number;
  averageAmount: number;
  totalMealTickets: number;
}

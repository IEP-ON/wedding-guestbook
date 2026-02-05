'use client';

import { useState, useEffect } from 'react';
import { WeddingGuest, WeddingStats } from '@/types/wedding';

const STORAGE_KEY = 'wedding-guests';

export function useWeddingData() {
  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedGuests = JSON.parse(stored).map((guest: any) => ({
          ...guest,
          timestamp: new Date(guest.timestamp)
        }));
        setGuests(parsedGuests);
      } catch (error) {
        console.error('Failed to load wedding data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const saveGuests = (newGuests: WeddingGuest[]) => {
    setGuests(newGuests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGuests));
  };

  const addGuest = (guest: Omit<WeddingGuest, 'id' | 'timestamp' | 'envelopeNumber'>) => {
    const maxEnvelopeNumber = guests.length > 0 
      ? Math.max(...guests.map(g => g.envelopeNumber || 0)) 
      : 0;
    const newGuest: WeddingGuest = {
      ...guest,
      id: Date.now().toString(),
      envelopeNumber: maxEnvelopeNumber + 1,
      timestamp: new Date()
    };
    saveGuests([...guests, newGuest]);
    return newGuest;
  };

  const removeGuest = (id: string) => {
    saveGuests(guests.filter(guest => guest.id !== id));
  };

  const updateGuest = (id: string, updates: Partial<WeddingGuest>) => {
    saveGuests(guests.map(guest => 
      guest.id === id ? { ...guest, ...updates } : guest
    ));
  };

  const clearAll = () => {
    saveGuests([]);
  };

  const getStats = (): WeddingStats => {
    const totalGuests = guests.length;
    const totalAmount = guests.reduce((sum, guest) => sum + guest.amount, 0);
    const averageAmount = totalGuests > 0 ? Math.round(totalAmount / totalGuests) : 0;
    const totalMealTickets = guests.reduce((sum, guest) => sum + (guest.mealTickets || 0), 0);

    return {
      totalGuests,
      totalAmount,
      averageAmount,
      totalMealTickets
    };
  };

  return {
    guests,
    isLoading,
    addGuest,
    removeGuest,
    updateGuest,
    clearAll,
    getStats
  };
}

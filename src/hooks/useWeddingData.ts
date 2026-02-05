'use client';

import { useState, useEffect } from 'react';
import { WeddingGuest, WeddingStats } from '@/types/wedding';
import { supabase } from '@/lib/supabase';

export function useWeddingData() {
  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedGuests: WeddingGuest[] = data.map(guest => ({
          id: guest.id,
          envelopeNumber: guest.envelope_number,
          name: guest.name,
          amount: guest.amount,
          mealTickets: guest.meal_tickets,
          message: guest.message,
          timestamp: new Date(guest.timestamp)
        }));
        setGuests(parsedGuests);
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();

    const channel = supabase
      .channel('wedding-guests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests'
        },
        () => {
          fetchGuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addGuest = async (guestData: Omit<WeddingGuest, 'id' | 'timestamp' | 'envelopeNumber'>) => {
    const maxEnvelopeNumber = guests.length > 0 
      ? Math.max(...guests.map(g => g.envelopeNumber || 0)) 
      : 0;
    
    const newEnvelopeNumber = maxEnvelopeNumber + 1;

    const { data, error } = await supabase
      .from('guests')
      .insert([
        {
          name: guestData.name,
          amount: guestData.amount,
          meal_tickets: guestData.mealTickets,
          message: guestData.message,
          envelope_number: newEnvelopeNumber,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding guest:', error);
      throw error;
    }

    const newGuest: WeddingGuest = {
      id: data.id,
      envelopeNumber: data.envelope_number,
      name: data.name,
      amount: data.amount,
      mealTickets: data.meal_tickets,
      message: data.message,
      timestamp: new Date(data.timestamp)
    };
    
    return newGuest;
  };

  const removeGuest = async (id: string) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing guest:', error);
    }
  };

  const updateGuest = async (id: string, updates: Partial<WeddingGuest>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.mealTickets !== undefined) dbUpdates.meal_tickets = updates.mealTickets;
    if (updates.message !== undefined) dbUpdates.message = updates.message;
    if (updates.envelopeNumber !== undefined) dbUpdates.envelope_number = updates.envelopeNumber;

    const { error } = await supabase
      .from('guests')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating guest:', error);
    }
  };

  const clearAll = async () => {
    // 안전을 위해 구현하지 않음
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

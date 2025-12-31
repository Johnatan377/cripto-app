import { supabase } from './supabaseClient';
import { TickerAnnouncement } from '../types';

export const fetchTickerAnnouncements = async (): Promise<TickerAnnouncement[]> => {
    try {
        const { data, error } = await supabase
            .from('ticker_announcements')
            .select('*')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data as TickerAnnouncement[];
    } catch (err) {
        console.error('Unexpected error fetching ticker announcements (Supabase):', err);
        return [];
    }
};

export const createTickerAnnouncement = async (announcement: Omit<TickerAnnouncement, 'id' | 'created_at'>): Promise<TickerAnnouncement | null> => {
    try {
        const newAnnouncement = {
            ...announcement,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('ticker_announcements')
            .insert([newAnnouncement])
            .select()
            .single();

        if (error) throw error;
        return data as TickerAnnouncement;

    } catch (err) {
        console.error('Unexpected error creating ticker announcement:', err);
        return null;
    }
};

export const updateTickerAnnouncement = async (id: string, updates: Partial<TickerAnnouncement>): Promise<TickerAnnouncement | null> => {
    try {
        const { data, error } = await supabase
            .from('ticker_announcements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as TickerAnnouncement;
    } catch (err) {
        console.error('Unexpected error updating ticker announcement:', err);
        return null;
    }
};

export const deleteTickerAnnouncement = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('ticker_announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Unexpected error deleting ticker announcement:', err);
        return false;
    }
};


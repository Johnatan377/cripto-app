
import { supabase } from './supabaseClient';
import { AirdropProject } from '../types';

export const fetchAirdrops = async (): Promise<AirdropProject[]> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching airdrops:', error);
            return [];
        }

        return data as AirdropProject[];
    } catch (err) {
        console.error('Unexpected error fetching airdrops:', err);
        return [];
    }
};

export const getAirdropById = async (id: string): Promise<AirdropProject | null> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching airdrop details:', error);
            return null;
        }

        return data as AirdropProject;
    } catch (err) {
        console.error('Unexpected error fetching airdrop details:', err);
        return null;
    }
}

export const createAirdrop = async (project: Omit<AirdropProject, 'id' | 'created_at'>): Promise<AirdropProject | null> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .insert(project)
            .select()
            .single();

        if (error) {
            console.error('Error creating airdrop:', error);
            return null;
        }

        return data as AirdropProject;
    } catch (err) {
        console.error('Unexpected error creating airdrop:', err);
        return null;
    }
};

export const updateAirdrop = async (id: string, updates: Partial<AirdropProject>): Promise<AirdropProject | null> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating airdrop:', error);
            return null;
        }

        return data as AirdropProject;
    } catch (err) {
        console.error('Unexpected error updating airdrop:', err);
        return null;
    }
};

export const deleteAirdrop = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('airdrops')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting airdrop:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Unexpected error deleting airdrop:', err);
        return false;
    }
};

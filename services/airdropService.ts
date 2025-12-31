import { supabase } from './supabaseClient';
import { AirdropProject } from '../types';

export const getCachedAirdrops = (): AirdropProject[] => {
    try {
        const cached = localStorage.getItem('cached_airdrops');
        return cached ? JSON.parse(cached) : [];
    } catch (e) {
        console.error("airdropService: Error reading cache", e);
        return [];
    }
};

export const fetchAirdrops = async (): Promise<AirdropProject[]> => {
    try {
        console.log("airdropService: Fetching airdrops from Supabase...");
        
        const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const airdrops = data as AirdropProject[];

        if (airdrops) {
            console.log(`airdropService: Successfully fetched ${airdrops.length} airdrops. Updating cache.`);
            localStorage.setItem('cached_airdrops', JSON.stringify(airdrops));
        }

        return airdrops;
    } catch (err) {
        console.error('airdropService: Unexpected error (Supabase):', err);
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
        console.log("AdminView: Attempting to create airdrop in Supabase:", project);
        
        const projectWithDate = {
            ...project,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('airdrops')
            .insert([projectWithDate])
            .select()
            .single();

        if (error) throw error;
        
        console.log("AdminView: Airdrop created successfully:", data);
        return data as AirdropProject;
    } catch (err: any) {
        console.error('Unexpected error creating airdrop (Supabase):', err);
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

        if (error) throw error;

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

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Unexpected error deleting airdrop:', err);
        return false;
    }
};


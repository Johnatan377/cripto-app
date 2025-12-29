
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy } from 'firebase/firestore';
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
        console.log("airdropService: Fetching airdrops from Firebase...");
        
        // Firestore doesn't guarantee order without an index, but simple fetching works.
        // Ideally: const q = query(collection(db, 'airdrops'), orderBy('created_at', 'desc'));
        // For now, let's fetch all and sort in memory if needed, or use simple collection ref.
        const airdropsCollection = collection(db, 'airdrops');
        const snapshot = await getDocs(airdropsCollection);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AirdropProject[];

        // Sort by created_at desc in memory to ensure consistency
        data.sort((a, b) => {
             const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
             const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
             return dateB - dateA;
        });

        if (data) {
            console.log(`airdropService: Successfully fetched ${data.length} airdrops. Updating cache.`);
            localStorage.setItem('cached_airdrops', JSON.stringify(data));
        }

        return data;
    } catch (err) {
        console.error('airdropService: Unexpected error (Firebase):', err);
        return [];
    }
};

export const getAirdropById = async (id: string): Promise<AirdropProject | null> => {
    try {
        const docRef = doc(db, 'airdrops', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as AirdropProject;
        } else {
            console.error('Error fetching airdrop details: Document not found');
            return null;
        }
    } catch (err) {
        console.error('Unexpected error fetching airdrop details:', err);
        return null;
    }
}

export const createAirdrop = async (project: Omit<AirdropProject, 'id' | 'created_at'>): Promise<AirdropProject | null> => {
    try {
        console.log("AdminView: Attempting to create airdrop in Firebase:", project);
        
        const projectWithDate = {
            ...project,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'airdrops'), projectWithDate);

        const newProject = { id: docRef.id, ...projectWithDate } as AirdropProject;
        
        console.log("AdminView: Airdrop created successfully:", newProject);
        return newProject;
    } catch (err: any) {
        console.error('Unexpected error creating airdrop (Firebase):', err);
        return null;
    }
};

export const updateAirdrop = async (id: string, updates: Partial<AirdropProject>): Promise<AirdropProject | null> => {
    try {
        const docRef = doc(db, 'airdrops', id);
        await updateDoc(docRef, updates);

        // Fetch updated doc to return consistent object
        const updatedSnap = await getDoc(docRef);
        return { id: updatedSnap.id, ...updatedSnap.data() } as AirdropProject;
    } catch (err) {
        console.error('Unexpected error updating airdrop:', err);
        return null;
    }
};

export const deleteAirdrop = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, 'airdrops', id));
        return true;
    } catch (err) {
        console.error('Unexpected error deleting airdrop:', err);
        return false;
    }
};

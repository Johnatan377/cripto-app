
import { db } from './firebaseClient';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy,
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';
import { AirdropProject } from '../types';


const COLLECTION_NAME = 'airdrops';

const formatDoc = (doc: any) => {
    const data = doc.data();
    const formatted: any = { id: doc.id, ...data };
    if (data.created_at && typeof data.created_at.toDate === 'function') {
        formatted.created_at = data.created_at.toDate().toISOString();
    }
    return formatted as AirdropProject;
};

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
        const airdropsCol = collection(db, COLLECTION_NAME);
        const airdropQuery = query(airdropsCol, orderBy('created_at', 'desc'));
        const airdropSnapshot = await getDocs(airdropQuery);
        
        const data = airdropSnapshot.docs.map(formatDoc);

        console.log(`airdropService: Successfully fetched ${data.length} airdrops. Updating cache.`);
        localStorage.setItem('cached_airdrops', JSON.stringify(data));

        return data;
    } catch (err) {
        console.error('airdropService: Unexpected error:', err);
        return getCachedAirdrops(); // Fallback to cache on error
    }
};

export const getAirdropById = async (id: string): Promise<AirdropProject | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return formatDoc(docSnap);
        } else {
            console.error('No such airdrop!');
            return null;
        }
    } catch (err) {
        console.error('Unexpected error fetching airdrop details:', err);
        return null;
    }
}

export const createAirdrop = async (project: Omit<AirdropProject, 'id' | 'created_at'>): Promise<AirdropProject | null> => {
    try {
        console.log("airdropService: Attempting to create airdrop in Firebase:", project);
        const airdropsCol = collection(db, COLLECTION_NAME);
        const docRef = await addDoc(airdropsCol, {
            ...project,
            created_at: serverTimestamp()
        });

        const newDoc = await getDoc(docRef);
        return formatDoc(newDoc);
    } catch (err: any) {
        console.error('Unexpected error creating airdrop in Firebase:', err);
        return null;
    }
};

export const updateAirdrop = async (id: string, updates: Partial<AirdropProject>): Promise<AirdropProject | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const { id: _, created_at, ...cleanUpdates } = updates as any;
        
        await updateDoc(docRef, cleanUpdates);
        
        const updatedDoc = await getDoc(docRef);
        return formatDoc(updatedDoc);
    } catch (err) {
        console.error('Unexpected error updating airdrop in Firebase:', err);
        return null;
    }
};

export const deleteAirdrop = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return true;
    } catch (err) {
        console.error('Unexpected error deleting airdrop in Firebase:', err);
        return false;
    }
};

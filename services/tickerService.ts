
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
    serverTimestamp 
} from 'firebase/firestore';
import { TickerAnnouncement } from '../types';


const COLLECTION_NAME = 'ticker_announcements';

const formatDoc = (doc: any) => {
    const data = doc.data();
    const formatted: any = { id: doc.id, ...data };
    if (data.created_at && typeof data.created_at.toDate === 'function') {
        formatted.created_at = data.created_at.toDate().toISOString();
    }
    return formatted as TickerAnnouncement;
};

export const fetchTickerAnnouncements = async (): Promise<TickerAnnouncement[]> => {
    try {
        console.log('[TickerService] Fetching all announcements...');
        const tickerCol = collection(db, COLLECTION_NAME);
        
        // Buscar todos sem filtro ou ordem complexa para garantir que nada seja omitido
        const tickerSnapshot = await getDocs(tickerCol);
        console.log(`[TickerService] Found ${tickerSnapshot.size} documents in Firestore`);
        
        const all = tickerSnapshot.docs.map(d => {
            const data = d.data();
            const formatted = formatDoc(d);
            console.log(`[TickerService] Item: ${formatted.id} - ${formatted.content_pt} (Active: ${formatted.active})`);
            return formatted;
        });
        
        // Ordenar em memória
        return all.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
    } catch (err) {
        console.error('[TickerService] Error fetching ticker announcements:', err);
        return [];
    }
};

export const createTickerAnnouncement = async (announcement: Omit<TickerAnnouncement, 'id' | 'created_at'>): Promise<TickerAnnouncement | null> => {
    try {
        const tickerCol = collection(db, COLLECTION_NAME);
        const docRef = await addDoc(tickerCol, {
            ...announcement,
            created_at: serverTimestamp()
        });

        const newDoc = await getDoc(docRef);
        return formatDoc(newDoc);
    } catch (err) {
        console.error('Error creating ticker announcement in Firebase:', err);
        return null;
    }
};

export const updateTickerAnnouncement = async (id: string, updates: Partial<TickerAnnouncement>): Promise<TickerAnnouncement | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const { id: _, created_at, ...cleanUpdates } = updates as any;
        
        await updateDoc(docRef, cleanUpdates);
        
        const updatedDoc = await getDoc(docRef);
        return formatDoc(updatedDoc);
    } catch (err) {
        console.error('Error updating ticker announcement in Firebase:', err);
        return null;
    }
};

export const deleteTickerAnnouncement = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return true;
    } catch (err) {
        console.error('Error deleting ticker announcement from Firebase:', err);
        return false;
    }
};

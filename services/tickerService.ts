
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { TickerAnnouncement } from '../types';

export const fetchTickerAnnouncements = async (): Promise<TickerAnnouncement[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'ticker_announcements'));
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TickerAnnouncement[];

        // Sort by priority desc, then created_at desc
        // Doing in-memory sort to avoid complex index requirements initially
        data.sort((a, b) => {
            const pA = a.priority || 0;
            const pB = b.priority || 0;
            if (pA !== pB) {
                return pB - pA;
            }
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        return data;
    } catch (err) {
        console.error('Unexpected error fetching ticker announcements (Firebase):', err);
        return [];
    }
};

export const createTickerAnnouncement = async (announcement: Omit<TickerAnnouncement, 'id' | 'created_at'>): Promise<TickerAnnouncement | null> => {
    try {
        const newAnnouncement = {
            ...announcement,
            created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'ticker_announcements'), newAnnouncement);
        return { id: docRef.id, ...newAnnouncement } as TickerAnnouncement;

    } catch (err) {
        console.error('Unexpected error creating ticker announcement:', err);
        return null;
    }
};

export const updateTickerAnnouncement = async (id: string, updates: Partial<TickerAnnouncement>): Promise<TickerAnnouncement | null> => {
    try {
        const docRef = doc(db, 'ticker_announcements', id);
        await updateDoc(docRef, updates);
        
        const updatedSnap = await getDoc(docRef);
        return { id: updatedSnap.id, ...updatedSnap.data() } as TickerAnnouncement;
    } catch (err) {
        console.error('Unexpected error updating ticker announcement:', err);
        return null;
    }
};

export const deleteTickerAnnouncement = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, 'ticker_announcements', id));
        return true;
    } catch (err) {
        console.error('Unexpected error deleting ticker announcement:', err);
        return false;
    }
};

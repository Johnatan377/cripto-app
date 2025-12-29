
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDR3XbIZ9q9SDMoSChgf4kYXyjkMqOmMD0",
    authDomain: "criptoapp-cb39b.firebaseapp.com",
    projectId: "criptoapp-cb39b",
    storageBucket: "criptoapp-cb39b.firebasestorage.app",
    messagingSenderId: "267462077302",
    appId: "1:267462077302:web:2cb80cc14ff6f01329a857",
    measurementId: "G-2DX1SNXGM4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeBanner() {
    const targetContent = "WELCOME TO THE NEW FIREBASE SYSTEM! 🚀";
    console.log(`Searching for announcement: "${targetContent}"`);

    const tickerCol = collection(db, 'ticker_announcements');
    const snapshot = await getDocs(tickerCol);
    let deletedCount = 0;

    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.content_pt === targetContent || data.content_en === targetContent) {
            console.log(`Deleting document with ID: ${d.id}`);
            await deleteDoc(doc(db, 'ticker_announcements', d.id));
            deletedCount++;
        }
    }

    if (deletedCount === 0) {
        console.log("No matching announcement found. Checking partial matches...");
        for (const d of snapshot.docs) {
            const data = d.data();
            if (data.content_pt?.includes("FIREBASE SYSTEM") || data.content_en?.includes("FIREBASE SYSTEM")) {
                console.log(`Found partial match: "${data.content_pt}" / "${data.content_en}". ID: ${d.id}`);
                console.log(`Deleting...`);
                await deleteDoc(doc(db, 'ticker_announcements', d.id));
                deletedCount++;
            }
        }
    }

    console.log(`Done. Deleted ${deletedCount} announcements.`);
    process.exit(0);
}

removeBanner().catch(err => {
    console.error(err);
    process.exit(1);
});

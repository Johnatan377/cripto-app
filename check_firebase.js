
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkData() {
    console.log("--- CHECKING FIREBASE COLLECTIONS ---");

    const collections = ['ticker_announcements', 'support_messages', 'airdrops'];

    for (const colName of collections) {
        console.log(`\nCollection: ${colName}`);
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            console.log(`Count: ${snapshot.size}`);
            snapshot.forEach(doc => {
                console.log(` - ID: ${doc.id}`);
                console.log(`   Data:`, JSON.stringify(doc.data()));
            });
        } catch (e) {
            console.error(` Error checking ${colName}:`, e.message);
        }
    }

    process.exit(0);
}

checkData().catch(console.error);

const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Funkcja pomocnicza do pobierania kolekcji
async function backupCollection(collectionRef) {
  const result = {};

  // Pobieramy listę dokumentów w danej kolekcji
  const documents = await collectionRef.listDocuments();

  for (const docRef of documents) {
    console.log("  Dokument:", docRef.path);

    const snapshot = await docRef.get();

    result[docRef.id] = {
      data: snapshot.exists ? snapshot.data() : {},
      subcollections: {}
    };

    // Sprawdzamy, czy ten dokument ma podkolekcje
    const subcollections = await docRef.listCollections();

    for (const subcollection of subcollections) {
      console.log("    Podkolekcja:", subcollection.path);
      
      // Rekurencja: pobieramy dane z podkolekcji
      result[docRef.id].subcollections[subcollection.id] = 
        await backupCollection(subcollection);
    }
  }

  return result;
}

// Główna funkcja uruchomieniowa
async function backupDatabase() {
  console.log("Projekt:", serviceAccount.project_id);

  const backup = {};

  const collections = await db.listCollections();
  console.log("Znalezione główne kolekcje:", collections.map(c => c.id));

  for (const collection of collections) {
    console.log("\nKolekcja główna:", collection.id);
    backup[collection.id] = await backupCollection(collection);
  }

  fs.writeFileSync(
    "firebase-FULL-backup.json",
    JSON.stringify(backup, null, 2)
  );

  console.log("\n✅ GOTOWE");
  console.log("Plik: firebase-FULL-backup.json");
}

backupDatabase();
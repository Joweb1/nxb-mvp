import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';

export const updateMatchesInFirestore = async (matches) => {
  const matchesCollection = collection(db, 'matches');
  const CHUNK_SIZE = 450;

  for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
    const chunk = matches.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((match) => {
      const matchRef = doc(matchesCollection, match.fixture.id.toString());
      batch.set(matchRef, match);
    });
    await batch.commit();
  }
};

export const setLastFetchTimestamp = async () => {
  const metadataRef = doc(db, 'metadata', 'last_fetch');
  await setDoc(metadataRef, { timestamp: new Date().toISOString() });
};

export const getLastFetchTimestamp = async () => {
  const metadataRef = doc(db, 'metadata', 'last_fetch');
  const docSnap = await getDoc(metadataRef);

  if (docSnap.exists()) {
    return docSnap.data().timestamp;
  } else {
    return null;
  }
};

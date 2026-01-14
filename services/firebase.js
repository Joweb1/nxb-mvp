import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';

// Replace this with your actual server URL or configured environment variable
// Since this is a CLI environment, we'll hardcode the path where we uploaded the script.
// In production, this would be https://your-domain.com/scripts/firebase_cron.php
const SERVER_CRON_URL = "http://localhost:8000/scripts/firebase_cron.php"; 
const CRON_SECRET = "NXB_MVP_SECURE_CRON_KEY_2026";

export const getLastFetchTimestamp = async () => {
  const metadataRef = doc(db, 'metadata', 'last_fetch');
  const docSnap = await getDoc(metadataRef);

  if (docSnap.exists()) {
    return docSnap.data().timestamp;
  } else {
    return null;
  }
};

export const triggerManualUpdate = async () => {
  const lastFetch = await getLastFetchTimestamp();
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  if (!lastFetch || (now.getTime() - new Date(lastFetch).getTime()) > fiveMinutes) {
    try {
      // In a real device scenario, localhost might not work if the PHP server isn't accessible.
      // Assuming the user will configure the correct URL. 
      // For now, we simulate the network request structure.
      console.log(`Sending update request to ${SERVER_CRON_URL}...`);
      
      const response = await fetch(`${SERVER_CRON_URL}?secret=${CRON_SECRET}`, {
        method: 'GET',
      });

      if (response.ok) {
        // The PHP script handles the Firestore update including setting the timestamp.
        return { success: true, message: "Data updated successfully." };
      } else {
        console.error("Server script failed:", response.status);
        return { success: false, message: "Server failed to update data." };
      }
    } catch (error) {
      console.error("Error triggering server update:", error);
      return { success: false, message: "Network error connecting to server." };
    }
  } else {
    return { success: true, message: "Data is up to date." };
  }
};

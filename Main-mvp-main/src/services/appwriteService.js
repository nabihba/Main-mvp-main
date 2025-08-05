// src/services/appwriteService.js
import { Client, Storage, ID } from 'appwrite';

// --- Configuration ---
// TODO: Replace with your Appwrite project details
const APPWRITE_PROJECT_ID = '67bc33460027a4b1ecac';
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_BUCKET_ID = '687e44e2000e5b63aaab'; // Bucket for CVs, profile pics, etc.
// ---------------------

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);

/**
 * A reusable function to upload any file to Appwrite.
 * @param {object} file - The file object from the document picker (e.g., { uri, name }).
 * @param {string} userId - The Firebase UID of the user to set permissions.
 * @returns {Promise<string>} - A promise that resolves with the public URL of the uploaded file.
 */
export const uploadFile = async (file, userId) => {
  console.log(`Uploading file "${file.name}" to Appwrite...`);
  try {
    // Fetch the file data from its local URI
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Create a file object that Appwrite can understand
    const appwriteFile = new File([blob], file.name);

    // Upload the file to the Appwrite storage bucket
    const result = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(), // Give the file a unique ID
      appwriteFile,
      [`read("user:${userId}")`] // IMPORTANT: Secure permission - only the user can read it
    );

    // Get the public URL for the file we just uploaded
    const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, result.$id);

    console.log('File uploaded successfully. URL:', fileUrl.href);
    return fileUrl.href; // Return the URL as a string

  } catch (error) {
    console.error('Appwrite upload failed:', error);
    // Throw the error so the calling function knows something went wrong
    throw new Error('Failed to upload file.');
  }
};
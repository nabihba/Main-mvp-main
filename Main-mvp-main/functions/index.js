const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// Securely get your Gemini API key from the environment configuration
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

// This is a "Callable Function", meaning only logged-in users of your app can run it.
exports.getAiRecommendations = functions.https.onCall(async (data, context) => {
  // 1. AUTHENTICATION: Ensure the user is logged in.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  const userId = context.auth.uid;
  console.log(`AI analysis requested by user: ${userId}`);

  try {
    // 2. PROFILE ANALYZER AGENT: Get the user's data from Firestore.
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found.");
    }
    const userData = userDoc.data();

    // 3. RESEARCH AGENT: Fetch live course data from the Google Books API.
    const searchKeywords = userData.field?.join(" ") || "software development";
    const booksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchKeywords)}&maxResults=20`;
    const courseResponse = await fetch(booksApiUrl);
    const courseData = await courseResponse.json();
    const courseCatalog = (courseData.items || []).map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      provider: item.volumeInfo.authors?.join(", ") || "Unknown Author",
      description: item.volumeInfo.description,
      image: item.volumeInfo.imageLinks?.thumbnail,
    }));

    if (courseCatalog.length === 0) {
      throw new functions.https.HttpsError("not-found", "No relevant courses found to analyze.");
    }

    // 4. MATCHING & RANKING AGENT: Send all data to the Gemini AI.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert career advisor for an app called Bridge-It.
      Analyze the user's profile and the provided course catalog.
      Select the top 3 courses that are the best fit for this user.

      USER PROFILE:
      - Stated Career Goal: "${userData.careerGoal}"
      - Experience Level: ${userData.experience}
      - Fields of Interest: ${userData.field.join(", ")}

      AVAILABLE COURSE CATALOG:
      ---
      ${JSON.stringify(courseCatalog)}
      ---

      INSTRUCTIONS:
      Return ONLY a valid JSON array of the top 3 FULL course objects from the catalog that you recommend.
      The output must be only the JSON array and nothing else.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendedCourses = JSON.parse(cleanedResponse);

    // 5. SAVE RESULTS: Update the user's document in Firestore with the new recommendations.
    await userDocRef.update({
      recommendedCourses: recommendedCourses,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    console.log(`Successfully generated and saved recommendations for user ${userId}`);
    return { success: true, recommendedCourses: recommendedCourses };

  } catch (error) {
    console.error("Error in getAiRecommendations function:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while generating recommendations.",
      error.message
    );
  }
});
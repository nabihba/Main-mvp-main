import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { fetchCourses } from './courseService';
import { fetchJobs } from './jobService';
import { testGenerators } from './testGenerators';

// TODO: Replace with your actual Gemini API Key.
// IMPORTANT: This is not secure for a production app.
const API_KEY = 'AIzaSyAID57D3UKZdSt8Fc-WarY_2rlN4jNAdro';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const getAiRecommendations = async (userData, courseCatalog, jobListings) => {
  console.log('AI Service: Analyzing user profile...');
  
  // Extract relevant information from the new questionnaire structure
  const careerGoal = userData.careerGoal || '';
  const employmentStatus = userData.employmentStatus || '';
  const experience = userData.experience || '';
  const university = userData.university || '';
  const fieldExperience = userData.fieldExperience || [];
  const desiredField = userData.desiredField || [];
  const dreamJob = userData.dreamJob || '';
  const remoteCountries = userData.remoteCountries || [];
  
  // Convert field experience and desired field to strings
  const fieldExperienceStr = Array.isArray(fieldExperience) 
    ? Object.keys(fieldExperience).join(', ')
    : fieldExperience;
  const desiredFieldStr = Array.isArray(desiredField)
    ? Object.keys(desiredField).join(', ')
    : desiredField;
  
  // Create detailed analysis of user profile
  const userProfile = {
    careerGoal,
    employmentStatus,
    experience,
    university,
    fieldExperience: fieldExperienceStr,
    desiredField: desiredFieldStr,
    dreamJob,
    remoteCountries: remoteCountries.join(', ')
  };
  
  console.log('Detailed user profile for AI analysis:', userProfile);
  
  const prompt = `
    You are an expert career advisor specializing in the Middle East and North Africa region, particularly Palestine and the West Bank.
    
    Analyze the user's profile and select the top 3 courses AND the top 3 jobs that are the best fit for their specific situation.
    
    USER PROFILE ANALYSIS:
    - Career Goal: "${careerGoal}" - This indicates their primary motivation
    - Employment Status: "${employmentStatus}" - This shows their current situation
    - Prior Experience: "${experience}" - This indicates their educational background
    - University: "${university}" - This shows their academic institution and make sure to check about the university information
    - Field Experience: "${fieldExperienceStr}" - This shows their practical experience areas
    - Desired Work Fields: "${desiredFieldStr}" - This shows where they want to work
    - Dream Job: "${dreamJob}" - This is their ultimate career goal
    - Remote Work Countries: "${remoteCountries.join(', ')}" - This shows their geographic preferences

    CONTEXT CONSIDERATIONS:
    1. If they're unemployed, prioritize courses that lead to immediate employment
    2. If they're employed but unsatisfied, focus on career advancement courses
    3. If they have field experience, recommend jobs that build on that experience
    4. If they have a dream job, recommend courses that directly support that goal
    5. Consider the Palestinian context and regional opportunities
    6. Focus on practical, skill-based courses that lead to tangible outcomes
    7. Recommend jobs that match their experience level and desired fields

    AVAILABLE COURSES (with their IDs and categories):
    ---
    ${JSON.stringify(courseCatalog.map(c => ({ 
      id: c.id, 
      title: c.title, 
      provider: c.provider, 
      skills: c.skills,
      category: c.category || 'General'
    })))}
    ---

    AVAILABLE JOBS (with their IDs and categories):
    ---
    ${JSON.stringify(jobListings.map(j => ({ 
      id: j.id, 
      title: j.title, 
      company: j.company, 
      category: j.category,
      level: j.level,
      workType: j.workType
    })))}
    ---

    INSTRUCTIONS:
    1. Analyze the user's profile thoroughly
    2. Match courses to their career goals and current situation
    3. Match jobs to their experience level and desired fields
    4. Consider regional context and opportunities
    5. Prioritize practical, actionable recommendations
    6. Return a single, valid JSON object with two keys: "recommendedCourseIds" and "recommendedJobIds"
    7. Each key must contain an array of the top 3 STRING IDs from the respective lists
    8. The output must be only the JSON object and nothing else
    9. If no good matches exist, select the most relevant general options
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendations = JSON.parse(cleanedResponse);
    
    console.log('AI Recommendations:', recommendations);
    return recommendations;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // ✅ Return empty arrays on failure to prevent crashes
    return { recommendedCourseIds: [], recommendedJobIds: [] };
  }
};

// ✅ NEW: Detailed AI analysis for individual course/job
export const getDetailedAiAnalysis = async (item, userData, type = 'course') => {
  console.log(`Getting detailed AI analysis for ${type}:`, item?.title);
  
  if (!item || !userData) {
    console.error('Missing item or userData for AI analysis');
    return null;
  }

  // Extract user profile data
  const careerGoal = userData.careerGoal || '';
  const employmentStatus = userData.employmentStatus || '';
  const experience = userData.experience || '';
  const university = userData.university || '';
  const fieldExperience = userData.fieldExperience || {};
  const desiredField = userData.desiredField || {};
  const dreamJob = userData.dreamJob || '';
  const region = userData.region || '';
  
  // Convert objects to readable strings
  const fieldExperienceStr = typeof fieldExperience === 'object' 
    ? Object.keys(fieldExperience).filter(key => fieldExperience[key]).join(', ')
    : fieldExperience;
  const desiredFieldStr = typeof desiredField === 'object'
    ? Object.keys(desiredField).filter(key => desiredField[key]).join(', ')
    : desiredField;

  const prompt = `
    You are an expert career advisor specializing in the Palestinian and West Bank context. 
    
    Analyze this ${type} for a specific user and provide detailed, personalized insights.
    
    ${type.toUpperCase()} DETAILS:
    - Title: "${item.title || 'N/A'}"
    - ${type === 'course' ? 'Provider' : 'Company'}: "${item.provider || item.company || 'N/A'}"
    - Description: "${item.description || 'No description available'}"
    - ${type === 'course' ? 'Duration' : 'Level'}: "${item.duration || item.level || 'N/A'}"
    - ${type === 'course' ? 'Skills' : 'Requirements'}: "${item.skills?.join(', ') || item.requirements || 'N/A'}"
    - Category: "${item.category || 'General'}"
    ${type === 'job' ? `- Work Type: "${item.workType || 'N/A'}"` : ''}
    ${type === 'job' ? `- Location: "${item.location || 'N/A'}"` : ''}

    USER PROFILE:
    - Career Goal: "${careerGoal}"
    - Current Status: "${employmentStatus}"
    - Education Level: "${experience}"
    - University: "${university}"
    - Field Experience: "${fieldExperienceStr}"
    - Desired Fields: "${desiredFieldStr}"
    - Dream Job: "${dreamJob}"
    - Region: "${region}"

    ANALYSIS REQUIREMENTS:
    1. Provide a clear, concise summary of what this ${type} offers (2-3 sentences)
    2. Explain specifically why this ${type} is good or not good for THIS user based on their profile
    3. Calculate a relevance score (0-100) based on how well it matches their goals and background
    4. List 3-5 key benefits this ${type} would provide to them personally
    5. Identify specific skills they would gain that align with their career goals
    6. Explain how this fits into their career progression toward their dream job
    7. Consider the Palestinian/West Bank context and regional opportunities
    8. Be honest - if it's not a great match, explain why and suggest what would be better

    Return ONLY a valid JSON object with this exact structure:
    {
      "summary": "Brief 2-3 sentence summary of the ${type}",
      "personalizedRecommendation": "Detailed explanation of why this is good/bad for this specific user",
      "relevanceScore": 85,
      "keyBenefits": ["benefit1", "benefit2", "benefit3"],
      "skillsGained": ["skill1", "skill2", "skill3"],
      "careerProgression": "How this fits into their path to their dream job",
      "regionalContext": "Specific relevance to Palestinian/West Bank opportunities",
      "honestAssessment": "Frank assessment of whether this is worth their time and why"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log('Raw AI response:', cleanedResponse);
    
    const analysis = JSON.parse(cleanedResponse);
    
    // Add metadata
    analysis.analyzedAt = new Date().toISOString();
    analysis.itemId = item.id;
    analysis.userId = userData.uid;
    analysis.type = type;
    
    console.log('Detailed AI analysis completed:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('Detailed AI analysis failed:', error);
    
    // Fallback analysis
    return {
      summary: `This ${type} covers ${item.title}. ${item.description?.substring(0, 100) || 'More details available in full description.'}`,
      personalizedRecommendation: `This ${type} may be relevant to your career goals. Consider reviewing the full details to see if it aligns with your background in ${fieldExperienceStr || 'your field'}.`,
      relevanceScore: 50,
      keyBenefits: ['Professional development', 'Skill enhancement', 'Career advancement'],
      skillsGained: item.skills?.slice(0, 3) || ['Various professional skills'],
      careerProgression: 'This could contribute to your overall professional development.',
      regionalContext: 'Consider local market demand and opportunities in your region.',
      honestAssessment: 'Unable to provide detailed analysis at this time. Please review the course details manually.',
      analyzedAt: new Date().toISOString(),
      itemId: item.id,
      userId: userData.uid,
      type: type,
      source: 'fallback'
    };
  }
};

export const runFullAiAnalysis = async (userData) => {
  console.log('Running full AI analysis for user:', userData.uid);
  try {
    // Use the new questionnaire structure to get search keywords
    let searchKeywords = 'professional development';
    
    console.log('User data for AI analysis:', {
      careerGoal: userData.careerGoal,
      fieldExperience: userData.fieldExperience,
      desiredField: userData.desiredField,
      experience: userData.experience,
      employmentStatus: userData.employmentStatus
    });
    
    if (userData.fieldExperience && Object.keys(userData.fieldExperience).length > 0) {
      searchKeywords = Object.keys(userData.fieldExperience).join(' ');
    } else if (userData.desiredField && Object.keys(userData.desiredField).length > 0) {
      searchKeywords = Object.keys(userData.desiredField).join(' ');
    } else if (userData.careerGoal) {
      searchKeywords = userData.careerGoal;
    }

    console.log('Search keywords:', searchKeywords);

    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords),
      fetchJobs(searchKeywords)
    ]);

    // ✅ We no longer throw an error if one API fails. We proceed with what we have.
    console.log(`Found ${courseCatalog.length} courses and ${jobListings.length} jobs.`);

    // If AI fails, return some default recommendations
    let recommendedCourses = [];
    let recommendedJobs = [];

    try {
      const recommendedIds = await getAiRecommendations(userData, courseCatalog, jobListings);
      console.log('AI recommended IDs:', recommendedIds);
      
      recommendedCourses = (recommendedIds.recommendedCourseIds || []).map(id => 
        courseCatalog.find(course => course.id === id)
      ).filter(Boolean); 

      recommendedJobs = (recommendedIds.recommendedJobIds || []).map(id =>
        jobListings.find(job => job.id === id)
      ).filter(Boolean);
      
      console.log('Found recommended courses:', recommendedCourses.length);
      console.log('Found recommended jobs:', recommendedJobs.length);
    } catch (aiError) {
      console.error("AI recommendation failed, using fallback:", aiError);
      // Fallback: use test generators to ensure we have data
      const testData = testGenerators();
      recommendedCourses = testData.courses;
      recommendedJobs = testData.jobs;
      console.log('Using test generators - courses:', recommendedCourses.length, 'jobs:', recommendedJobs.length);
    }

    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses,
      recommendedJobs,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
    });

    // Ensure we always have some recommendations
    if (recommendedCourses.length === 0 && courseCatalog.length > 0) {
      console.log('No AI courses, using first 3 from catalog');
      recommendedCourses = courseCatalog.slice(0, 3);
    }
    
    if (recommendedJobs.length === 0 && jobListings.length > 0) {
      console.log('No AI jobs, using first 3 from listings');
      recommendedJobs = jobListings.slice(0, 3);
    }
    
    console.log('Final recommendations - courses:', recommendedCourses.length, 'jobs:', recommendedJobs.length);
    console.log('AI analysis and save complete.');
    return { recommendedCourses, recommendedJobs };

  } catch (error) {
    console.error("Error during full AI analysis:", error);
    // ✅ Return empty arrays on failure
    return { recommendedCourses: [], recommendedJobs: [] };
  }
};
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { fetchCourses } from './courseService';
import { fetchJobs } from './jobService';
import { testGenerators } from './testGenerators';

// TODO: Replace with your actual Gemini API Key.
const API_KEY = 'AIzaSyBGVZhZ3jxOrYEaCQH5oPGu_14_sojjmEo';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Enhanced user profile extraction that captures ALL questionnaire data
 */
const extractUserProfile = (userData) => {
  console.log('Extracting complete user profile:', userData);
  
  // Extract all possible fields from questionnaire
  const profile = {
    // Basic info
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    region: userData.region || '',
    university: userData.university || '',
    
    // Career-related fields
    careerGoal: userData.careerGoal || '',
    dreamJob: userData.dreamJob || '',
    employmentStatus: userData.employmentStatus || '',
    experience: userData.experience || '',
    
    // Skills and interests (these might be objects or arrays)
    fieldExperience: userData.fieldExperience || {},
    desiredField: userData.desiredField || {},
    technicalSkills: userData.technicalSkills || [],
    softSkills: userData.softSkills || [],
    interests: userData.interests || [],
    careerGoals: userData.careerGoals || [], // different from careerGoal
    
    // Work preferences
    workPreferences: userData.workPreferences || {},
    remoteCountries: userData.remoteCountries || [],
    salaryExpectations: userData.salaryExpectations || '',
    
    // Education details
    degreeLevel: userData.degreeLevel || '',
    fieldOfStudy: userData.fieldOfStudy || '',
    specialization: userData.specialization || '',
    graduationYear: userData.graduationYear || '',
    
    // Additional fields that might exist
    currentRole: userData.currentRole || '',
    yearsOfExperience: userData.yearsOfExperience || 0,
    certifications: userData.certifications || [],
    languages: userData.languages || []
  };

  // Convert object fields to readable strings
  if (typeof profile.fieldExperience === 'object') {
    profile.fieldExperienceStr = Object.keys(profile.fieldExperience)
      .filter(key => profile.fieldExperience[key])
      .join(', ');
  } else {
    profile.fieldExperienceStr = profile.fieldExperience;
  }

  if (typeof profile.desiredField === 'object') {
    profile.desiredFieldStr = Object.keys(profile.desiredField)
      .filter(key => profile.desiredField[key])
      .join(', ');
  } else {
    profile.desiredFieldStr = profile.desiredField;
  }

  if (typeof profile.workPreferences === 'object') {
    profile.workPreferencesStr = Object.keys(profile.workPreferences)
      .filter(key => profile.workPreferences[key])
      .join(', ');
  } else {
    profile.workPreferencesStr = profile.workPreferences;
  }

  // Create priority keywords for search
  const priorityKeywords = [];
  
  // High priority: Dream job and desired field
  if (profile.dreamJob) priorityKeywords.push(profile.dreamJob);
  if (profile.desiredFieldStr) priorityKeywords.push(profile.desiredFieldStr);
  if (profile.specialization) priorityKeywords.push(profile.specialization);
  
  // Medium priority: Field experience and technical skills
  if (profile.fieldExperienceStr) priorityKeywords.push(profile.fieldExperienceStr);
  if (Array.isArray(profile.technicalSkills)) {
    priorityKeywords.push(...profile.technicalSkills);
  }
  
  // Lower priority: Career goals and interests
  if (profile.careerGoal) priorityKeywords.push(profile.careerGoal);
  if (Array.isArray(profile.interests)) {
    priorityKeywords.push(...profile.interests);
  }

  profile.searchKeywords = priorityKeywords.join(' ');
  
  console.log('Extracted profile with keywords:', profile.searchKeywords);
  return profile;
};

/**
 * Enhanced AI recommendations with stricter matching
 */
const getAiRecommendations = async (userData, courseCatalog, jobListings) => {
  console.log('AI Service: Analyzing user profile with enhanced logic...');
  
  const profile = extractUserProfile(userData);
  
  // Create a more detailed and strict prompt
  const prompt = `
    You are an expert career advisor with deep knowledge of the Palestinian job market and regional opportunities in the Middle East.
    
    CRITICAL INSTRUCTIONS - READ CAREFULLY:
    1. You MUST prioritize relevance over everything else
    2. If a user wants to be an "AI Consultant" - recommend AI, ML, data science courses/jobs
    3. If they have "Software Engineer" experience - build on that with advanced programming, architecture, etc.
    4. DO NOT recommend stress management, general business, or unrelated courses unless they specifically align
    5. Score relevance strictly - irrelevant recommendations get 0-20 scores
    
    USER PROFILE DETAILED ANALYSIS:
    
    DREAM JOB: "${profile.dreamJob}" 
    ⭐ THIS IS THE MOST IMPORTANT FACTOR - Match this above all else
    
    FIELD EXPERIENCE: "${profile.fieldExperienceStr}"
    ⭐ Build on existing experience, don't ignore it
    
    DESIRED WORK FIELDS: "${profile.desiredFieldStr}"
    ⭐ Must align with these preferences
    
    TECHNICAL SKILLS: ${JSON.stringify(profile.technicalSkills)}
    ⭐ Expand these skills, don't recommend basic versions of what they know
    
    Additional Context:
    - Career Goal: "${profile.careerGoal}"
    - Employment Status: "${profile.employmentStatus}"
    - Education Level: "${profile.experience}"
    - University: "${profile.university}"
    - Specialization: "${profile.specialization}"
    - Current Role: "${profile.currentRole}"
    - Years Experience: ${profile.yearsOfExperience}
    - Region: "${profile.region}"
    - Work Preferences: "${profile.workPreferencesStr}"

    EXAMPLE MATCHING LOGIC:
    - If dream job = "AI Consultant" → Look for: AI, Machine Learning, Data Science, Python, TensorFlow, etc.
    - If experience = "Software Engineer" → Look for: Advanced Programming, System Design, Cloud Architecture, etc.
    - If they know React → Recommend: Advanced React, Node.js, Full Stack, not basic web development
    
    STRICT RELEVANCE RULES:
    ❌ DO NOT recommend stress management, leadership, general business unless specifically relevant
    ❌ DO NOT recommend beginner courses if they have advanced experience
    ❌ DO NOT recommend courses outside their field unless they explicitly want career change
    ✅ DO recommend courses that directly advance their dream job
    ✅ DO recommend jobs that match their experience level and desired field
    ✅ DO consider Palestinian/regional market opportunities

    AVAILABLE COURSES:
    ${JSON.stringify(courseCatalog.map(c => ({ 
      id: c.id, 
      title: c.title, 
      provider: c.provider, 
      skills: c.skills,
      category: c.category,
      level: c.level,
      description: c.description?.substring(0, 100)
    })), null, 2)}

    AVAILABLE JOBS:
    ${JSON.stringify(jobListings.map(j => ({ 
      id: j.id, 
      title: j.title, 
      company: j.company, 
      category: j.category,
      level: j.level,
      workType: j.workType,
      location: j.location,
      description: j.description?.substring(0, 100)
    })), null, 2)}

    MATCHING PROCESS:
    1. First, find courses/jobs that directly match dream job "${profile.dreamJob}"
    2. Second, find items that build on field experience "${profile.fieldExperienceStr}"  
    3. Third, consider desired fields "${profile.desiredFieldStr}"
    4. Calculate strict relevance scores (0-100)
    5. Only select items with score > 70 for recommendations
    6. If no items score > 70, select best available but note the low relevance

    REQUIRED OUTPUT FORMAT (JSON only, no other text):
    {
      "recommendedCourseIds": ["id1", "id2", "id3"],
      "recommendedJobIds": ["id1", "id2", "id3"],
      "reasoning": {
        "dreamJobAlignment": "Explanation of how selections align with dream job",
        "experienceBuilding": "How selections build on existing experience", 
        "relevanceScores": {
          "courses": [score1, score2, score3],
          "jobs": [score1, score2, score3]
        },
        "warnings": "Any concerns about match quality"
      }
    }
    
    REMEMBER: If dream job is "AI Consultant" and you recommend a stress management course, that's a failure. Be strict and relevant!
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log('Raw AI response:', cleanedResponse);
    const recommendations = JSON.parse(cleanedResponse);
    
    console.log('AI Recommendations with reasoning:', recommendations);
    
    // Validate that we have actual IDs
    if (!recommendations.recommendedCourseIds || !recommendations.recommendedJobIds) {
      throw new Error('Invalid recommendation format from AI');
    }
    
    return recommendations;
    
  } catch (error) {
    console.error("Enhanced AI recommendation failed:", error);
    
    // Smart fallback based on user profile
    console.log('Using smart fallback recommendations...');
    return createSmartFallback(profile, courseCatalog, jobListings);
  }
};

/**
 * Smart fallback that uses profile matching when AI fails
 */
const createSmartFallback = (profile, courseCatalog, jobListings) => {
  console.log('Creating smart fallback recommendations for:', profile.dreamJob);
  
  // Create keyword matching function
  const scoreRelevance = (item, type) => {
    let score = 0;
    // ✅ **FIX:** Added a fallback for item.title
    const itemText = `${item.title || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
    
    // High priority matching (dream job, specialization)
    // ✅ **FIX:** Added fallbacks to ensure we only try to lowercase strings.
    const highPriorityTerms = [
      (profile.dreamJob || '').toLowerCase(),
      (profile.specialization || '').toLowerCase(),
      ...(profile.desiredFieldStr || '').toLowerCase().split(',').map(s => s.trim())
    ].filter(Boolean); // .filter(Boolean) removes any empty strings
    
    for (const term of highPriorityTerms) {
      if (term && itemText.includes(term)) score += 30;
    }
    
    // Medium priority (field experience, technical skills)
    const mediumPriorityTerms = [
      ...(profile.fieldExperienceStr || '').toLowerCase().split(',').map(s => s.trim()),
      ...(profile.technicalSkills || []).map(s => (s || '').toLowerCase())
    ].filter(Boolean);
    
    for (const term of mediumPriorityTerms) {
      if (term && itemText.includes(term)) score += 20;
    }
    
    // Bonus for exact title matches
    if ((profile.dreamJob || '') && itemText.includes((profile.dreamJob || '').toLowerCase())) score += 25;
    
    return Math.min(score, 100);
  };
  
  // Score and sort courses
  const scoredCourses = courseCatalog.map(course => ({
    ...course,
    score: scoreRelevance(course, 'course')
  })).sort((a, b) => b.score - a.score);
  
  // Score and sort jobs  
  const scoredJobs = jobListings.map(job => ({
    ...job,
    score: scoreRelevance(job, 'job')
  })).sort((a, b) => b.score - a.score);
  
  console.log('Top courses by score:', scoredCourses.slice(0, 3).map(c => ({ title: c.title, score: c.score })));
  console.log('Top jobs by score:', scoredJobs.slice(0, 3).map(j => ({ title: j.title, score: j.score })));
  
  return {
    recommendedCourseIds: scoredCourses.slice(0, 3).map(c => c.id),
    recommendedJobIds: scoredJobs.slice(0, 3).map(j => j.id),
    reasoning: {
      dreamJobAlignment: `Fallback matching based on dream job: ${profile.dreamJob}`,
      experienceBuilding: `Building on experience in: ${profile.fieldExperienceStr}`,
      relevanceScores: {
        courses: scoredCourses.slice(0, 3).map(c => c.score),
        jobs: scoredJobs.slice(0, 3).map(j => j.score)
      },
      warnings: "Using fallback algorithm - AI analysis failed"
    }
  };
};

/**
 * Enhanced course/job search with better keyword generation
 */
const generateSearchKeywords = (userData) => {
  const profile = extractUserProfile(userData);
  
  // Build hierarchical keywords
  const keywords = [];
  
  // Priority 1: Dream job (most important)
  if (profile.dreamJob) {
    keywords.push(profile.dreamJob);
    
    // Add related terms for common roles
    const dreamJobLower = profile.dreamJob.toLowerCase();
    if (dreamJobLower.includes('ai') || dreamJobLower.includes('artificial intelligence')) {
      keywords.push('machine learning', 'data science', 'python', 'tensorflow');
    }
    if (dreamJobLower.includes('consultant')) {
      keywords.push('consulting', 'strategy', 'analysis');
    }
    if (dreamJobLower.includes('software') || dreamJobLower.includes('developer')) {
      keywords.push('programming', 'coding', 'development');
    }
  }
  
  // Priority 2: Specialization and desired field
  if (profile.specialization) keywords.push(profile.specialization);
  if (profile.desiredFieldStr) keywords.push(profile.desiredFieldStr);
  
  // Priority 3: Technical skills and field experience
  if (profile.technicalSkills) keywords.push(...profile.technicalSkills);
  if (profile.fieldExperienceStr) keywords.push(profile.fieldExperienceStr);
  
  const finalKeywords = keywords.filter(Boolean).join(' ');
  console.log('Generated search keywords:', finalKeywords);
  return finalKeywords;
};

// Enhanced detailed AI analysis (keeping your existing function but with better profile extraction)
export const getDetailedAiAnalysis = async (item, userData, type = 'course') => {
  console.log(`Getting detailed AI analysis for ${type}:`, item?.title);
  
  if (!item || !userData) {
    console.error('Missing item or userData for AI analysis');
    return null;
  }

  const profile = extractUserProfile(userData);

  const prompt = `
    You are an expert career advisor specializing in the Palestinian and Middle Eastern context. 
    
    Analyze this ${type} for a user who wants to become an "${profile.dreamJob}" and has experience in "${profile.fieldExperienceStr}".
    
    ${type.toUpperCase()} DETAILS:
    - Title: "${item.title || 'N/A'}"
    - ${type === 'course' ? 'Provider' : 'Company'}: "${item.provider || item.company || 'N/A'}"
    - Description: "${item.description || 'No description available'}"
    - Category: "${item.category || 'General'}"
    - Skills/Requirements: "${(item.skills || []).join(', ') || 'N/A'}"

    USER PROFILE:
    - Dream Job: "${profile.dreamJob}" (MOST IMPORTANT)
    - Field Experience: "${profile.fieldExperienceStr}"
    - Technical Skills: ${JSON.stringify(profile.technicalSkills)}
    - Desired Fields: "${profile.desiredFieldStr}"
    - Specialization: "${profile.specialization}"
    - Current Status: "${profile.employmentStatus}"
    - Region: "${profile.region}"

    STRICT RELEVANCE SCORING:
    - 90-100: Perfect match for dream job and builds on experience
    - 75-89: Very relevant to career goals with good skill alignment  
    - 60-74: Moderately relevant, some alignment
    - 45-59: Limited relevance, tangential connection
    - 30-44: Low relevance, minimal connection
    - 0-29: Not relevant, wrong field/level

    BE BRUTALLY HONEST about relevance. If a stress management course is recommended for someone wanting to be an AI consultant, score it 5-15!

    Return ONLY valid JSON:
    {
      "summary": "Brief 2-3 sentence summary",
      "personalizedRecommendation": "Detailed explanation of relevance to user's dream job and experience",
      "relevanceScore": [NUMBER 0-100 based on STRICT criteria above],
      "keyBenefits": ["benefit1", "benefit2", "benefit3"],
      "skillsGained": ["skill1", "skill2", "skill3"],
      "careerProgression": "How this helps achieve dream job: ${profile.dreamJob}",
      "regionalContext": "Relevance to Palestinian/Middle Eastern opportunities",
      "honestAssessment": "Frank assessment with specific reasoning for score"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const analysis = JSON.parse(cleanedResponse);
    
    // Add metadata
    analysis.analyzedAt = new Date().toISOString();
    analysis.itemId = item.id;
    analysis.userId = userData.uid;
    analysis.type = type;
    
    console.log(`Detailed analysis for ${item.title}: Score ${analysis.relevanceScore}/100`);
    return analysis;
    
  } catch (error) {
    console.error('Detailed AI analysis failed:', error);
    // ✅ **FIX:** Pass `userData` to the fallback function
    return createFallbackAnalysis(item, profile, type, userData);
  }
};

/**
 * Enhanced main analysis function
 */
export const runFullAiAnalysis = async (userData) => {
  console.log('Running ENHANCED AI analysis for user:', userData.uid);
  try {
    const profile = extractUserProfile(userData);
    const searchKeywords = generateSearchKeywords(userData);

    console.log('Using enhanced search keywords:', searchKeywords);

    // Fetch more targeted data
    const [courseCatalog, jobListings] = await Promise.all([
      fetchCourses(searchKeywords, {
        useRealAPIs: true, // Set to true when APIs are configured
        sources: ['udemy', 'coursera', 'classcentral'],
        maxPerSource : 20,
        fallbackToGenerated: true
      }),
      fetchJobs(searchKeywords, {
        useRealAPIs: false, // Set to true when APIs are configured  
        sources: ['indeed', 'linkedin', 'general'],
        maxPerSource: 20,
        fallbackToGenerated: true
      })
    ]);

    console.log(`Enhanced fetch: ${courseCatalog.length} courses, ${jobListings.length} jobs`);

    // Get AI recommendations with enhanced logic
    const recommendations = await getAiRecommendations(userData, courseCatalog, jobListings);
    
    // Map IDs to actual objects
    const recommendedCourses = (recommendations.recommendedCourseIds || []).map(id => 
      courseCatalog.find(course => course.id === id)
    ).filter(Boolean);

    const recommendedJobs = (recommendations.recommendedJobIds || []).map(id =>
      jobListings.find(job => job.id === id)
    ).filter(Boolean);

    console.log('Final enhanced recommendations:');
    console.log('Courses:', recommendedCourses.map(c => ({ title: c.title, id: c.id })));
    console.log('Jobs:', recommendedJobs.map(j => ({ title: j.title, id: j.id })));
    console.log('AI Reasoning:', recommendations.reasoning);

    // Save to Firebase
    const userDocRef = doc(db, 'users', userData.uid);
    await updateDoc(userDocRef, {
      recommendedCourses,
      recommendedJobs,
      analysisComplete: true,
      lastAnalysisDate: new Date(),
      analysisReasoning: recommendations.reasoning // Save the AI's reasoning
    });

    return { 
      recommendedCourses, 
      recommendedJobs,
      reasoning: recommendations.reasoning 
    };

  } catch (error) {
    console.error("Enhanced AI analysis failed:", error);
    return { recommendedCourses: [], recommendedJobs: [], reasoning: null };
  }
};

/**
 * Fallback analysis when detailed AI fails
 */
// ✅ **FIX:** Add `userData` to the function signature to access `userData.uid`
const createFallbackAnalysis = (item, profile, type, userData) => {
  // Simple keyword matching for fallback
  const itemText = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  const dreamJobText = (profile.dreamJob || '').toLowerCase();
  
  let score = 30; // Default moderate score
  if (dreamJobText && itemText.includes(dreamJobText)) score = 75;
  else if ((profile.technicalSkills || []).some(skill => itemText.includes((skill || '').toLowerCase()))) score = 60;
  else if (profile.fieldExperienceStr && itemText.includes((profile.fieldExperienceStr || '').toLowerCase())) score = 55;
  
  return {
    summary: `This ${type} covers ${item.title || 'N/A'}. ${item.description?.substring(0, 100) || 'More details available.'}`,
    personalizedRecommendation: `Based on your goal to become ${profile.dreamJob || 'your desired role'}, this ${type} may${score > 50 ? '' : ' not'} be directly relevant to your career path.`,
    relevanceScore: score,
    keyBenefits: item.skills?.slice(0, 3) || ['Professional development', 'Skill enhancement', 'Career advancement'],
    skillsGained: item.skills?.slice(0, 3) || ['Various professional skills'],
    careerProgression: `This ${score > 50 ? 'aligns with' : 'may tangentially support'} your path to becoming ${profile.dreamJob || 'your desired role'}.`,
    regionalContext: 'Consider local market demand and opportunities in your region.',
    honestAssessment: `Fallback analysis suggests ${score > 60 ? 'good' : score > 40 ? 'moderate' : 'limited'} relevance to your career goals.`,
    analyzedAt: new Date().toISOString(),
    itemId: item.id,
    userId: userData?.uid || 'unknown', // Safely access uid
    type: type,
    source: 'fallback'
  };
};
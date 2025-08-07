import { generateCourseCatalog, searchCourses } from './courseGenerator';
import { RAPIDAPI_KEY, UDEMY_API_KEY, COURSERA_API_KEY } from '@env';

// Real course APIs integration
// const UDEMY_API_KEY = process.env.UDEMY_API_KEY; // You'll need to add these
// const COURSERA_API_KEY = process.env.COURSERA_API_KEY;

/**
 * Fetch courses from Udemy API via RapidAPI
 */
const fetchUdemyCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping Udemy API fetch.');
    return [];
  }

  const url = `https://udemy-paid-courses-for-free-api.p.rapidapi.com/rapidapi/courses/search?page=1&page_size=${maxResults}&query=${encodeURIComponent(searchKeywords)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'udemy-paid-courses-for-free-api.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching Udemy courses from RapidAPI for: "${searchKeywords}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Udemy RapidAPI request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const coursesFromApi = result.courses || [];

    const normalizedCourses = coursesFromApi.map((course, index) => {
      const uniqueId = `udemy_${course.clean_url?.split('/')[2] || index}_${index}`;
      return {
        id: uniqueId,
        title: course.name,
        provider: 'Udemy',
        category: course.category,
        description: course.description,
        image: course.image,
        price: course.sale_price_usd ? `$${(course.sale_price_usd / 100).toFixed(2)}` : 'Free',
        url: course.url,
        level: 'All Levels',
        duration: 'N/A',
        skills: [],
        rating: 0,
        students: 0
      };
    });

    console.log(`Successfully fetched and normalized ${normalizedCourses.length} courses from Udemy.`);
    return normalizedCourses;
  } catch (error) {
    console.error('Udemy RapidAPI fetch error:', error.message);
    return []; // Return empty array on failure, which triggers the fallback
  }
};

/**
 * Fetch courses from Coursera API
 */
const fetchCourseraCourses = async (searchKeywords, maxResults = 15) => {
  try {
    // For now, return empty array since we don't have API keys
    // In production, implement actual Coursera API calls here
    console.log('Coursera API integration not yet configured');
    return [];
  } catch (error) {
    console.error('Coursera API error:', error);
    return [];
  }
};

/**
 * Fetch courses from ClassCentral API (free tier available)
 */
const fetchClassCentralCourses = async (searchKeywords, maxResults = 15) => {
  try {
    // ClassCentral API might not be publicly available
    // For now, we'll skip this and rely on generated courses
    console.log('ClassCentral API integration temporarily disabled');
    return [];
  } catch (error) {
    console.error('ClassCentral API error:', error);
    return [];
  }
};


/**
 * Generate relevant courses based on user profile and keywords
 */
/**
 * Generate relevant courses based on user profile and keywords
 */
const generateRelevantCourses = (searchKeywords, maxResults = 20) => {
  console.log('Generating relevant courses for keywords:', searchKeywords);
  
  if (!searchKeywords || searchKeywords.trim() === '') {
    return generateCourseCatalog().slice(0, maxResults);
  }

  // Use the search function to find relevant courses
  const relevantCourses = searchCourses(searchKeywords);
  
  // If we found relevant courses, return them
  if (relevantCourses.length > 0) {
    console.log(`Found ${relevantCourses.length} relevant courses for "${searchKeywords}"`);
    return relevantCourses.slice(0, maxResults);
  }
  
  // If no relevant courses found, try with individual keywords
  const keywords = searchKeywords.split(' ').filter(word => word.length > 2);
  if (keywords.length > 1) {
    for (const keyword of keywords) {
      const keywordCourses = searchCourses(keyword);
      if (keywordCourses.length > 0) {
        console.log(`Found courses for keyword "${keyword}"`);
        return keywordCourses.slice(0, maxResults);
      }
    }
  }
  
  // Last resort: return general tech/business courses instead of random ones
  const generalTechCourses = searchCourses('programming technology business management');
  if (generalTechCourses.length > 0) {
    console.log('Using general technology/business courses as fallback');
    return generalTechCourses.slice(0, maxResults);
  }
  
  // Absolute fallback
  return generateCourseCatalog().slice(0, maxResults);
};

/**
 * Enhanced course fetching with multiple sources and options
 * @param {string} searchKeywords - The keywords to search for
 * @param {object} options - Configuration options
 * @returns {Promise<Array>} - A promise that resolves with a list of course objects
 */
export const fetchCourses = async (searchKeywords = '', options = {}) => {
  const {
    useRealAPIs = true, // Changed to true by default
    sources = ['udemy', 'coursera'],
    maxPerSource = 15,
    fallbackToGenerated = true
  } = options;

  console.log(`Course Service: Searching for courses about "${searchKeywords}"...`);
  console.log('Options:', options);
  
  let allCourses = [];

  if (useRealAPIs && RAPIDAPI_KEY) {
    // Try to fetch from real APIs
    const fetchPromises = [];
    
    if (sources.includes('udemy')) {
      fetchPromises.push(fetchUdemyCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('coursera')) {
      fetchPromises.push(fetchCourseraCourses(searchKeywords, maxPerSource));
    }

    try {
      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`Fetched ${result.value.length} courses from ${sources[index]}`);
          allCourses.push(...result.value);
        } else if (result.status === 'rejected') {
          console.log(`Failed to fetch from ${sources[index]}:`, result.reason);
        }
      });
      
    } catch (error) {
      console.error('Error fetching from real APIs:', error);
    }
  } else if (useRealAPIs && !RAPIDAPI_KEY) {
    console.log('RapidAPI key not found in config. Skipping API fetch.');
  }

  // ✅ THIS IS YOUR SAFETY NET
  // If the API calls failed or returned less than 10 courses, this block runs.
  if (allCourses.length < 10 && fallbackToGenerated) {
    console.log('API fetch insufficient. Using enhanced local catalog as a fallback or supplement.');
    const generatedCourses = generateRelevantCourses(searchKeywords, 30);
    allCourses.push(...generatedCourses);
  }

  // Remove duplicates, prioritizing API results because they come first in the array
  const uniqueCourses = allCourses.filter((course, index, self) => 
    index === self.findIndex(c => c.title === course.title && c.provider === course.provider)
  );

  const finalCourses = uniqueCourses.slice(0, 20);
  
  console.log(`Final result: ${finalCourses.length} unique courses returned.`);
  return finalCourses;
};

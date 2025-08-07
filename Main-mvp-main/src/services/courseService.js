import { generateCourseCatalog, searchCourses } from './courseGenerator';

// Real course APIs integration
const UDEMY_API_KEY = process.env.UDEMY_API_KEY; // You'll need to add these
const COURSERA_API_KEY = process.env.COURSERA_API_KEY;

/**
 * Fetch courses from Udemy API
 */
const fetchUdemyCourses = async (searchKeywords, maxResults = 15) => {
  try {
    // For now, return empty array since we don't have API keys
    // In production, implement actual Udemy API calls here
    console.log('Udemy API integration not yet configured');
    return [];
  } catch (error) {
    console.error('Udemy API error:', error);
    return [];
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
    
    // TODO: Implement when we have proper API access
    /*
    const encodedQuery = encodeURIComponent(searchKeywords);
    const response = await fetch(
      `https://www.classcentral.com/api/courses?q=${encodedQuery}&limit=${maxResults}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BridgeIT-Mobile-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ClassCentral API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map(course => ({
      id: `classcentral_${course.id}`,
      title: course.name || course.title,
      provider: course.institutions?.[0]?.name || course.provider || 'ClassCentral',
      description: course.description || 'No description available',
      image: course.photoUrl || `https://source.unsplash.com/400x300/?education,${encodeURIComponent(course.name || 'course')}`,
      level: course.difficulty || 'Beginner',
      duration: course.length || 'Self-paced',
      price: course.price === 0 ? 'Free' : course.price ? `$${course.price}` : 'Paid',
      skills: course.subjects?.map(s => s.name) || [course.subject?.name].filter(Boolean) || [],
      course_url: course.url || course.link,
      category: course.subject?.name || 'General',
      rating: course.rating,
      source: 'ClassCentral'
    }));
    */
  } catch (error) {
    console.error('ClassCentral API error:', error);
    return [];
  }
};

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
    useRealAPIs = false,
    sources = ['udemy', 'coursera', 'classcentral'],
    maxPerSource = 15,
    fallbackToGenerated = true
  } = options;

  console.log(`Course Service: Searching for courses about "${searchKeywords}"...`);
  console.log('Options:', options);
  
  let allCourses = [];

  if (useRealAPIs) {
    // Try to fetch from real APIs
    const fetchPromises = [];
    
    if (sources.includes('udemy')) {
      fetchPromises.push(fetchUdemyCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('coursera')) {
      fetchPromises.push(fetchCourseraCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('classcentral')) {
      fetchPromises.push(fetchClassCentralCourses(searchKeywords, maxPerSource));
    }

    try {
      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`Fetched ${result.value.length} courses from ${sources[index]}`);
          allCourses.push(...result.value);
        } else {
          console.log(`Failed to fetch from ${sources[index]}:`, result.reason);
        }
      });
      
    } catch (error) {
      console.error('Error fetching from real APIs:', error);
    }
  }

  // If we don't have enough courses from real APIs, use generated ones
  if (allCourses.length < 10 && fallbackToGenerated) {
    console.log('Using generated courses as fallback');
    const generatedCourses = generateRelevantCourses(searchKeywords, 30);
    allCourses.push(...generatedCourses);
  }

  // Remove duplicates and limit results
  const uniqueCourses = allCourses.filter((course, index, self) => 
    index === self.findIndex(c => c.title === course.title && c.provider === course.provider)
  );

  const finalCourses = uniqueCourses.slice(0, 50);
  
  console.log(`Final result: ${finalCourses.length} unique courses`);
  console.log('Sample course:', finalCourses[0]);
  
  return finalCourses;
};
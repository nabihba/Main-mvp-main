// courseService.js - Enhanced service with multiple real course API integrations

import { generateCourseCatalog, searchCourses } from './courseGenerator';

// API Configuration - Add your API keys here
const API_CONFIG = {
  // RapidAPI Udemy API
  UDEMY_API: {
    baseUrl: 'https://udemy-api2.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY, // Add your RapidAPI key
      'X-RapidAPI-Host': 'udemy-api2.p.rapidapi.com'
    }
  },
  
  // Coursera API (via RapidAPI)
  COURSERA_API: {
    baseUrl: 'https://coursera-courses.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'coursera-courses.p.rapidapi.com'
    }
  },

  // Alternative free APIs
  FREE_COURSE_API: {
    baseUrl: 'https://api.freecodecamp.org/api',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

/**
 * Fetch courses from Udemy via RapidAPI
 * @param {string} searchKeywords - Search terms
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} - Normalized course array
 */
const fetchUdemyCourses = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching Udemy courses...');
    
    const response = await fetch(`${API_CONFIG.UDEMY_API.baseUrl}/v1/udemy/search-courses`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.UDEMY_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        page: 1,
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`Udemy API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize Udemy course data
    return data.courses?.map(course => ({
      id: `udemy_${course.id}`,
      title: course.title,
      description: course.description,
      instructor: course.instructor_name,
      provider: 'Udemy',
      rating: course.rating,
      students: course.num_students,
      price: course.price,
      level: course.level,
      duration: course.content_length_video,
      imageUrl: course.image_url,
      url: course.url,
      category: course.category,
      language: course.language,
      lastUpdated: course.last_update_date,
      isPaid: course.price > 0,
      tags: course.what_you_will_learn || []
    })) || [];

  } catch (error) {
    console.error('Error fetching Udemy courses:', error);
    return [];
  }
};

/**
 * Fetch courses from Coursera via RapidAPI
 * @param {string} searchKeywords - Search terms
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} - Normalized course array
 */
const fetchCourseraCourses = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching Coursera courses...');
    
    const response = await fetch(`${API_CONFIG.COURSERA_API.baseUrl}/search`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.COURSERA_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`Coursera API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize Coursera course data
    return data.courses?.map(course => ({
      id: `coursera_${course.slug}`,
      title: course.name,
      description: course.description,
      instructor: course.instructors?.[0]?.name || 'Coursera',
      provider: 'Coursera',
      rating: course.averageRating,
      students: course.enrollments,
      price: course.productPrice?.amount || 0,
      level: course.level,
      duration: `${course.workload} hours/week`,
      imageUrl: course.photoUrl,
      url: `https://coursera.org/learn/${course.slug}`,
      category: course.domainTypes?.[0]?.name,
      language: course.primaryLanguage,
      lastUpdated: course.launchedAt,
      isPaid: course.productPrice?.amount > 0,
      tags: course.skills || []
    })) || [];

  } catch (error) {
    console.error('Error fetching Coursera courses:', error);
    return [];
  }
};

/**
 * Fetch courses from edX Course Catalog API
 * Note: This requires authentication - see edX API documentation
 * @param {string} searchKeywords - Search terms
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} - Normalized course array
 */
const fetchEdxCourses = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching edX courses...');
    
    // Note: edX requires OAuth authentication
    // This is a simplified example - you'll need to implement OAuth flow
    const response = await fetch(`https://courses.edx.org/api/courses/v1/courses/?search=${encodeURIComponent(searchKeywords)}&page_size=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${accessToken}` // You'll need to get this
      }
    });

    if (!response.ok) {
      throw new Error(`edX API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize edX course data
    return data.results?.map(course => ({
      id: `edx_${course.course_id}`,
      title: course.name,
      description: course.short_description,
      instructor: course.instructors?.[0]?.name || 'edX',
      provider: 'edX',
      rating: null, // Not provided by default
      students: null,
      price: 0, // Most edX courses are free
      level: course.level_type,
      duration: course.effort,
      imageUrl: course.media?.course_image?.uri,
      url: `https://courses.edx.org${course.course_about_url}`,
      category: course.subjects?.[0],
      language: course.language,
      lastUpdated: course.modified,
      isPaid: false,
      tags: course.subjects || []
    })) || [];

  } catch (error) {
    console.error('Error fetching edX courses:', error);
    return [];
  }
};

/**
 * Fetch courses from Class Central API (Free alternative)
 * @param {string} searchKeywords - Search terms
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} - Normalized course array
 */
const fetchClassCentralCourses = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching Class Central courses...');
    
    // Class Central has a free API for course data
    const response = await fetch(`https://www.classcentral.com/api/courses?q=${encodeURIComponent(searchKeywords)}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Class Central API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results?.map(course => ({
      id: `classcentral_${course.id}`,
      title: course.name,
      description: course.description,
      instructor: course.instructors?.[0]?.name || course.provider,
      provider: course.provider,
      rating: course.rating,
      students: course.learners_count,
      price: course.price || 0,
      level: course.level,
      duration: course.length,
      imageUrl: course.image_url,
      url: course.url,
      category: course.subject,
      language: course.language,
      lastUpdated: course.start_date,
      isPaid: course.price > 0,
      tags: course.tags || []
    })) || [];

  } catch (error) {
    console.error('Error fetching Class Central courses:', error);
    return [];
  }
};

/**
 * Main course fetching function with multiple API sources
 * @param {string} searchKeywords - The keywords to search for
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Combined course results
 */
export const fetchCourses = async (searchKeywords, options = {}) => {
  const {
    useRealAPIs = true,
    sources = ['udemy', 'coursera', 'classcentral'], // Available sources
    maxPerSource = 10,
    fallbackToGenerated = true
  } = options;

  console.log(`Course Service: Searching for courses about "${searchKeywords}"...`);

  let allCourses = [];

  if (useRealAPIs && process.env.REACT_APP_RAPIDAPI_KEY) {
    // Fetch from multiple sources in parallel
    const apiPromises = [];

    if (sources.includes('udemy')) {
      apiPromises.push(fetchUdemyCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('coursera')) {
      apiPromises.push(fetchCourseraCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('classcentral')) {
      apiPromises.push(fetchClassCentralCourses(searchKeywords, maxPerSource));
    }
    
    if (sources.includes('edx')) {
      apiPromises.push(fetchEdxCourses(searchKeywords, maxPerSource));
    }

    try {
      const results = await Promise.allSettled(apiPromises);
      
      // Combine successful results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allCourses.push(...result.value);
        } else {
          console.warn(`API source ${sources[index]} failed:`, result.reason);
        }
      });

      // Remove duplicates based on title similarity
      allCourses = removeDuplicateCourses(allCourses);
      
    } catch (error) {
      console.error('Error fetching from APIs:', error);
    }
  }

  // Fallback to generated courses if no real courses found or APIs disabled
  if ((allCourses.length === 0 && fallbackToGenerated) || !useRealAPIs) {
    console.log('Using generated course catalog as fallback...');
    
    if (searchKeywords && searchKeywords.trim() !== '') {
      allCourses = searchCourses(searchKeywords);
    } else {
      allCourses = generateCourseCatalog();
    }
  }

  // Ensure we have courses and limit results
  if (allCourses.length === 0) {
    allCourses = generateCourseCatalog().slice(0, 20);
  }

  // Limit total results for performance
  allCourses = allCourses.slice(0, 50);

  console.log(`Found ${allCourses.length} courses total`);
  if (allCourses.length > 0) {
    console.log('Sample course:', allCourses[0]);
  }

  return allCourses;
};

/**
 * Remove duplicate courses based on title similarity
 * @param {Array} courses - Array of course objects
 * @returns {Array} - Deduplicated array
 */
const removeDuplicateCourses = (courses) => {
  const seen = new Set();
  return courses.filter(course => {
    const normalizedTitle = course.title.toLowerCase().trim();
    if (seen.has(normalizedTitle)) {
      return false;
    }
    seen.add(normalizedTitle);
    return true;
  });
};

/**
 * Get course details by ID from specific provider
 * @param {string} courseId - Course ID with provider prefix
 * @returns {Promise<Object>} - Detailed course information
 */
export const getCourseDetails = async (courseId) => {
  const [provider, id] = courseId.split('_');
  
  try {
    switch (provider) {
      case 'udemy':
        return await fetchUdemyCourseDetails(id);
      case 'coursera':
        return await fetchCourseraCourseDetails(id);
      case 'edx':
        return await fetchEdxCourseDetails(id);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
    return null;
  }
};

// Helper functions for detailed course fetching
const fetchUdemyCourseDetails = async (courseId) => {
  const response = await fetch(`${API_CONFIG.UDEMY_API.baseUrl}/v1/udemy/course-details/${courseId}`, {
    method: 'POST',
    headers: API_CONFIG.UDEMY_API.headers
  });
  
  if (!response.ok) throw new Error(`Udemy details API error: ${response.status}`);
  return await response.json();
};

const fetchCourseraCourseDetails = async (courseSlug) => {
  // Implementation for Coursera course details
  // This would depend on the specific Coursera API you're using
  return null;
};

const fetchEdxCourseDetails = async (courseId) => {
  // Implementation for edX course details
  // This would require OAuth authentication
  return null;
};

/**
 * Configuration function to set API keys
 * @param {Object} config - API configuration object
 */
export const configureAPIs = (config) => {
  if (config.rapidApiKey) {
    API_CONFIG.UDEMY_API.headers['X-RapidAPI-Key'] = config.rapidApiKey;
    API_CONFIG.COURSERA_API.headers['X-RapidAPI-Key'] = config.rapidApiKey;
  }
};

// Export API configuration for external use
export { API_CONFIG };
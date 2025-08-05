import { generateCourseCatalog, searchCourses } from './courseGenerator';

/**
 * Fetches course data from our generated course catalog.
 * @param {string} searchKeywords - The keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of course objects.
 */
export const fetchCourses = async (searchKeywords) => {
  console.log(`Course Service: Searching for courses about "${searchKeywords}"...`);
  
  try {
    // Use the course generator to get courses
    let courses = [];
    
    if (searchKeywords && searchKeywords.trim() !== '') {
      // Search for courses based on keywords
      courses = searchCourses(searchKeywords);
    } else {
      // Get all courses if no search keywords
      courses = generateCourseCatalog();
    }
    
    // Ensure we always have at least some courses
    if (courses.length === 0) {
      courses = generateCourseCatalog().slice(0, 20);
    }
    
    // Limit to 50 courses for performance
    courses = courses.slice(0, 50);
    
    console.log(`Found ${courses.length} courses matching "${searchKeywords}"`);
    console.log('Sample course:', courses[0]);
    return courses;

  } catch (error) {
    console.error("Failed to fetch courses:", error);
    // Return fallback courses
    return generateCourseCatalog().slice(0, 20);
  }
};
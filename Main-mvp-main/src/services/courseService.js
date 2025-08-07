import { generateCourseCatalog, searchCourses } from './courseGenerator';
import { RAPIDAPI_KEY, UDEMY_API_KEY, COURSERA_API_KEY } from '@env';

// Real course APIs integration
// const UDEMY_API_KEY = process.env.UDEMY_API_KEY; // You'll need to add these
// const COURSERA_API_KEY = process.env.COURSERA_API_KEY;

/**
 * ✅ IMPLEMENTED - Fetches courses from the "Udemy Paid Courses for Free" API on RapidAPI
 */
const fetchUdemyCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping Udemy API fetch.');
    return [];
  }

  // Fix: Provide a default search term when empty
  const query = searchKeywords || 'programming';
  const url = `https://udemy-paid-courses-for-free-api.p.rapidapi.com/rapidapi/courses/search?page=1&page_size=${maxResults}&query=${encodeURIComponent(query)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'udemy-paid-courses-for-free-api.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching Udemy courses from RapidAPI for: "${query}"`);
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
 * ✅ NEW - Fetches courses from Skillshare API via RapidAPI
 */
const fetchSkillshareCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping Skillshare API fetch.');
    return [];
  }

  const query = searchKeywords || 'programming';
  const url = `https://skillshare.p.rapidapi.com/search?query=${encodeURIComponent(query)}&limit=${maxResults}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'skillshare.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching Skillshare courses from RapidAPI for: "${query}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Skillshare RapidAPI request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const coursesFromApi = result.courses || result.data || [];

    const normalizedCourses = coursesFromApi.map((course, index) => {
      const uniqueId = `skillshare_${course.id || course.course_id || index}_${index}`;
      return {
        id: uniqueId,
        title: course.title || course.name,
        provider: 'Skillshare',
        category: course.category || course.subject || 'Creative & Design',
        description: course.description || course.short_description || 'Creative and practical courses from industry experts',
        image: course.image || course.course_image || 'https://source.unsplash.com/400x300/?creative,design',
        price: course.price || 'Free',
        url: course.url || course.course_url || `https://www.skillshare.com/classes/${course.id}`,
        level: course.level || 'All Levels',
        duration: course.duration || course.length || 'N/A',
        skills: course.skills || [],
        rating: course.rating || 4.4,
        students: course.enrollment || course.students || 0
      };
    });

    console.log(`Successfully fetched and normalized ${normalizedCourses.length} courses from Skillshare.`);
    return normalizedCourses;
  } catch (error) {
    console.error('Skillshare RapidAPI fetch error:', error.message);
    return []; // Return empty array on failure, which triggers the fallback
  }
};

/**
 * ✅ NEW - Fetches courses from YouTube Education API via RapidAPI
 */
const fetchYouTubeCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping YouTube API fetch.');
    return [];
  }

  const query = searchKeywords || 'programming tutorial';
  const url = `https://youtube-search-results.p.rapidapi.com/youtube-search/?q=${encodeURIComponent(query)}&limit=${maxResults}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'youtube-search-results.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching YouTube courses from RapidAPI for: "${query}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`YouTube RapidAPI request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const videosFromApi = result.items || result.videos || [];

    const normalizedCourses = videosFromApi.map((video, index) => {
      const uniqueId = `youtube_${video.id || video.video_id || index}_${index}`;
      return {
        id: uniqueId,
        title: video.title || video.name,
        provider: 'YouTube',
        category: 'Education',
        description: video.description || video.snippet || 'Educational video content',
        image: video.thumbnail || video.image || 'https://source.unsplash.com/400x300/?youtube,education',
        price: 'Free',
        url: video.url || video.link || `https://www.youtube.com/watch?v=${video.id}`,
        level: 'All Levels',
        duration: video.duration || 'N/A',
        skills: [],
        rating: 4.3,
        students: video.view_count || 0
      };
    });

    console.log(`Successfully fetched and normalized ${normalizedCourses.length} courses from YouTube.`);
    return normalizedCourses;
  } catch (error) {
    console.error('YouTube RapidAPI fetch error:', error.message);
    return []; // Return empty array on failure, which triggers the fallback
  }
};

/**
 * ✅ NEW - Fetches courses from LinkedIn Learning API via RapidAPI
 */
const fetchLinkedInCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping LinkedIn Learning API fetch.');
    return [];
  }

  const query = searchKeywords || 'programming';
  const url = `https://linkedin-learning.p.rapidapi.com/search?q=${encodeURIComponent(query)}&limit=${maxResults}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'linkedin-learning.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching LinkedIn Learning courses from RapidAPI for: "${query}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`LinkedIn Learning RapidAPI request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const coursesFromApi = result.courses || result.data || [];

    const normalizedCourses = coursesFromApi.map((course, index) => {
      const uniqueId = `linkedin_${course.id || course.course_id || index}_${index}`;
      return {
        id: uniqueId,
        title: course.title || course.name,
        provider: 'LinkedIn Learning',
        category: course.category || course.subject || 'Professional Development',
        description: course.description || course.short_description || 'Professional development courses for career growth',
        image: course.image || course.course_image || 'https://source.unsplash.com/400x300/?professional,learning',
        price: course.price || '$29.99',
        url: course.url || course.course_url || `https://www.linkedin.com/learning/${course.id}`,
        level: course.level || 'All Levels',
        duration: course.duration || course.length || 'N/A',
        skills: course.skills || [],
        rating: course.rating || 4.5,
        students: course.enrollment || course.students || 0
      };
    });

    console.log(`Successfully fetched and normalized ${normalizedCourses.length} courses from LinkedIn Learning.`);
    return normalizedCourses;
  } catch (error) {
    console.error('LinkedIn Learning RapidAPI fetch error:', error.message);
    return []; // Return empty array on failure, which triggers the fallback
  }
};

/**
 * ✅ NEW - Fetches courses from Pluralsight API via RapidAPI
 */
const fetchPluralsightCourses = async (searchKeywords, maxResults = 15) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured. Skipping Pluralsight API fetch.');
    return [];
  }

  const query = searchKeywords || 'programming';
  const url = `https://pluralsight-courses.p.rapidapi.com/search?q=${encodeURIComponent(query)}&limit=${maxResults}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'pluralsight-courses.p.rapidapi.com'
    }
  };

  try {
    console.log(`Fetching Pluralsight courses from RapidAPI for: "${query}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Pluralsight RapidAPI request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const coursesFromApi = result.courses || result.data || [];

    const normalizedCourses = coursesFromApi.map((course, index) => {
      const uniqueId = `pluralsight_${course.id || course.course_id || index}_${index}`;
      return {
        id: uniqueId,
        title: course.title || course.name,
        provider: 'Pluralsight',
        category: course.category || course.subject || 'Technology',
        description: course.description || course.short_description || 'Technology and software development courses',
        image: course.image || course.course_image || 'https://source.unsplash.com/400x300/?technology,software',
        price: course.price || '$29/month',
        url: course.url || course.course_url || `https://www.pluralsight.com/courses/${course.id}`,
        level: course.level || 'All Levels',
        duration: course.duration || course.length || 'N/A',
        skills: course.skills || [],
        rating: course.rating || 4.6,
        students: course.enrollment || course.students || 0
      };
    });

    console.log(`Successfully fetched and normalized ${normalizedCourses.length} courses from Pluralsight.`);
    return normalizedCourses;
  } catch (error) {
    console.error('Pluralsight RapidAPI fetch error:', error.message);
    return []; // Return empty array on failure, which triggers the fallback
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
    sources = ['udemy', 'skillshare', 'youtube', 'linkedin', 'pluralsight'], // ALL APIs
    maxPerSource = 15,
    fallbackToGenerated = true
  } = options;

  // Fix: Provide a better default search term
  const query = searchKeywords || 'programming technology';
  console.log(`Course Service: Searching for "${query}" with options:`, options);
  
  let allCourses = [];

  if (useRealAPIs && RAPIDAPI_KEY) {
    // Try to fetch from real APIs
    const fetchPromises = [];
    
    if (sources.includes('udemy')) {
      fetchPromises.push(fetchUdemyCourses(query, maxPerSource));
    }
    
    if (sources.includes('skillshare')) {
      fetchPromises.push(fetchSkillshareCourses(query, maxPerSource));
    }
    
    if (sources.includes('youtube')) {
      fetchPromises.push(fetchYouTubeCourses(query, maxPerSource));
    }
    
    if (sources.includes('linkedin')) {
      fetchPromises.push(fetchLinkedInCourses(query, maxPerSource));
    }
    
    if (sources.includes('pluralsight')) {
      fetchPromises.push(fetchPluralsightCourses(query, maxPerSource));
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
    const generatedCourses = generateRelevantCourses(query, 30);
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

const generateEnhancedCourseCatalog = () => {
  const enhancedCourses = [
    // AI and Machine Learning Courses
    {
      id: 'ai_ml_fundamentals_001',
      title: 'Machine Learning Fundamentals with Python',
      provider: 'TechEd Online',
      category: 'Artificial Intelligence',
      level: 'Intermediate',
      duration: '12 weeks',
      description: 'Master machine learning algorithms including supervised learning, unsupervised learning, and neural networks. Build real AI applications using Python, scikit-learn, and TensorFlow.',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Neural Networks'],
      image: 'https://source.unsplash.com/400x300/?machine-learning,ai',
      rating: 4.8,
      students: 25000,
      price: '$199',
      url: 'https://example.com/ml-course'
    },
    
    // edX-style University Courses
    {
      id: 'edx_cs50_001',
      title: 'CS50: Introduction to Computer Science',
      provider: 'edX - Harvard University',
      category: 'Computer Science',
      level: 'Beginner',
      duration: '12 weeks',
      description: 'An introduction to the intellectual enterprises of computer science and the art of programming. Learn from Harvard University professors.',
      skills: ['C', 'Python', 'SQL', 'JavaScript', 'Computer Science Fundamentals'],
      image: 'https://source.unsplash.com/400x300/?harvard,computer-science',
      rating: 4.9,
      students: 50000,
      price: 'Free',
      url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science'
    },
    {
      id: 'edx_mit_001',
      title: 'Introduction to Computer Science and Programming Using Python',
      provider: 'edX - MIT',
      category: 'Computer Science',
      level: 'Beginner',
      duration: '9 weeks',
      description: 'Learn the fundamentals of computer science and programming with Python. Taught by MIT professors.',
      skills: ['Python', 'Algorithms', 'Data Structures', 'Problem Solving'],
      image: 'https://source.unsplash.com/400x300/?mit,programming',
      rating: 4.8,
      students: 35000,
      price: 'Free',
      url: 'https://www.edx.org/course/introduction-to-computer-science-and-programming-7'
    },
    {
      id: 'edx_berkeley_001',
      title: 'Data Science: Machine Learning',
      provider: 'edX - UC Berkeley',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '8 weeks',
      description: 'Build a movie recommendation system and learn the science behind one of the most popular and successful data science techniques.',
      skills: ['R', 'Machine Learning', 'Statistics', 'Data Analysis'],
      image: 'https://source.unsplash.com/400x300/?berkeley,data-science',
      rating: 4.7,
      students: 28000,
      price: 'Free',
      url: 'https://www.edx.org/course/data-science-machine-learning'
    },
    
    // Coursera-style Professional Courses
    {
      id: 'coursera_google_001',
      title: 'Google IT Support Professional Certificate',
      provider: 'Coursera - Google',
      category: 'IT Support',
      level: 'Beginner',
      duration: '6 months',
      description: 'Prepare for a career in IT support with this comprehensive program from Google. Learn troubleshooting, customer service, and system administration.',
      skills: ['IT Support', 'Troubleshooting', 'Customer Service', 'System Administration'],
      image: 'https://source.unsplash.com/400x300/?google,it-support',
      rating: 4.6,
      students: 45000,
      price: '$49/month',
      url: 'https://www.coursera.org/professional-certificates/google-it-support'
    },
    {
      id: 'coursera_ibm_001',
      title: 'IBM Data Science Professional Certificate',
      provider: 'Coursera - IBM',
      category: 'Data Science',
      level: 'Beginner',
      duration: '10 months',
      description: 'Launch your career in data science with this comprehensive program. Learn Python, SQL, machine learning, and data visualization.',
      skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Jupyter'],
      image: 'https://source.unsplash.com/400x300/?ibm,data-science',
      rating: 4.5,
      students: 38000,
      price: '$49/month',
      url: 'https://www.coursera.org/professional-certificates/ibm-data-science'
    },
    
    // ... [The rest of your extensive enhancedCourses list remains here] ...
    {
      id: 'startup_tech_015',
      title: 'Building Tech Startups: From Idea to Scale',
      provider: 'StartupTech Academy',
      category: 'Entrepreneurship',
      level: 'Intermediate',
      duration: '10 weeks',
      description: 'Learn how to build and scale technology startups. Cover idea validation, MVP development, funding, and growth strategies.',
      skills: ['Entrepreneurship', 'Startup Development', 'MVP', 'Product-Market Fit', 'Funding', 'Growth Hacking'],
      image: 'https://source.unsplash.com/400x300/?startup,entrepreneurship',
      rating: 4.7,
      students: 6500,
      price: '$299',
      url: 'https://example.com/startup-tech'
    }
  ];

  // Add the original course catalog for additional variety
  const originalCatalog = generateCourseCatalog();
  
  // Combine but prioritize enhanced courses
  return [...enhancedCourses, ...originalCatalog];
};

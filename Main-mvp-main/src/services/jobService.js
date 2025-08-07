// jobService.js - Service for fetching real job data from multiple APIs
import { RAPIDAPI_KEY } from '@env';

// API Configuration
const API_CONFIG = {
  // RapidAPI Job Search APIs
  JOBS_API: {
    baseUrl: 'https://jobs-api14.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jobs-api14.p.rapidapi.com'
    }
  },
  
  // Indeed API via RapidAPI
  INDEED_API: {
    baseUrl: 'https://indeed12.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'indeed12.p.rapidapi.com'
    }
  },

  // LinkedIn Jobs via RapidAPI
  LINKEDIN_API: {
    baseUrl: 'https://linkedin-jobs-search.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
    }
  },

  // GitHub Jobs (Free)
  GITHUB_JOBS: {
    baseUrl: 'https://jobs.github.com/positions.json',
    headers: {
      'Content-Type': 'application/json'
    }
  },

  // JSearch API (New)
  JSEARCH_API: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  }
};

// Fallback job generator for when APIs fail
const generateJobCatalog = (searchKeywords = '') => {
  const jobTemplates = [
    {
      titleTemplates: ['Frontend Developer', 'React Developer', 'UI/UX Developer', 'Web Developer'],
      companies: ['Microsoft', 'Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Spotify', 'Airbnb'],
      categories: ['Software Engineering', 'Web Development', 'Frontend'],
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Node.js'],
      locations: ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Tel Aviv'],
      workTypes: ['Full-time', 'Part-time', 'Contract', 'Remote']
    },
    {
      titleTemplates: ['Backend Developer', 'Full Stack Developer', 'Software Engineer', 'Node.js Developer'],
      companies: ['Uber', 'Slack', 'Dropbox', 'Salesforce', 'Oracle', 'IBM', 'Adobe', 'Zoom'],
      categories: ['Software Engineering', 'Backend Development', 'Full Stack'],
      skills: ['Node.js', 'Python', 'Java', 'MongoDB', 'PostgreSQL', 'AWS'],
      locations: ['Remote', 'Seattle', 'Austin', 'Toronto', 'Amsterdam', 'Dublin'],
      workTypes: ['Full-time', 'Contract', 'Remote']
    },
    {
      titleTemplates: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer'],
      companies: ['Tesla', 'OpenAI', 'DeepMind', 'Palantir', 'Snowflake', 'DataBricks'],
      categories: ['Data Science', 'Machine Learning', 'Analytics'],
      skills: ['Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Pandas'],
      locations: ['Remote', 'Palo Alto', 'Boston', 'Chicago', 'Montreal', 'Singapore'],
      workTypes: ['Full-time', 'Remote', 'Contract']
    },
    {
      titleTemplates: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Platform Engineer'],
      companies: ['AWS', 'Google Cloud', 'Microsoft Azure', 'HashiCorp', 'Docker', 'Kubernetes'],
      categories: ['DevOps', 'Cloud Computing', 'Infrastructure'],
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Linux'],
      locations: ['Remote', 'Dublin', 'Frankfurt', 'Sydney', 'Tokyo', 'São Paulo'],
      workTypes: ['Full-time', 'Remote']
    },
    {
      titleTemplates: ['Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer'],
      companies: ['Snapchat', 'TikTok', 'Instagram', 'WhatsApp', 'Telegram', 'Discord'],
      categories: ['Mobile Development', 'iOS', 'Android'],
      skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android'],
      locations: ['Remote', 'Los Angeles', 'Miami', 'Vancouver', 'Stockholm', 'Copenhagen'],
      workTypes: ['Full-time', 'Contract', 'Remote']
    }
  ];

  const jobs = [];
  const searchLower = searchKeywords.toLowerCase();

  jobTemplates.forEach((template, templateIndex) => {
    // Filter templates based on search keywords
    const isRelevant = !searchKeywords || 
      template.titleTemplates.some(title => title.toLowerCase().includes(searchLower)) ||
      template.categories.some(cat => cat.toLowerCase().includes(searchLower)) ||
      template.skills.some(skill => skill.toLowerCase().includes(searchLower));

    if (isRelevant) {
      template.titleTemplates.forEach((titleTemplate, titleIndex) => {
        template.companies.forEach((company, companyIndex) => {
          const job = {
            id: `generated_${templateIndex}_${titleIndex}_${companyIndex}`,
            title: titleTemplate,
            company: company,
            location: template.locations[Math.floor(Math.random() * template.locations.length)],
            workType: template.workTypes[Math.floor(Math.random() * template.workTypes.length)],
            category: template.categories[Math.floor(Math.random() * template.categories.length)],
            description: `We are looking for a talented ${titleTemplate} to join our ${company} team. You will be working on cutting-edge projects and collaborating with a world-class team.`,
            requirements: template.skills.slice(0, 4),
            skills: template.skills,
            salary: `$${(Math.floor(Math.random() * 100) + 50)}k - $${(Math.floor(Math.random() * 150) + 100)}k`,
            postedDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            image: `https://logo.clearbit.com/${company.toLowerCase().replace(/\s+/g, '')}.com`,
            url: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com`,
            isRemote: template.workTypes.includes('Remote'),
            experienceLevel: ['Entry Level', 'Mid Level', 'Senior Level'][Math.floor(Math.random() * 3)],
            department: template.categories[0]
          };
          jobs.push(job);
        });
      });
    }
  });

  return jobs.slice(0, 50); // Limit results
};

/**
 * Fetch jobs from Indeed via RapidAPI
 */
const fetchIndeedJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching Indeed jobs...');
    
    const response = await fetch(`${API_CONFIG.INDEED_API.baseUrl}/jobs/search`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.INDEED_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        location: 'Remote',
        page_id: '1',
        locality: 'us'
      })
    });

    if (!response.ok) {
      throw new Error(`Indeed API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.jobs?.map(job => ({
      id: `indeed_${job.job_id}`,
      title: job.job_title,
      company: job.company_name,
      location: job.job_location,
      workType: job.job_employment_type || 'Full-time',
      category: job.job_category || 'General',
      description: job.job_description,
      requirements: job.job_required_skills || [],
      skills: job.job_required_skills || [],
      salary: job.job_salary,
      postedDate: job.job_posted_date,
      url: job.job_apply_link,
      image: job.company_logo || `https://source.unsplash.com/400x400/?company,${job.company_name}`,
      isRemote: job.job_is_remote,
      experienceLevel: job.job_experience_required,
      department: job.job_category
    })) || [];

  } catch (error) {
    console.error('Error fetching Indeed jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from LinkedIn via RapidAPI
 */
const fetchLinkedInJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching LinkedIn jobs...');
    
    const response = await fetch(`${API_CONFIG.LINKEDIN_API.baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.LINKEDIN_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        location: 'Worldwide',
        dateSincePosted: 'past24Hours',
        jobType: 'full-time',
        remoteFilter: 'all',
        salary: '',
        experienceLevel: 'all',
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.data?.map(job => ({
      id: `linkedin_${job.jobId}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.type || 'Full-time',
      category: job.industries?.[0] || 'General',
      description: job.description,
      requirements: job.skills || [],
      skills: job.skills || [],
      salary: job.salary,
      postedDate: job.postDate,
      url: job.jobUrl,
      image: job.companyLogo || `https://source.unsplash.com/400x400/?company,${job.company}`,
      isRemote: job.location?.toLowerCase().includes('remote'),
      experienceLevel: job.experienceLevel,
      department: job.function
    })) || [];

  } catch (error) {
    console.error('Error fetching LinkedIn jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from GitHub Jobs (Free but limited)
 */
const fetchGitHubJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching GitHub jobs...');
    
    const params = new URLSearchParams({
      description: searchKeywords,
      location: 'remote',
      full_time: 'true'
    });

    const response = await fetch(`${API_CONFIG.GITHUB_JOBS.baseUrl}?${params}`, {
      headers: API_CONFIG.GITHUB_JOBS.headers
    });

    if (!response.ok) {
      throw new Error(`GitHub Jobs API error: ${response.status}`);
    }

    const jobs = await response.json();
    
    return jobs.slice(0, limit).map(job => ({
      id: `github_${job.id}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.type || 'Full-time',
      category: 'Software Engineering',
      description: job.description,
      requirements: [],
      skills: [],
      salary: null,
      postedDate: job.created_at,
      url: job.url,
      image: job.company_logo || `https://source.unsplash.com/400x400/?company,${job.company}`,
      isRemote: job.location?.toLowerCase().includes('remote'),
      experienceLevel: 'Mid Level',
      department: 'Engineering'
    }));

  } catch (error) {
    console.error('Error fetching GitHub jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from general Jobs API
 */
const fetchGeneralJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching general jobs...');
    
    const response = await fetch(`${API_CONFIG.JOBS_API.baseUrl}/job/search`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.JOBS_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        location: 'Remote',
        autoTranslateLocation: false,
        remoteOnly: false,
        employmentTypes: 'fulltime;parttime;contractor',
        index: 0
      })
    });

    if (!response.ok) {
      throw new Error(`Jobs API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.jobs?.slice(0, limit).map(job => ({
      id: `jobsapi_${job.jobId}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.jobType || 'Full-time',
      category: job.jobFamily || 'General',
      description: job.description,
      requirements: job.requiredSkills || [],
      skills: job.requiredSkills || [],
      salary: job.estimatedSalary,
      postedDate: job.datePosted,
      url: job.jobProviders?.[0]?.url,
      image: job.companyLogo || `https://source.unsplash.com/400x400/?company,${job.company}`,
      isRemote: job.isRemote,
      experienceLevel: job.seniorityLevel,
      department: job.jobFamily
    })) || [];

  } catch (error) {
    console.error('Error fetching general jobs:', error);
    return [];
  }
};

/**
 * ✅ NEW - Fetches jobs from the JSearch API and normalizes the data.
 */
const fetchJSearchJobs = async (searchKeywords, limit = 20) => {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not found in config. Skipping JSearch API fetch.');
    return [];
  }

  // Fix: Use the correct JSearch API endpoint and parameters
  const query = searchKeywords || 'software developer'; // Default search term
  const url = `${API_CONFIG.JSEARCH_API.baseUrl}/search?query=${encodeURIComponent(query)}&num_pages=1&country=US`;
  const options = {
    method: 'GET',
    headers: API_CONFIG.JSEARCH_API.headers
  };

  try {
    console.log(`Fetching jobs from JSearch for: "${query}"`);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`JSearch API request failed with status: ${response.status}`);
    }
    const result = await response.json();
    const jobsFromApi = result.data || []; // The jobs are in the 'data' property

    // IMPORTANT: Normalize the API data to match your app's structure
    const normalizedJobs = jobsFromApi.map(job => ({
      id: `jsearch_${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_location,
      workType: job.job_employment_type || 'Full-time',
      category: 'General', // JSearch doesn't provide a clear category
      description: job.job_description,
      skills: [], // JSearch doesn't provide a clean skills array
      url: job.job_apply_link,
      image: job.employer_logo,
      isRemote: job.job_is_remote,
      postedDate: job.job_posted_at_datetime_utc,
      salary: (job.job_min_salary && job.job_max_salary)
        ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()} ${job.job_salary_period}`
        : 'Not Disclosed',
      experienceLevel: 'N/A'
    }));

    console.log(`Successfully fetched and normalized ${normalizedJobs.length} jobs from JSearch.`);
    return normalizedJobs.slice(0, limit);

  } catch (error) {
    console.error('JSearch API fetch error:', error.message);
    return []; // Return empty array on failure to trigger the fallback
  }
};

/**
 * Remove duplicate jobs based on title and company similarity
 */
const removeDuplicateJobs = (jobs) => {
  const seen = new Map();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key, true);
    return true;
  });
};

/**
 * Main job fetching function with multiple API sources
 * @param {string} searchKeywords - The keywords to search for
 * @param {Object} options - Fetch options
 * @returns {Promise<Array>} - Combined job results
 */
export const fetchJobs = async (searchKeywords, options = {}) => {
  const {
    useRealAPIs = true,
    fallbackToGenerated = true
  } = options;

  // Fix: Provide a better default search term
  const query = searchKeywords || 'software developer';
  console.log(`Job Service: Searching for jobs about "${query}"...`);

  let allJobs = [];

  // Step 1: Try to fetch from the real API if requested
  if (useRealAPIs) {
    allJobs = await fetchJSearchJobs(query, 50); // Fetch more to have a good pool
  }

  // Step 2: ✅ YOUR SAFETY NET
  // If the API failed (returned 0 jobs), use the local generated jobs as a backup.
  if (allJobs.length === 0 && fallbackToGenerated) {
    console.log('API fetch failed or returned no results. Using generated job catalog as fallback...');
    allJobs = generateJobCatalog(query);
  }

  // Step 3: Remove duplicates and limit results
  const uniqueJobs = allJobs.filter((job, index, self) =>
    index === self.findIndex(j => j.title === job.title && j.company === job.company)
  );

  const finalJobs = uniqueJobs.slice(0, 20);

  console.log(`Found ${finalJobs.length} unique jobs total.`);
  return finalJobs;
};

/**
 * Get job details by ID from specific provider
 */
export const getJobDetails = async (jobId) => {
  const [provider, id] = jobId.split('_');
  
  try {
    switch (provider) {
      case 'indeed':
        return await fetchIndeedJobDetails(id);
      case 'linkedin':
        return await fetchLinkedInJobDetails(id);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error('Error fetching job details:', error);
    return null;
  }
};

// Helper functions for detailed job fetching
const fetchIndeedJobDetails = async (jobId) => {
  // Implementation would depend on the specific API
  return null;
};

const fetchLinkedInJobDetails = async (jobId) => {
  // Implementation would depend on the specific API
  return null;
};

/**
 * Configuration function to set API keys
 */
export const configureJobAPIs = (config) => {
  if (config.rapidApiKey) {
    API_CONFIG.JOBS_API.headers['X-RapidAPI-Key'] = config.rapidApiKey;
    API_CONFIG.INDEED_API.headers['X-RapidAPI-Key'] = config.rapidApiKey;
    API_CONFIG.LINKEDIN_API.headers['X-RapidAPI-Key'] = config.rapidApiKey;
  }
};

// Export for external use
export { API_CONFIG as JOB_API_CONFIG };
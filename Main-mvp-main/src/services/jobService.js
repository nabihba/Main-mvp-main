// ✅ REFACTORED - Simplified API Configuration for the one working API
import { RAPIDAPI_KEY } from '@env';
// ✅ REFACTORED - Simplified API Configuration for the one working API
const API_CONFIG = {
  JSEARCH_API: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY, // ✅ Changed from process.env.RAPIDAPI_KEY
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  }
};

// Fallback job generator for when APIs fail (Your original code, unchanged)
const generateJobCatalog = (searchKeywords = '') => {
  const jobTemplates = [
    {
      titleTemplates: ['Frontend Developer', 'React Developer', 'UI/UX Developer', 'Web Developer'],
      companies: ['Microsoft', 'Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Spotify', 'Airbnb'],
      categories: ['Software Engineering', 'Web Development', 'Frontend'],
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Node.js'],
      locations: ['Remote', 'Dubai', 'Riyadh', 'Doha', 'Abu Dhabi', 'Kuwait City'],
      workTypes: ['Full-time', 'Part-time', 'Contract', 'Remote']
    },
    {
      titleTemplates: ['Backend Developer', 'Full Stack Developer', 'Software Engineer', 'Node.js Developer'],
      companies: ['Uber', 'Slack', 'Dropbox', 'Salesforce', 'Oracle', 'IBM', 'Adobe', 'Zoom'],
      categories: ['Software Engineering', 'Backend Development', 'Full Stack'],
      skills: ['Node.js', 'Python', 'Java', 'MongoDB', 'PostgreSQL', 'AWS'],
      locations: ['Remote', 'Dubai', 'Riyadh', 'Doha', 'Abu Dhabi', 'Kuwait City'],
      workTypes: ['Full-time', 'Contract', 'Remote']
    },
  ];

  const jobs = [];
  const searchLower = searchKeywords.toLowerCase();

  jobTemplates.forEach((template, templateIndex) => {
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
  return jobs.slice(0, 50); // Generate more to have a good pool for filtering
};


/**
 * ✅ NEW - Fetches jobs from the JSearch API and normalizes the data.
 */
const fetchJSearchJobs = async (searchKeywords, limit = 20) => {
  if (!RAPIDAPI_KEY) { // ✅ Changed from API_CONFIG.JSEARCH_API.headers['X-RapidAPI-Key']
    console.log('RapidAPI key not found in config. Skipping JSearch API fetch.');
    return [];
  }

  const query = searchKeywords || 'software developer';
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
 * ✅ REFACTORED - Main job fetching function, now simplified.
 */
export const fetchJobs = async (searchKeywords, options = {}) => {
  const {
    useRealAPIs = true,
    fallbackToGenerated = true
  } = options;

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
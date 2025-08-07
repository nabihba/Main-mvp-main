// API Configuration
const API_CONFIG = {
  // RapidAPI Job Search APIs
  JOBS_API: {
    baseUrl: 'https://jobs-api14.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jobs-api14.p.rapidapi.com'
    }
  },
  
  // Indeed API via RapidAPI
  INDEED_API: {
    baseUrl: 'https://indeed12.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'indeed12.p.rapidapi.com'
    }
  },

  // LinkedIn Jobs via RapidAPI
  LINKEDIN_API: {
    baseUrl: 'https://linkedin-jobs-search.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
    }
  },

  // GitHub Jobs (Free but deprecated)
  GITHUB_JOBS: {
    baseUrl: 'https://jobs.github.com/positions.json',
    headers: {
      'Content-Type': 'application/json'
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

  return jobs.slice(0, 50);
};

/**
 * Fetch jobs from Indeed via RapidAPI (Updated for Gulf Region)
 */
const fetchIndeedJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching Indeed jobs for Gulf region...');
    
    const response = await fetch(`${API_CONFIG.INDEED_API.baseUrl}/jobs/search`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.INDEED_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        // ✅ --- UPDATE --- ✅
        location: 'Dubai, AE', 
        page_id: '1',
      })
    });

    if (!response.ok) throw new Error(`Indeed API error: ${response.status}`);
    const data = await response.json();
    
    return data.jobs?.map(job => ({
      id: `indeed_${job.job_id}`,
      title: job.job_title,
      company: job.company_name,
      location: job.job_location,
      workType: job.job_employment_type || 'Full-time',
      category: job.job_category || 'General',
      description: job.job_description,
      skills: job.job_required_skills || [],
      url: job.job_apply_link,
      image: job.company_logo || `https://source.unsplash.com/400x400/?company,${job.company_name}`,
      isRemote: job.job_is_remote,
    })) || [];
  } catch (error) {
    console.error('Error fetching Indeed jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from LinkedIn via RapidAPI (Updated for Gulf Region)
 */
const fetchLinkedInJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching LinkedIn jobs for Gulf region...');
    
    const response = await fetch(`${API_CONFIG.LINKEDIN_API.baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.LINKEDIN_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        // ✅ --- UPDATE --- ✅
        location: 'United Arab Emirates, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain',
        remoteFilter: 'all',
        limit: limit
      })
    });

    if (!response.ok) throw new Error(`LinkedIn API error: ${response.status}`);
    const data = await response.json();
    
    return data.data?.map(job => ({
      id: `linkedin_${job.jobId}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.type || 'Full-time',
      category: job.industries?.[0] || 'General',
      description: job.description,
      skills: job.skills || [],
      url: job.jobUrl,
      image: job.companyLogo || `https://source.unsplash.com/400x400/?company,${job.company}`,
      isRemote: job.location?.toLowerCase().includes('remote'),
    })) || [];
  } catch (error) {
    console.error('Error fetching LinkedIn jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from GitHub Jobs (Focus on Remote)
 */
const fetchGitHubJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching GitHub jobs (Remote)...');
    
    const params = new URLSearchParams({ description: searchKeywords, location: 'remote' });
    const response = await fetch(`${API_CONFIG.GITHUB_JOBS.baseUrl}?${params}`, {
      headers: API_CONFIG.GITHUB_JOBS.headers
    });

    if (!response.ok) throw new Error(`GitHub Jobs API error: ${response.status}`);
    const jobs = await response.json();
    
    return jobs.slice(0, limit).map(job => ({
      id: `github_${job.id}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.type || 'Full-time',
      category: 'Software Engineering',
      description: job.description,
      skills: [],
      url: job.url,
      image: job.company_logo,
      isRemote: true,
    }));
  } catch (error) {
    console.error('Error fetching GitHub jobs:', error);
    return [];
  }
};

/**
 * Fetch jobs from general Jobs API (Updated for Gulf Region)
 */
const fetchGeneralJobs = async (searchKeywords, limit = 20) => {
  try {
    console.log('Fetching general jobs for Gulf region...');
    
    const response = await fetch(`${API_CONFIG.JOBS_API.baseUrl}/job/search`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.JOBS_API.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchKeywords,
        // ✅ --- UPDATE --- ✅
        location: 'Middle East',
        remoteOnly: true,
      })
    });

    if (!response.ok) throw new Error(`Jobs API error: ${response.status}`);
    const data = await response.json();
    
    return data.jobs?.slice(0, limit).map(job => ({
      id: `jobsapi_${job.jobId}`,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.jobType || 'Full-time',
      category: job.jobFamily || 'General',
      description: job.description,
      skills: job.requiredSkills || [],
      url: job.jobProviders?.[0]?.url,
      image: job.companyLogo,
      isRemote: job.isRemote,
    })) || [];
  } catch (error) {
    console.error('Error fetching general jobs:', error);
    return [];
  }
};

/**
 * Remove duplicate jobs based on title and company similarity
 */
const removeDuplicateJobs = (jobs) => {
  const seen = new Map();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
};

/**
 * Main job fetching function with multiple API sources
 */
export const fetchJobs = async (searchKeywords, options = {}) => {
  const {
    useRealAPIs = true,
    sources = ['indeed', 'linkedin', 'general'],
    maxPerSource = 10,
    fallbackToGenerated = true
  } = options;

  console.log(`Job Service: Searching for jobs about "${searchKeywords}"...`);

  let allJobs = [];

  if (useRealAPIs && process.env.REACT_APP_RAPIDAPI_KEY) {
    const apiPromises = [];

    if (sources.includes('indeed')) apiPromises.push(fetchIndeedJobs(searchKeywords, maxPerSource));
    if (sources.includes('linkedin')) apiPromises.push(fetchLinkedInJobs(searchKeywords, maxPerSource));
    if (sources.includes('github')) apiPromises.push(fetchGitHubJobs(searchKeywords, maxPerSource));
    if (sources.includes('general')) apiPromises.push(fetchGeneralJobs(searchKeywords, maxPerSource));

    try {
      const results = await Promise.allSettled(apiPromises);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allJobs.push(...result.value);
        } else {
          console.warn(`API source ${sources[index]} failed:`, result.reason);
        }
      });
      allJobs = removeDuplicateJobs(allJobs);
    } catch (error) {
      console.error('Error fetching from job APIs:', error);
    }
  }

  if ((allJobs.length === 0 && fallbackToGenerated) || !useRealAPIs) {
    console.log('Using generated job catalog as fallback...');
    allJobs = generateJobCatalog(searchKeywords);
  }

  if (allJobs.length === 0) {
    allJobs = generateJobCatalog().slice(0, 20);
  }

  // Limit total results for performance
  allJobs = allJobs.slice(0, 20);

  console.log(`Found ${allJobs.length} jobs total`);
  return allJobs;
};
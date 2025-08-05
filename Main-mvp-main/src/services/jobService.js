import { generateJobCatalog, searchJobs } from './jobGenerator';

/**
 * Searches for jobs using the Jsearch API with fallback to generated jobs.
 * @param {string} searchKeywords - The job title or keywords to search for.
 * @returns {Promise<Array>} - A promise that resolves with a list of job objects.
 */
export const fetchJobs = async (searchKeywords) => {
  console.log(`Job Service: Searching for jobs related to "${searchKeywords}"...`);
  
  try {
    // Try to get jobs from the API first
    const JSEARCH_API_KEY = 'ce730dd6c4mshfc23865116522b3p13e9bbjsn7f26457d877f';
    const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
    
    const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchKeywords)}&location=AE,SA,QA,KW,OM,BH`;

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': JSEARCH_API_HOST
      }
    };

    const response = await fetch(apiUrl, options);
    if (response.ok) {
      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        // Clean up the job data into a format our app can use
        const jobs = data.data.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
          description: job.job_description,
          image: job.employer_logo,
          job_url: job.job_apply_link,
        }));

        console.log(`Found ${jobs.length} jobs from API`);
        console.log('Sample job:', jobs[0]);
        return jobs;
      }
    }
  } catch (error) {
    console.error("Failed to fetch from Jsearch API:", error);
  }

  // Fallback to generated jobs
  console.log("Using generated jobs as fallback");
  const generatedJobs = searchJobs(searchKeywords);
  console.log(`Generated ${generatedJobs.length} jobs`);
  console.log('Sample generated job:', generatedJobs[0]);
  return generatedJobs.slice(0, 20); // Limit to 20 jobs
};
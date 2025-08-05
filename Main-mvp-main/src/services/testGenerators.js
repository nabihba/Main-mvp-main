// Test file to verify course and job generators are working
import { generateCourseCatalog, searchCourses } from './courseGenerator';
import { generateJobCatalog, searchJobs } from './jobGenerator';

export const testGenerators = () => {
  console.log('=== Testing Course Generator ===');
  const courses = generateCourseCatalog();
  console.log(`Generated ${courses.length} courses`);
  console.log('Sample course:', courses[0]);
  
  const searchedCourses = searchCourses('software');
  console.log(`Found ${searchedCourses.length} courses matching 'software'`);
  
  console.log('=== Testing Job Generator ===');
  const jobs = generateJobCatalog();
  console.log(`Generated ${jobs.length} jobs`);
  console.log('Sample job:', jobs[0]);
  
  const searchedJobs = searchJobs('developer');
  console.log(`Found ${searchedJobs.length} jobs matching 'developer'`);
  
  return {
    courses: courses.slice(0, 3),
    jobs: jobs.slice(0, 3)
  };
}; 
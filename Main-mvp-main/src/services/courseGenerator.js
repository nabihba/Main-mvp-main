// Course Generator Service - Translates Python logic to JavaScript
// This generates courses similar to the Python code provided

const universities = [
  'MIT', 'Columbia', 'Harvard', 'Stanford', 'Yale', 'Princeton', 
  'Berkeley', 'Cornell', 'Oxford', 'Cambridge'
];

const courseTopics = [
  {
    title: 'Mastering Machine Learning Algorithms',
    skills: ['Machine Learning', 'Python', 'Neural Networks', 'Data Analysis'],
    category: 'Technology'
  },
  {
    title: 'Advanced Digital Marketing Strategy',
    skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
    category: 'Marketing'
  },
  {
    title: 'Cybersecurity Defense & Offense',
    skills: ['Encryption', 'Network Security', 'Risk Management', 'Incident Response'],
    category: 'Technology'
  },
  {
    title: 'Full-Stack Web Development Mastery',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    category: 'Technology'
  },
  {
    title: 'Data Science & Business Intelligence',
    skills: ['R', 'Python', 'Statistics', 'Data Visualization', 'SQL'],
    category: 'Technology'
  },
  {
    title: 'Professional Creative Writing',
    skills: ['Storytelling', 'Editing', 'Poetry', 'Fiction Writing', 'Publishing'],
    category: 'Arts'
  },
  {
    title: 'Agile Project Management Professional',
    skills: ['Agile', 'Scrum', 'Risk Management', 'Scheduling', 'Leadership'],
    category: 'Business'
  },
  {
    title: 'UX/UI Design & User Experience',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Accessibility'],
    category: 'Design'
  },
  {
    title: 'Critical Thinking & Philosophy',
    skills: ['Critical Thinking', 'Logic', 'Ethics', 'Philosophical Analysis', 'Debate'],
    category: 'Education'
  },
  {
    title: 'Financial Accounting & Analysis',
    skills: ['Bookkeeping', 'Balance Sheets', 'Income Statements', 'Budgeting', 'Tax'],
    category: 'Business'
  },
  {
    title: 'Startup Entrepreneurship & Innovation',
    skills: ['Business Planning', 'Pitching', 'Market Research', 'Startup Growth', 'Funding'],
    category: 'Business'
  },
  {
    title: 'Professional Photography & Editing',
    skills: ['Composition', 'Lighting', 'Editing', 'DSLR usage', 'Adobe Lightroom'],
    category: 'Arts'
  },
  {
    title: 'Blockchain Development & Smart Contracts',
    skills: ['Blockchain', 'Ethereum', 'Cryptography', 'Smart Contracts', 'Solidity'],
    category: 'Technology'
  },
  {
    title: 'Robotics & Automation Engineering',
    skills: ['Robotics', 'Arduino', 'Automation', 'Programming', 'IoT'],
    category: 'Technology'
  },
  {
    title: 'Advanced Graphic Design & Branding',
    skills: ['Photoshop', 'Illustrator', 'Typography', 'Visual Branding', 'Print Design'],
    category: 'Design'
  },
  {
    title: 'Excel Power User & Data Analysis',
    skills: ['Pivot Tables', 'Macros', 'Data Analysis', 'Visualization', 'VBA'],
    category: 'Business'
  },
  {
    title: 'Cloud Architecture & DevOps',
    skills: ['AWS', 'Azure', 'Cloud Architecture', 'Deployment', 'Docker'],
    category: 'Technology'
  },
  {
    title: 'Clinical Psychology & Counseling',
    skills: ['Cognitive Psychology', 'Behavior Analysis', 'Therapy Basics', 'Research Methods', 'Assessment'],
    category: 'Healthcare'
  },
  {
    title: 'Music Production & Audio Engineering',
    skills: ['Logic Pro', 'Ableton', 'Mixing', 'Audio Engineering', 'Sound Design'],
    category: 'Arts'
  },
  {
    title: 'Sustainable Energy & Green Technology',
    skills: ['Solar Power', 'Wind Energy', 'Sustainability', 'Energy Policy', 'Climate Change'],
    category: 'Environment'
  },
  {
    title: 'Mobile App Development & React Native',
    skills: ['React Native', 'iOS', 'Android', 'Mobile UI', 'App Store'],
    category: 'Technology'
  },
  {
    title: 'Digital Art & 3D Modeling',
    skills: ['Blender', 'Maya', '3D Modeling', 'Texturing', 'Animation'],
    category: 'Arts'
  },
  {
    title: 'Business Intelligence & Analytics',
    skills: ['Power BI', 'Tableau', 'Data Mining', 'Predictive Analytics', 'KPI'],
    category: 'Business'
  },
  {
    title: 'Network Security & Ethical Hacking',
    skills: ['Penetration Testing', 'Vulnerability Assessment', 'Security Tools', 'Incident Response', 'Forensics'],
    category: 'Technology'
  },
  {
    title: 'Content Creation & Social Media Marketing',
    skills: ['Video Editing', 'Content Strategy', 'Social Media', 'Influencer Marketing', 'Analytics'],
    category: 'Marketing'
  },
  {
    title: 'Supply Chain Management & Logistics',
    skills: ['Inventory Management', 'Logistics', 'Procurement', 'Warehouse Management', 'Transportation'],
    category: 'Business'
  },
  {
    title: 'Human Resources & Talent Management',
    skills: ['Recruitment', 'Employee Relations', 'Performance Management', 'Training', 'HR Analytics'],
    category: 'Business'
  },
  {
    title: 'Healthcare Administration & Management',
    skills: ['Healthcare Systems', 'Medical Billing', 'Patient Care', 'Healthcare Policy', 'Quality Management'],
    category: 'Healthcare'
  },
  {
    title: 'Environmental Science & Conservation',
    skills: ['Ecology', 'Conservation Biology', 'Environmental Policy', 'Climate Science', 'Sustainability'],
    category: 'Environment'
  },
  {
    title: 'Culinary Arts & Food Service Management',
    skills: ['Cooking Techniques', 'Menu Planning', 'Food Safety', 'Restaurant Management', 'Catering'],
    category: 'Hospitality'
  },
  {
    title: 'Event Planning & Hospitality Management',
    skills: ['Event Coordination', 'Venue Management', 'Catering', 'Guest Services', 'Marketing'],
    category: 'Hospitality'
  },
  {
    title: 'Real Estate Investment & Property Management',
    skills: ['Property Analysis', 'Investment Strategies', 'Property Management', 'Real Estate Law', 'Market Analysis'],
    category: 'Business'
  },
  {
    title: 'Fashion Design & Merchandising',
    skills: ['Fashion Design', 'Pattern Making', 'Textile Science', 'Merchandising', 'Fashion Marketing'],
    category: 'Arts'
  },
  {
    title: 'Sports Management & Athletic Administration',
    skills: ['Sports Marketing', 'Athletic Administration', 'Event Management', 'Sports Law', 'Facility Management'],
    category: 'Sports'
  },
  {
    title: 'Public Relations & Corporate Communications',
    skills: ['Media Relations', 'Crisis Communication', 'Brand Management', 'Stakeholder Engagement', 'PR Strategy'],
    category: 'Business'
  },
  {
    title: 'Interior Design & Space Planning',
    skills: ['Space Planning', 'Color Theory', 'Furniture Design', 'Lighting Design', 'CAD Software'],
    category: 'Design'
  },
  {
    title: 'Game Development & Unity Programming',
    skills: ['Unity', 'C#', 'Game Design', '3D Modeling', 'Game Mechanics'],
    category: 'Technology'
  },
  {
    title: 'Artificial Intelligence & Deep Learning',
    skills: ['Deep Learning', 'TensorFlow', 'Computer Vision', 'NLP', 'AI Ethics'],
    category: 'Technology'
  },
  {
    title: 'Digital Transformation & Change Management',
    skills: ['Change Management', 'Digital Strategy', 'Process Improvement', 'Technology Adoption', 'Leadership'],
    category: 'Business'
  }
];

const softSkillTopics = [
  {
    title: 'Effective Communication',
    skills: ['Listening', 'Clarity', 'Empathy', 'Persuasion']
  },
  {
    title: 'Time Management Mastery',
    skills: ['Prioritization', 'Scheduling', 'Efficiency', 'Goal Setting']
  },
  {
    title: 'Leadership Essentials',
    skills: ['Decision Making', 'Team Management', 'Motivation', 'Delegation']
  },
  {
    title: 'Conflict Resolution',
    skills: ['Negotiation', 'Problem Solving', 'Mediation', 'Listening']
  },
  {
    title: 'Emotional Intelligence',
    skills: ['Self-Awareness', 'Empathy', 'Self-Regulation', 'Social Skills']
  },
  {
    title: 'Public Speaking Confidence',
    skills: ['Presentation Skills', 'Speech Writing', 'Audience Engagement', 'Storytelling']
  },
  {
    title: 'Teamwork & Collaboration',
    skills: ['Collaboration', 'Communication', 'Team Building', 'Conflict Management']
  },
  {
    title: 'Critical Thinking Skills',
    skills: ['Analysis', 'Problem Solving', 'Logic', 'Evaluation']
  },
  {
    title: 'Adaptability & Resilience',
    skills: ['Stress Management', 'Flexibility', 'Problem Solving', 'Growth Mindset']
  },
  {
    title: 'Networking for Success',
    skills: ['Relationship Building', 'Personal Branding', 'Communication', 'Confidence']
  },
  {
    title: 'Customer Service Excellence',
    skills: ['Active Listening', 'Empathy', 'Problem Solving', 'Communication']
  },
  {
    title: 'Negotiation Techniques',
    skills: ['Strategy', 'Persuasion', 'Communication', 'Conflict Resolution']
  },
  {
    title: 'Creative Problem Solving',
    skills: ['Innovation', 'Brainstorming', 'Analysis', 'Idea Development']
  },
  {
    title: 'Personal Branding',
    skills: ['Social Media', 'Networking', 'Presentation', 'Confidence']
  },
  {
    title: 'Career Development',
    skills: ['Goal Setting', 'Networking', 'Resume Writing', 'Interviewing']
  },
  {
    title: 'Stress Management',
    skills: ['Relaxation Techniques', 'Time Management', 'Mindfulness', 'Resilience']
  },
  {
    title: 'Cross-Cultural Communication',
    skills: ['Cultural Awareness', 'Listening', 'Empathy', 'Adaptability']
  },
  {
    title: 'Decision-Making Skills',
    skills: ['Analysis', 'Critical Thinking', 'Judgment', 'Problem Solving']
  },
  {
    title: 'Building Confidence',
    skills: ['Self-esteem', 'Public Speaking', 'Assertiveness', 'Personal Development']
  },
  {
    title: 'Work-Life Balance',
    skills: ['Time Management', 'Prioritization', 'Self-Care', 'Mindfulness']
  }
];

const randomDescription = (topic) => {
  const templates = [
    `Gain foundational knowledge in ${topic} through interactive sessions, practical exercises, and real-world projects guided by industry experts, suitable for beginners aiming to expand their skill set.`,
    `This introductory course covers the essentials of ${topic}, combining theory and hands-on experience to build confidence and competence for further exploration or career advancement.`,
    `Designed for those new to ${topic}, this course provides comprehensive lessons, expert guidance, and practical applications to ensure immediate skill enhancement and professional growth.`,
    `Explore fundamental concepts of ${topic} with structured lectures, collaborative assignments, and case studies that equip learners with essential skills and practical insights.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const getRandomSkills = (skillsPool, count) => {
  const shuffled = [...skillsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, skillsPool.length));
};

const generateCourses = (count, topicList) => {
  const courses = [];
  const usedTitles = new Set(); // Track used titles to avoid duplicates
  
  for (let i = 0; i < count; i++) {
    const uni = universities[Math.floor(Math.random() * universities.length)];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    
    // Create variations of the course title to make them unique
    let name = topic.title;
    let variation = 1;
    
    // If title already used, add a variation
    while (usedTitles.has(name)) {
      const variations = [
        `${topic.title} - Advanced Level`,
        `${topic.title} - Professional Edition`,
        `${topic.title} - Complete Guide`,
        `${topic.title} - Masterclass`,
        `${topic.title} - Expert Series`,
        `${topic.title} - Comprehensive Course`,
        `${topic.title} - Specialized Training`,
        `${topic.title} - Industry Focus`,
        `${topic.title} - Practical Workshop`,
        `${topic.title} - Intensive Program`
      ];
      name = variations[Math.floor(Math.random() * variations.length)];
      variation++;
      
      // If we've tried too many variations, add a random suffix
      if (variation > 10) {
        const suffixes = ['Pro', 'Plus', 'Elite', 'Premium', 'Advanced', 'Expert', 'Master', 'Specialist'];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        name = `${topic.title} ${suffix}`;
        break;
      }
    }
    
    usedTitles.add(name);
    const description = randomDescription(topic.title);
    const price = Math.floor(Math.random() * (600 - 70 + 1)) + 70;
    const lengthWeeks = Math.floor(Math.random() * 12) + 1;
    const length = `${lengthWeeks} weeks`;
    const skills = getRandomSkills(topic.skills, Math.floor(Math.random() * 4) + 2);
    
    courses.push({
      id: `course_${Date.now()}_${i}`,
      title: name,
      provider: uni,
      description: description,
      image: `https://source.unsplash.com/400x300/?${topic.title.split(' ')[0]},technology`,
      level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
      duration: length,
      price: price,
      skills: skills.join(', '),
      course_url: `https://example.com/course/${name.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  return courses;
};

export const generateCourseCatalog = () => {
  // Generate 1000 technical and 1000 soft-skill courses (total 2000)
  const technicalCourses = generateCourses(1000, courseTopics);
  const softSkillCourses = generateCourses(1000, softSkillTopics);
  
  // Combine both lists
  const allCourses = [...technicalCourses, ...softSkillCourses];
  
  // Shuffle the array to mix technical and soft skill courses
  return allCourses.sort(() => 0.5 - Math.random());
};

export const getCoursesByCategory = (category) => {
  const allCourses = generateCourseCatalog();
  
  if (category === 'technical') {
    return allCourses.filter(course => 
      courseTopics.some(topic => topic.title === course.title)
    );
  } else if (category === 'soft-skills') {
    return allCourses.filter(course => 
      softSkillTopics.some(topic => topic.title === course.title)
    );
  }
  
  return allCourses;
};

export const searchCourses = (searchTerm) => {
  const allCourses = generateCourseCatalog();
  const searchLower = searchTerm.toLowerCase();
  
  return allCourses.filter(course => 
    course.title.toLowerCase().includes(searchLower) ||
    course.description.toLowerCase().includes(searchLower) ||
    course.skills.toLowerCase().includes(searchLower) ||
    course.provider.toLowerCase().includes(searchLower)
  );
}; 
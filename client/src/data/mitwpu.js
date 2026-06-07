export const MITWPU_SCHOOLS = [
  {
    name: 'School of Engineering and Technology',
    courses: [
      { name: 'B.Tech Computer Science and Engineering', type: 'UG', duration: '4 Years' },
      { name: 'B.Tech CSE (Artificial Intelligence & Data Science)', type: 'UG', duration: '4 Years' },
      { name: 'B.Tech CSE (Cyber Security & Net.', type: 'UG', duration: '4 Years' },
      { name: 'B.Tech Mechanical Engineering', type: 'UG', duration: '4 Years' },
      { name: 'B.Tech Civil Engineering', type: 'UG', duration: '4 Years' },
      { name: 'B.Tech Electronics & Communication', type: 'UG', duration: '4 Years' },
      { name: 'M.Tech Data Science & Analytics', type: 'PG', duration: '2 Years' },
      { name: 'M.Tech VLSI & Embedded Systems', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Business',
    courses: [
      { name: 'BBA (General)', type: 'UG', duration: '3/4 Years' },
      { name: 'BBA (International Business)', type: 'UG', duration: '3/4 Years' },
      { name: 'BBA (Global e-Business)', type: 'UG', duration: '3/4 Years' },
      { name: 'MBA (Marketing)', type: 'PG', duration: '2 Years' },
      { name: 'MBA (Finance)', type: 'PG', duration: '2 Years' },
      { name: 'MBA (Human Resource)', type: 'PG', duration: '2 Years' },
      { name: 'MBA (Operations)', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Computer Science',
    courses: [
      { name: 'BCA (Science)', type: 'UG', duration: '3/4 Years' },
      { name: 'B.Sc Computer Science', type: 'UG', duration: '3/4 Years' },
      { name: 'MCA (Science)', type: 'PG', duration: '2 Years' },
      { name: 'MCA (Management)', type: 'PG', duration: '2 Years' },
      { name: 'M.Sc Computer Science', type: 'PG', duration: '2 Years' },
      { name: 'M.Sc Data Science', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Design',
    courses: [
      { name: 'B.Des (Product Design)', type: 'UG', duration: '4 Years' },
      { name: 'B.Des (User Experience Design)', type: 'UG', duration: '4 Years' },
      { name: 'B.Des (Visual Communication)', type: 'UG', duration: '4 Years' },
      { name: 'B.Des (Fashion Design)', type: 'UG', duration: '4 Years' },
      { name: 'M.Des (Industrial Design)', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Law',
    courses: [
      { name: 'BA LLB (Hons)', type: 'UG', duration: '5 Years' },
      { name: 'BBA LLB (Hons)', type: 'UG', duration: '5 Years' },
      { name: 'LLB', type: 'UG', duration: '3 Years' },
      { name: 'LLM', type: 'PG', duration: '1 Year' },
    ]
  },
  {
    name: 'School of Science',
    courses: [
      { name: 'B.Sc (Applied Statistics & Data Analytics)', type: 'UG', duration: '3/4 Years' },
      { name: 'B.Sc (Physics)', type: 'UG', duration: '3/4 Years' },
      { name: 'M.Sc (Biotechnology)', type: 'PG', duration: '2 Years' },
      { name: 'M.Sc (Mathematics)', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Liberal Arts',
    courses: [
      { name: 'BA (Liberal Arts)', type: 'UG', duration: '3/4 Years' },
      { name: 'BA (Psychology)', type: 'UG', duration: '3/4 Years' },
      { name: 'BA (English)', type: 'UG', duration: '3/4 Years' },
      { name: 'MA (Psychology)', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Commerce',
    courses: [
      { name: 'B.Com (Hons)', type: 'UG', duration: '3/4 Years' },
      { name: 'B.Com (Fintech)', type: 'UG', duration: '3/4 Years' },
      { name: 'M.Com', type: 'PG', duration: '2 Years' },
    ]
  },
  {
    name: 'School of Pharmacy',
    courses: [
      { name: 'B.Pharm', type: 'UG', duration: '4 Years' },
      { name: 'Pharm.D', type: 'UG', duration: '6 Years' },
      { name: 'M.Pharm', type: 'PG', duration: '2 Years' },
    ]
  }
];

export const MITWPU_HIGHLIGHTS = [
  {
    title: 'Interdisciplinary Learning',
    description: 'A holistic approach integrating engineering, management, design, and liberal arts for comprehensive skill development.'
  },
  {
    title: 'World-Class Infrastructure',
    description: 'Equipped with hundreds of advanced laboratories, smart classrooms, and modern learning facilities for practical exposure.'
  },
  {
    title: 'Global Exposure',
    description: 'Extensive collaborations with international universities for exchange programs, study tours, and joint research initiatives.'
  },
  {
    title: 'Degree++ & Experiential Learning',
    description: 'Enhancing technical skills with Peace Studies, rural immersion, and industry-oriented certification programs.'
  }
];

export const getFlatCourses = () => {
  return MITWPU_SCHOOLS.flatMap(school => school.courses.map(c => c.name));
};

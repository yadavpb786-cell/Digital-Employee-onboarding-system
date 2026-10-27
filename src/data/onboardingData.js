export const mockEmployeeData = {
  id: "EMP-2026-8941",
  name: "Rahul Kumar",
  role: "Software Engineer",
  designation: "Software Engineer",
  department: "Data & Technology",
  email: "rahul.kumar@novatech.io",
  phone: "+91 98765 43210",
  dateOfBirth: "1998-07-14",
  address: "Flat 402, Silicon Heights, Sector 62",
  city: "Chandigarh",
  state: "Punjab",
  pincode: "160062",
  emergencyContact: {
    name: "Sunita Kumar",
    relation: "Mother",
    phone: "+91 98765 11223"
  },
  bloodGroup: "O+",
  joiningDate: "Monday, September 21, 2026",
  joiningTime: "09:30 AM",
  location: "NOVA Tech – Chandigarh Office",
  workMode: "Hybrid (3 Days Office / 2 Days Remote)",
  manager: {
    name: "Arjun Mehta",
    role: "Engineering Director",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    email: "arjun.mehta@novatech.io"
  },
  hrSupport: {
    name: "Priya Sharma",
    role: "People & Culture Lead",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    email: "priya.sharma@novatech.io",
    availability: "Available Mon-Fri, 9:00 AM - 6:00 PM IST"
  },
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
};

export const initialDocumentsData = [
  {
    id: "doc-1",
    name: "Passport / National Aadhaar Card",
    type: "Identification",
    uploadStatus: "Uploaded",
    verificationStatus: "Verified",
    date: "Sep 01, 2026",
    size: "2.4 MB",
    remarks: "National ID verified and encrypted in secure compliance vault.",
    required: true
  },
  {
    id: "doc-2",
    name: "Degree Certificate & Marksheets",
    type: "Academic",
    uploadStatus: "Uploaded",
    verificationStatus: "Verified",
    date: "Sep 01, 2026",
    size: "4.1 MB",
    remarks: "B.Tech Computer Science degree verified by People Ops.",
    required: true
  },
  {
    id: "doc-3",
    name: "Signed Employment Agreement",
    type: "Legal",
    uploadStatus: "Uploaded",
    verificationStatus: "Verified",
    date: "Aug 28, 2026",
    size: "1.2 MB",
    remarks: "Digitally executed with SHA-256 cryptographic verification seal.",
    required: true
  },
  {
    id: "doc-4",
    name: "Direct Deposit Bank Details & Cancelled Cheque",
    type: "Finance",
    uploadStatus: "Uploaded",
    verificationStatus: "Pending Verification",
    date: "Sep 02, 2026",
    size: "850 KB",
    remarks: "Under verification by Finance & Payroll Operations.",
    required: true
  },
  {
    id: "doc-5",
    name: "Previous Experience & Relieving Letter",
    type: "Employment",
    uploadStatus: "Uploaded",
    verificationStatus: "Rejected",
    date: "Aug 30, 2026",
    size: "1.1 MB",
    remarks: "Document scan was blurry. Please re-upload a clear PDF copy.",
    required: true
  },
  {
    id: "doc-6",
    name: "Emergency Contact & Medical Declaration Form",
    type: "HR Compliance",
    uploadStatus: "Not Uploaded",
    verificationStatus: "Not Uploaded",
    date: "Due Sep 19, 2026",
    size: "--",
    remarks: "Awaiting employee submission before orientation.",
    required: true
  }
];

export const initialPoliciesData = [
  {
    id: "pol-1",
    title: "Code of Professional Conduct & Ethics",
    category: "Compliance",
    readTime: "8 mins",
    acknowledged: true,
    acknowledgedAt: "Sep 01, 2026",
    summary: "Sets forth the ethical foundation, anti-bribery standards, mutual respect, and legal compliance required across all NOVA Tech global entities.",
    keyPoints: [
      "Zero-tolerance for discrimination, harassment, or retaliation in any form.",
      "Mandatory protection of proprietary assets, intellectual property, and trade secrets.",
      "Prompt disclosure of conflicts of interest and outside business engagements."
    ]
  },
  {
    id: "pol-2",
    title: "Remote & Hybrid Work Policy 2026",
    category: "Workplace",
    readTime: "5 mins",
    acknowledged: true,
    acknowledgedAt: "Sep 02, 2026",
    summary: "Guidelines governing asynchronous collaboration, core availability hours, workspace ergonomic stipend, and hybrid office attendance.",
    keyPoints: [
      "Core collaboration hours are 10:00 AM – 4:00 PM IST for cross-functional meetings.",
      "Hybrid engineering personnel are expected on-site 3 days weekly.",
      "Workstations and confidential meetings must take place in secure environments."
    ]
  },
  {
    id: "pol-3",
    title: "Information Security & Data Protection (ISO 27001)",
    category: "Security",
    readTime: "12 mins",
    acknowledged: false,
    acknowledgedAt: null,
    summary: "Comprehensive framework ensuring confidential client information, zero-trust network access, and incident reporting protocols remain unbroken.",
    keyPoints: [
      "Multi-Factor Authentication (MFA) is strictly mandatory on all hardware and services.",
      "Never share passwords, API tokens, or SSH keys through unsecured channels.",
      "Report suspected phishing or unauthorized access immediately to security@novatech.io."
    ]
  },
  {
    id: "pol-4",
    title: "Leave, Time-Off & Wellness Policy",
    category: "Benefits",
    readTime: "6 mins",
    acknowledged: false,
    acknowledgedAt: null,
    summary: "Clear rules outlining paid time off, sick leave, compassionate leave, floating holidays, and sabbatical guidelines.",
    keyPoints: [
      "24 days of annual paid time off accrued pro-rata from day of joining.",
      "Planned leaves longer than 3 days require 10 days advance approval by manager.",
      "Annual mental health wellness days provided to every team member."
    ]
  },
  {
    id: "pol-5",
    title: "Employee Handbook & Anti-Harassment (POSH)",
    category: "HR & Culture",
    readTime: "10 mins",
    acknowledged: true,
    acknowledgedAt: "Sep 01, 2026",
    summary: "Comprehensive internal handbook explaining organizational hierarchy, grievance redressal, POSH compliance, and culture of inclusivity.",
    keyPoints: [
      "Internal Complaints Committee (ICC) established for prompt redressal.",
      "Safe, confidential reporting channels available 24/7.",
      "Annual mandatory refresher training for all employees."
    ]
  }
];

export const initialOfferLetterData = {
  refNo: "NOVA/OFFER/2026/0894",
  issueDate: "August 25, 2026",
  employeeName: "Rahul Kumar",
  designation: "Software Engineer",
  department: "Data & Technology",
  reportingManager: "Arjun Mehta, Engineering Director",
  joiningDate: "Monday, September 21, 2026",
  workLocation: "NOVA Tech – Chandigarh Office (Hybrid Mode)",
  ctc: "₹14,50,000 per annum",
  salaryBreakdown: [
    { component: "Basic Salary", annual: "₹7,25,000", monthly: "₹60,417" },
    { component: "House Rent Allowance (HRA)", annual: "₹2,90,000", monthly: "₹24,167" },
    { component: "Special Allowance", annual: "₹2,15,000", monthly: "₹17,917" },
    { component: "Performance Bonus (Target)", annual: "₹1,20,000", monthly: "Disbursed Annually" },
    { component: "Provident Fund (Employer)", annual: "₹60,000", monthly: "₹5,000" },
    { component: "Medical Insurance & Wellness Allowance", annual: "₹40,000", monthly: "₹3,333" }
  ],
  probation: "3 Months from Joining Date",
  noticePeriod: "30 Days during probation, 60 Days thereafter",
  isAccepted: true,
  acceptedAt: "August 28, 2026 at 11:42 AM IST",
  signature: "Rahul Kumar",
  hash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
};

export const initialQuizData = [
  {
    id: "q-1",
    question: "What is NOVA Tech's core protocol when you receive an email requesting urgent password updates or financial wire transfers?",
    options: [
      "Reply immediately to verify the sender's identity.",
      "Forward it to your personal email to inspect headers.",
      "Do not click any links; immediately report it via the PhishAlarm tool and notify IT Security.",
      "Delete the email and ignore it without reporting."
    ],
    correctAnswer: 2,
    category: "Information Security",
    explanation: "Suspicious emails must always be escalated via the PhishAlarm tool so IT Security can block domain-wide threats."
  },
  {
    id: "q-2",
    question: "Under the NOVA Tech Hybrid Work Policy, what are the mandatory core collaboration hours for synchronous meetings?",
    options: [
      "08:00 AM – 12:00 PM IST",
      "10:00 AM – 04:00 PM IST",
      "01:00 PM – 08:00 PM IST",
      "No set hours; communication is 100% asynchronous."
    ],
    correctAnswer: 1,
    category: "Workplace Policy",
    explanation: "Core collaboration hours from 10:00 AM to 04:00 PM IST ensure smooth cross-functional coordination across sprints."
  },
  {
    id: "q-3",
    question: "How many days in advance must planned annual leaves longer than 3 consecutive days be submitted in the HR portal?",
    options: [
      "24 hours in advance",
      "5 days in advance",
      "10 days in advance",
      "Advance notice is not required"
    ],
    correctAnswer: 2,
    category: "Leave Policy",
    explanation: "Submitting leaves 10 days in advance allows engineering squads to adjust sprint commitments and on-call rotations."
  },
  {
    id: "q-4",
    question: "Where should employee credentials, private SSH keys, and cloud API tokens be stored at NOVA Tech?",
    options: [
      "In a shared Google Doc accessible by the squad",
      "Committed inside private GitHub code repositories",
      "Stored locally in plain text in the home directory",
      "In the corporate Enterprise Password Manager and cloud secret vaults using MFA"
    ],
    correctAnswer: 3,
    category: "Security & Compliance",
    explanation: "All secrets must be stored within approved enterprise secret vaults with Multi-Factor Authentication enabled."
  },
  {
    id: "q-5",
    question: "Who is your primary point of contact for day-one hardware provisioning and IT system credentials?",
    options: [
      "Priya Sharma (HR) & DevOps IT Helpdesk",
      "Any team colleague on Slack",
      "Building security reception",
      "External hardware vendor"
    ],
    correctAnswer: 0,
    category: "Onboarding Support",
    explanation: "People Ops Lead Priya Sharma coordinates directly with the DevOps IT Helpdesk for seamless hardware setup."
  }
];

export const initialFirstDayTimeline = [
  {
    id: "fdt-1",
    time: "09:30 AM – 10:15 AM",
    title: "Welcome & Reception Check-in",
    host: "Priya Sharma (People Ops)",
    location: "Main Reception & Lobby Hub",
    description: "Collect your visitor smart badge, meet your HR partner, and receive your official NOVA Tech welcome pack.",
    status: "completed",
    type: "HR"
  },
  {
    id: "fdt-2",
    time: "10:15 AM – 11:30 AM",
    title: "HR Orientation & Compliance Overview",
    host: "Priya Sharma",
    location: "Executive Boardroom A",
    description: "Deep dive into employee benefits, leave structures, health insurance, and administrative policies.",
    status: "completed",
    type: "HR"
  },
  {
    id: "fdt-3",
    time: "11:30 AM – 12:30 PM",
    title: "Company Vision & Culture Introduction",
    host: "Executive Leadership Team",
    location: "Auditorium & Live Stream",
    description: "Learn about NOVA Tech's founding story, mission, core values, and strategic milestones for 2026.",
    status: "in-progress",
    type: "Culture"
  },
  {
    id: "fdt-4",
    time: "12:30 PM – 01:45 PM",
    title: "Team Welcome Lunch",
    host: "Data & Technology Squad",
    location: "NOVA Bistro & Roof Garden",
    description: "Enjoy lunch with your engineering colleagues and onboarding buddy Neha Kapoor.",
    status: "upcoming",
    type: "Social"
  },
  {
    id: "fdt-5",
    time: "02:00 PM – 03:15 PM",
    title: "Workspace & Hardware IT Provisioning",
    host: "Karan Singh (IT & DevOps)",
    location: "Engineering Pod 4B",
    description: "MacBook setup, 2FA YubiKey configuration, VPN connection, and IDE environment setup.",
    status: "upcoming",
    type: "IT Setup"
  },
  {
    id: "fdt-6",
    time: "03:30 PM – 04:15 PM",
    title: "1-on-1 Alignment with Manager",
    host: "Arjun Mehta (Engineering Director)",
    location: "Director Cabin 402 / Pod 4B",
    description: "Initial 30-60-90 day goal setting, sprint roadmap review, and team expectations.",
    status: "upcoming",
    type: "Management"
  },
  {
    id: "fdt-7",
    time: "04:30 PM – 05:15 PM",
    title: "Engineering Pod & Buddy Meetup",
    host: "Neha Kapoor (Senior Frontend Engineer)",
    location: "Pod 4B Collaboration Nook",
    description: "Repository walkthrough, Git branch policies, Slack channel introduction, and Q&A.",
    status: "upcoming",
    type: "Engineering"
  },
  {
    id: "fdt-8",
    time: "05:15 PM – 05:45 PM",
    title: "End-of-Day Check-in & Wrap-up",
    host: "Priya Sharma",
    location: "HR Hub Room B",
    description: "Reflection on your first day, addressing any immediate blockers, and preview of Day 2.",
    status: "upcoming",
    type: "Wrap-up"
  }
];

export const initialFeedbackData = {
  ratings: {
    journey: 5,
    documentation: 4,
    support: 5,
    training: 4
  },
  npsScore: 9,
  comments: "The onboarding experience has been seamless. The digital portal and interactive timeline provided clear transparency on what to do at every stage.",
  isSubmitted: false,
  submittedAt: null
};

export const onboardingStagesList = [
  {
    id: "profile",
    stageNumber: 1,
    title: "Employee Profile",
    description: "Personal details, emergency contacts, address, and designation.",
    path: "/profile",
    icon: "UserCheck",
    category: "Personal Data",
    estimatedTime: "5 mins"
  },
  {
    id: "documents",
    stageNumber: 2,
    title: "Document Submission",
    description: "Submit government ID, educational records, and bank details.",
    path: "/documents",
    icon: "FileUp",
    category: "Compliance",
    estimatedTime: "15 mins"
  },
  {
    id: "offerLetter",
    stageNumber: 3,
    title: "Offer Letter Acceptance",
    description: "Review terms of employment, CTC compensation, and digitally sign.",
    path: "/offer-letter",
    icon: "FileSignature",
    category: "Legal",
    estimatedTime: "5 mins"
  },
  {
    id: "policies",
    stageNumber: 4,
    title: "Company Policies",
    description: "Acknowledge Code of Conduct, Information Security, and WFH guidelines.",
    path: "/policies",
    icon: "BookOpen",
    category: "Governance",
    estimatedTime: "20 mins"
  },
  {
    id: "training",
    stageNumber: 5,
    title: "Mandatory Training",
    description: "Complete security awareness, culture, and technical modules.",
    path: "/training",
    icon: "GraduationCap",
    category: "Learning",
    estimatedTime: "30 mins"
  },
  {
    id: "quiz",
    stageNumber: 6,
    title: "Onboarding Quiz",
    description: "Knowledge check on company culture, guidelines, and security protocols.",
    path: "/quiz",
    icon: "HelpCircle",
    category: "Assessment",
    estimatedTime: "10 mins"
  },
  {
    id: "manager",
    stageNumber: 7,
    title: "Department & Manager",
    description: "Meet your reporting manager Arjun Mehta and align on 30-day goals.",
    path: "/team",
    icon: "Users",
    category: "Team Alignment",
    estimatedTime: "15 mins"
  },
  {
    id: "firstDay",
    stageNumber: 8,
    title: "First Day Action Plan",
    description: "Review detailed schedule for orientation day, reception, and lunch.",
    path: "/first-day",
    icon: "Calendar",
    category: "Orientation",
    estimatedTime: "10 mins"
  },
  {
    id: "feedback",
    stageNumber: 9,
    title: "Onboarding Feedback",
    description: "Share your onboarding ratings and comments to help us improve.",
    path: "/feedback",
    icon: "MessageSquare",
    category: "Feedback",
    estimatedTime: "5 mins"
  },
  {
    id: "completed",
    stageNumber: 10,
    title: "Onboarding Complete",
    description: "All milestones completed. Download your Graduation Certificate!",
    path: "/onboarding",
    icon: "Award",
    category: "Graduation",
    estimatedTime: "Done"
  }
];

export const initialTasksData = [
  {
    id: "task-1",
    title: "Complete Profile",
    description: "Update your contact details, emergency contacts, and personal info.",
    category: "Profile",
    status: "completed",
    dueDate: "Sep 15, 2026",
    estimatedTime: "5 mins",
    icon: "UserCheck",
    actionPath: "/profile"
  },
  {
    id: "task-2",
    title: "Upload Documents",
    description: "Submit government ID, educational certificates, and tax forms.",
    category: "Compliance",
    status: "completed",
    dueDate: "Sep 16, 2026",
    estimatedTime: "15 mins",
    icon: "FileUp",
    actionPath: "/documents"
  },
  {
    id: "task-3",
    title: "Accept Offer Letter",
    description: "Review and digitally sign your official NOVA Tech employment agreement.",
    category: "Legal",
    status: "completed",
    dueDate: "Sep 18, 2026",
    estimatedTime: "5 mins",
    icon: "FileSignature",
    actionPath: "/offer-letter"
  },
  {
    id: "task-4",
    title: "Read Company Policies",
    description: "Review code of conduct, remote work, IT compliance, and leave policies.",
    category: "Policies",
    status: "current",
    dueDate: "Sep 20, 2026",
    estimatedTime: "20 mins",
    icon: "BookOpen",
    actionPath: "/policies"
  },
  {
    id: "task-5",
    title: "Complete Training Modules",
    description: "Finish mandatory security awareness and company culture onboarding modules.",
    category: "Learning",
    status: "pending",
    dueDate: "Sep 23, 2026",
    estimatedTime: "30 mins",
    icon: "GraduationCap",
    actionPath: "/training"
  },
  {
    id: "task-6",
    title: "Pass Onboarding Quiz",
    description: "Score 70% or higher on company policies, culture, and security practices.",
    category: "Assessment",
    status: "pending",
    dueDate: "Sep 23, 2026",
    estimatedTime: "10 mins",
    icon: "CheckSquare",
    actionPath: "/quiz"
  },
  {
    id: "task-7",
    title: "Department & Manager Alignment",
    description: "Schedule 1-on-1 introductory catchup with manager Arjun Mehta.",
    category: "Team",
    status: "pending",
    dueDate: "Sep 24, 2026",
    estimatedTime: "15 mins",
    icon: "Users",
    actionPath: "/team"
  },
  {
    id: "task-8",
    title: "Review First Day Action Plan",
    description: "Familiarize yourself with your Day 1 schedule, meetings, and check-ins.",
    category: "Orientation",
    status: "pending",
    dueDate: "Sep 21, 2026",
    estimatedTime: "10 mins",
    icon: "Calendar",
    actionPath: "/first-day"
  },
  {
    id: "task-9",
    title: "Submit Onboarding Feedback",
    description: "Rate your digital onboarding experience and share feedback.",
    category: "Feedback",
    status: "pending",
    dueDate: "Sep 25, 2026",
    estimatedTime: "5 mins",
    icon: "MessageSquare",
    actionPath: "/feedback"
  }
];

export const mockTrainingModules = [
  {
    id: "tr-1",
    title: "Welcome to NOVA Tech",
    description: "Company history, vision, executive leadership, and strategic goals for 2026.",
    progress: 100,
    status: "Completed",
    duration: "20 mins",
    modulesCount: 4,
    completedModules: 4,
    category: "Orientation",
    icon: "Sparkles",
    lessons: [
      { id: "l-1", title: "Founding Story & Milestones", duration: "5 mins", completed: true },
      { id: "l-2", title: "Executive Leadership & Board", duration: "5 mins", completed: true },
      { id: "l-3", title: "Product Roadmap & Ecosystem", duration: "5 mins", completed: true },
      { id: "l-4", title: "Global Offices & Hybrid Model", duration: "5 mins", completed: true }
    ]
  },
  {
    id: "tr-2",
    title: "Company Culture & Values",
    description: "Core principles of innovation, transparency, inclusivity, and continuous learning.",
    progress: 60,
    status: "In Progress",
    duration: "30 mins",
    modulesCount: 5,
    completedModules: 3,
    category: "Culture",
    icon: "HeartHandshake",
    lessons: [
      { id: "l-5", title: "Core Values in Action", duration: "6 mins", completed: true },
      { id: "l-6", title: "Inclusivity & Psychological Safety", duration: "6 mins", completed: true },
      { id: "l-7", title: "Feedback & Performance Rhythm", duration: "6 mins", completed: true },
      { id: "l-8", title: "Collaborative Tooling (Slack, Notion)", duration: "6 mins", completed: false },
      { id: "l-9", title: "Social Impact & Employee Giving", duration: "6 mins", completed: false }
    ]
  },
  {
    id: "tr-3",
    title: "Information Security Awareness",
    description: "Best practices for data protection, password management, and phishing prevention.",
    progress: 0,
    status: "Not Started",
    duration: "45 mins",
    modulesCount: 6,
    completedModules: 0,
    category: "Compliance",
    icon: "ShieldAlert",
    lessons: [
      { id: "l-10", title: "Data Classification Standards", duration: "7 mins", completed: false },
      { id: "l-11", title: "Password Best Practices & MFA", duration: "8 mins", completed: false },
      { id: "l-12", title: "Identifying Social Engineering & Phishing", duration: "8 mins", completed: false },
      { id: "l-13", title: "Endpoint Security & Device Encryption", duration: "7 mins", completed: false },
      { id: "l-14", title: "Secure Software Development Lifecycle", duration: "8 mins", completed: false },
      { id: "l-15", title: "Incident Reporting Procedures", duration: "7 mins", completed: false }
    ]
  }
];

export const mockAnnouncements = [
  {
    id: "ann-1",
    title: "Welcome to the NOVA Tech team!",
    date: "Sep 02, 2026",
    category: "Company News",
    preview: "We are thrilled to welcome our September cohort of engineers and innovators to NOVA Tech."
  },
  {
    id: "ann-2",
    title: "New employee orientation schedule announced",
    date: "Sep 01, 2026",
    category: "HR Update",
    preview: "Join us for an interactive virtual session with our Chief Technology Officer and HR team."
  },
  {
    id: "ann-3",
    title: "IT security training is now available",
    date: "Aug 29, 2026",
    category: "Security",
    preview: "Please complete your mandatory cybersecurity hygiene module before day one."
  },
  {
    id: "ann-4",
    title: "Team introduction session scheduled for Friday",
    date: "Aug 27, 2026",
    category: "Social",
    preview: "Get ready for a virtual meet-and-greet icebreaker session with your engineering squad."
  }
];

export const mockUpcomingEvents = [
  {
    id: "evt-1",
    dayTag: "Today",
    time: "09:30 AM",
    title: "HR Orientation",
    type: "Onboarding",
    location: "Meeting Room A & Google Meet",
    host: "Priya Sharma"
  },
  {
    id: "evt-2",
    dayTag: "Tomorrow",
    time: "11:00 AM",
    title: "IT Setup Session",
    type: "Technical",
    location: "IT Helpdesk Hub",
    host: "DevOps Team"
  },
  {
    id: "evt-3",
    dayTag: "Friday",
    time: "02:00 PM",
    title: "Team Introduction",
    type: "Social",
    location: "Cafeteria & Virtual Lounge",
    host: "Arjun Mehta"
  }
];

export const mockNotifications = [
  {
    id: "notif-1",
    title: "Document Approved",
    message: "Your government ID verification has been completed successfully.",
    time: "10 mins ago",
    unread: true,
    type: "success"
  },
  {
    id: "notif-2",
    title: "Upcoming Orientation",
    message: "HR Orientation starts today at 09:30 AM IST.",
    time: "1 hour ago",
    unread: true,
    type: "info"
  },
  {
    id: "notif-3",
    title: "Policy Review Reminder",
    message: "Please read and acknowledge NOVA Tech Information Security Policy.",
    time: "Yesterday",
    unread: false,
    type: "warning"
  }
];

export const mockFirstDayPlan = [
  { time: "09:30 AM", activity: "Welcome & HR Check-in with Priya Sharma", location: "Reception Desk" },
  { time: "10:15 AM", activity: "HR Orientation & ID Verification", location: "HR Hub Floor 2" },
  { time: "11:30 AM", activity: "Company Vision & Culture Session", location: "Auditorium & Stream" },
  { time: "12:30 PM", activity: "Team Welcome Lunch", location: "NOVA Bistro Cafe" },
  { time: "02:00 PM", activity: "Workspace IT Setup & Credentials", location: "Engineering Pod 4B" },
  { time: "03:30 PM", activity: "1-on-1 Sync with Manager Arjun Mehta", location: "Manager Office 402" },
  { time: "04:30 PM", activity: "Pod Engineering Introduction with Buddy", location: "Pod 4B Nook" },
  { time: "05:15 PM", activity: "Day 1 Wrap-up & Q&A with Priya", location: "Conference Room B" }
];

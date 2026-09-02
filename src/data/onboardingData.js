export const mockEmployeeData = {
  id: "EMP-2026-8941",
  name: "Rahul Kumar",
  role: "Software Engineer",
  department: "Data & Technology",
  joiningDate: "Monday, September 21, 2026",
  joiningTime: "09:30 AM",
  location: "NOVA Tech – Chandigarh Office",
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
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  email: "rahul.kumar@novatech.io"
};

export const initialTasksData = [
  {
    id: "task-1",
    title: "Complete Profile",
    description: "Update your contact details, emergency contacts, and bio.",
    category: "Profile",
    status: "completed", // completed, current, pending
    dueDate: "Sep 15, 2026",
    estimatedTime: "10 mins",
    icon: "UserCheck",
    actionPath: "/settings"
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
    title: "Verify Personal Information",
    description: "Confirm address, banking details for payroll, and identity proof.",
    category: "Payroll",
    status: "completed",
    dueDate: "Sep 17, 2026",
    estimatedTime: "5 mins",
    icon: "ShieldCheck",
    actionPath: "/settings"
  },
  {
    id: "task-4",
    title: "Accept Offer Letter",
    description: "Review and digitally sign your official NOVA Tech employment agreement.",
    category: "Legal",
    status: "completed",
    dueDate: "Sep 18, 2026",
    estimatedTime: "5 mins",
    icon: "FileSignature",
    actionPath: "/documents"
  },
  {
    id: "task-5",
    title: "Read Company Policies",
    description: "Review code of conduct, remote work, IT compliance, and leave policies.",
    category: "Policies",
    status: "current",
    dueDate: "Sep 20, 2026",
    estimatedTime: "25 mins",
    icon: "BookOpen",
    actionPath: "/policies"
  },
  {
    id: "task-6",
    title: "Complete Training",
    description: "Finish mandatory security awareness and company culture onboarding modules.",
    category: "Learning",
    status: "pending",
    dueDate: "Sep 23, 2026",
    estimatedTime: "45 mins",
    icon: "GraduationCap",
    actionPath: "/training"
  },
  {
    id: "task-7",
    title: "Meet Your Team",
    description: "Schedule 1-on-1 introductory catchups with key engineering teammates.",
    category: "Social",
    status: "pending",
    dueDate: "Sep 24, 2026",
    estimatedTime: "30 mins",
    icon: "Users",
    actionPath: "/team"
  },
  {
    id: "task-8",
    title: "Complete First Day Checklist",
    description: "Collect your hardware workstation, setup 2FA credentials, and join Slack.",
    category: "IT Setup",
    status: "pending",
    dueDate: "Sep 21, 2026",
    estimatedTime: "20 mins",
    icon: "CheckSquare",
    actionPath: "/tasks"
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
    icon: "Sparkles"
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
    icon: "HeartHandshake"
  },
  {
    id: "tr-3",
    title: "Information Security",
    description: "Best practices for data protection, password management, and phishing prevention.",
    progress: 0,
    status: "Not Started",
    duration: "45 mins",
    modulesCount: 6,
    completedModules: 0,
    category: "Compliance",
    icon: "ShieldAlert"
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
  { time: "10:30 AM", activity: "IT Laptop Provisioning & Credentials Setup", location: "IT Hub Floor 3" },
  { time: "12:00 PM", activity: "Team Welcome Lunch", location: "NOVA Bistro Cafe" },
  { time: "01:30 PM", activity: "Workspace Setup & Architecture Overview", location: "Engineering Pod 4B" },
  { time: "03:30 PM", activity: "1-on-1 Sync with Manager Arjun Mehta", location: "Manager Office" },
  { time: "05:00 PM", activity: "Day 1 Wrap-up & Q&A", location: "Main Conference Room" }
];

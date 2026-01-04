// Mock data store using localStorage for persistence
const STORAGE_KEY = 'startup_os_data';
const DATA_VERSION = 3; // Increment this when data structure changes

// Initialize default data structure
const defaultData = {
  version: DATA_VERSION,
  users: [
    {
      id: 'user-1',
      email: 'admin@example.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
      created_date: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'john@example.com',
      password: 'john123',
      full_name: 'John Smith',
      role: 'member',
      created_date: new Date().toISOString(),
    },
    {
      id: 'user-3',
      email: 'jane@example.com',
      password: 'jane123',
      full_name: 'Jane Doe',
      role: 'member',
      created_date: new Date().toISOString(),
    },
    {
      id: 'user-4',
      email: 'manager@example.com',
      password: 'manager123',
      full_name: 'Sarah Manager',
      role: 'manager',
      created_date: new Date().toISOString(),
    },
    {
      id: 'user-5',
      email: 'guest@example.com',
      password: 'guest123',
      full_name: 'Guest User',
      role: 'guest',
      created_date: new Date().toISOString(),
    },
  ],
  pagePermissions: {
    Home: ['admin', 'manager', 'member', 'guest'],
    Decisions: ['admin', 'manager', 'member'],
    Tasks: ['admin', 'manager', 'member'],
    Announcements: ['admin', 'manager', 'member', 'guest'],
    People: ['admin', 'manager'],
    Calendar: ['admin', 'manager', 'member', 'guest'],
    Settings: ['admin', 'manager', 'member', 'guest'],
  },
  holidays: [
    {
      id: 'holiday-1',
      name: 'New Year\'s Day',
      date: '2026-01-01',
      type: 'public', // public or company
      created_by: 'admin@example.com',
      created_date: new Date().toISOString(),
    },
    {
      id: 'holiday-2',
      name: 'Independence Day',
      date: '2026-07-04',
      type: 'public',
      created_by: 'admin@example.com',
      created_date: new Date().toISOString(),
    },
    {
      id: 'holiday-3',
      name: 'Company Retreat',
      date: '2026-03-15',
      type: 'company',
      created_by: 'admin@example.com',
      created_date: new Date().toISOString(),
    },
    {
      id: 'holiday-4',
      name: 'Thanksgiving',
      date: '2026-11-26',
      type: 'public',
      created_by: 'admin@example.com',
      created_date: new Date().toISOString(),
    },
    {
      id: 'holiday-5',
      name: 'Christmas',
      date: '2026-12-25',
      type: 'public',
      created_by: 'admin@example.com',
      created_date: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Set up project repository',
      description: 'Initialize Git repository and set up basic project structure',
      status: 'done',
      priority: 'high',
      assignee: 'admin@example.com',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design system architecture',
      description: 'Create architecture diagrams and technical specifications',
      status: 'in_progress',
      priority: 'high',
      assignee: 'john@example.com',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints and data models',
      status: 'todo',
      priority: 'medium',
      assignee: null,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Implement user authentication',
      description: 'Build login and registration system with JWT tokens',
      status: 'in_progress',
      priority: 'high',
      assignee: 'jane@example.com',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment workflow',
      status: 'todo',
      priority: 'low',
      assignee: 'john@example.com',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Fix critical security vulnerability',
      description: 'Address SQL injection vulnerability in user input',
      status: 'blocked',
      priority: 'high',
      assignee: 'admin@example.com',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_date: new Date().toISOString(),
    },
  ],
  decisions: [
    {
      id: 'decision-1',
      title: 'Choose frontend framework',
      description: 'Evaluate and select the best frontend framework for our needs',
      status: 'decided',
      category: 'engineering',
      owner: 'admin@example.com',
      created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'decision-2',
      title: 'Define hiring process',
      description: 'Establish a structured hiring process for the team',
      status: 'discussion',
      category: 'hiring',
      owner: 'jane@example.com',
      created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  announcements: [
    {
      id: 'announcement-1',
      title: 'Welcome to Startup OS!',
      content: 'We are excited to launch our new team collaboration platform.',
      priority: 'high',
      author: 'admin@example.com',
      created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  leaveRequests: [
    {
      id: 'leave-1',
      requester: 'john@example.com',
      requester_name: 'John Smith',
      type: 'vacation',
      start_date: '2026-02-01',
      end_date: '2026-02-05',
      reason: 'Family vacation to the beach',
      status: 'pending',
      created_date: new Date().toISOString(),
    },
    {
      id: 'leave-2',
      requester: 'jane@example.com',
      requester_name: 'Jane Doe',
      type: 'sick',
      start_date: '2026-01-10',
      end_date: '2026-01-12',
      reason: 'Medical appointment and recovery',
      status: 'approved',
      reviewed_by: 'admin@example.com',
      reviewed_date: '2026-01-09',
      created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'leave-3',
      requester: 'john@example.com',
      requester_name: 'John Smith',
      type: 'personal',
      start_date: '2026-03-15',
      end_date: '2026-03-16',
      reason: 'Personal matters',
      status: 'rejected',
      reviewed_by: 'manager@example.com',
      reviewed_date: '2026-01-02',
      created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  comments: [
    {
      id: 'comment-1',
      entity_id: 'decision-1',
      author: 'john@example.com',
      author_name: 'John Smith',
      content: 'I think React is a great choice!',
      created_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  timeEntries: [
    // Example time entry
    {
      id: 'time-1',
      user_email: 'john@example.com',
      user_name: 'John Smith',
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      duration: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
      created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  activeTimers: {
    // Format: { email: { start_time: ISO string } }
  },
  companySettings: {
    name: 'Startup OS',
    logo: null, // URL to logo image
  },
  currentUser: null,
};

// Get data from localStorage or initialize with defaults
export function getData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);

      // Check if data needs to be migrated to new version
      if (!data.version || data.version < DATA_VERSION) {
        console.log('Data structure outdated. Resetting to defaults...');
        setData(defaultData);
        return defaultData;
      }

      return data;
    }
  } catch (error) {
    console.warn('Failed to load data from localStorage:', error);
  }

  // Initialize with default data
  setData(defaultData);
  return defaultData;
}

// Save data to localStorage
export function setData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

// Reset to default data
export function resetData() {
  setData(defaultData);
  return defaultData;
}

// Generate unique ID
export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

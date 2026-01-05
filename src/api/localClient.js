// Local mock client that replaces Base44 SDK
import { auth } from './mockAuth';
import { Task, Decision, Announcement, LeaveRequest, Comment, UserEntity, Holiday, TimeEntry, BillingTool, Milestone, Space } from './mockEntities';

// Mock integrations (not fully implemented - add as needed)
const integrations = {
  Core: {
    InvokeLLM: () => Promise.resolve({ text: 'Mock LLM response' }),
    SendEmail: (data) => {
      console.log('Mock email sent:', data);
      return Promise.resolve({ success: true });
    },
    UploadFile: () => Promise.resolve({ url: 'mock-file-url' }),
    GenerateImage: () => Promise.resolve({ url: 'mock-image-url' }),
    ExtractDataFromUploadedFile: () => Promise.resolve({ data: {} }),
    CreateFileSignedUrl: () => Promise.resolve({ url: 'mock-signed-url' }),
    UploadPrivateFile: () => Promise.resolve({ url: 'mock-private-file-url' }),
  },
};

// Create local client that mimics Base44 SDK structure
export const localClient = {
  auth,
  entities: {
    Task,
    Decision,
    Announcement,
    LeaveRequest,
    Comment,
    User: UserEntity,
    Holiday,
    TimeEntry,
    BillingTool,
    Milestone,
    Space,
  },
  integrations,
};

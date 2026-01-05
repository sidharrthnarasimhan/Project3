-- Seed data for development and testing
-- This creates a sample organization with users and data

-- Insert sample organization
INSERT INTO organizations (id, name, slug, logo_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Startup', 'demo-startup', NULL);

-- Insert sample users (note: clerk_user_id will need to be real Clerk IDs in production)
INSERT INTO users (id, clerk_user_id, email, full_name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'clerk_admin_123', 'admin@example.com', 'Admin User'),
  ('10000000-0000-0000-0000-000000000002', 'clerk_john_456', 'john@example.com', 'John Smith'),
  ('10000000-0000-0000-0000-000000000003', 'clerk_jane_789', 'jane@example.com', 'Jane Doe'),
  ('10000000-0000-0000-0000-000000000004', 'clerk_manager_111', 'manager@example.com', 'Sarah Manager'),
  ('10000000-0000-0000-0000-000000000005', 'clerk_guest_222', 'guest@example.com', 'Guest User');

-- Insert memberships
INSERT INTO memberships (organization_id, user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'member'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'member'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'manager'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'guest');

-- Insert page permissions
INSERT INTO page_permissions (organization_id, page_name, allowed_roles) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Home', ARRAY['admin', 'manager', 'member', 'guest']),
  ('00000000-0000-0000-0000-000000000001', 'Decisions', ARRAY['admin', 'manager', 'member']),
  ('00000000-0000-0000-0000-000000000001', 'Tasks', ARRAY['admin', 'manager', 'member']),
  ('00000000-0000-0000-0000-000000000001', 'Announcements', ARRAY['admin', 'manager', 'member', 'guest']),
  ('00000000-0000-0000-0000-000000000001', 'People', ARRAY['admin', 'manager']),
  ('00000000-0000-0000-0000-000000000001', 'Calendar', ARRAY['admin', 'manager', 'member', 'guest']),
  ('00000000-0000-0000-0000-000000000001', 'Settings', ARRAY['admin', 'manager', 'member', 'guest']),
  ('00000000-0000-0000-0000-000000000001', 'Billing', ARRAY['admin']),
  ('00000000-0000-0000-0000-000000000001', 'Product', ARRAY['admin', 'manager']),
  ('00000000-0000-0000-0000-000000000001', 'Spaces', ARRAY['admin', 'manager', 'member', 'guest']);

-- Insert sample decisions
INSERT INTO decisions (organization_id, title, description, status, category, owner_email, outcome) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Choose frontend framework', 'Evaluate and select the best frontend framework for our needs', 'decided', 'engineering', 'admin@example.com', 'Selected React with Vite for fast development and excellent developer experience'),
  ('00000000-0000-0000-0000-000000000001', 'Define hiring process', 'Establish a structured hiring process for the team', 'discussion', 'hiring', 'manager@example.com', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Product roadmap priorities', 'Decide which features to build first based on user research', 'decided', 'product', 'jane@example.com', 'Focus on core collaboration features: decisions, tasks, and team management');

-- Insert sample tasks
INSERT INTO tasks (organization_id, title, description, status, priority, category, assignee_email, due_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Set up project repository', 'Initialize Git repository and set up basic project structure', 'done', 'high', 'engineering', 'admin@example.com', CURRENT_DATE - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'Design system architecture', 'Create architecture diagrams and technical specifications', 'in_progress', 'high', 'engineering', 'john@example.com', CURRENT_DATE + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'Write API documentation', 'Document all API endpoints and data models', 'todo', 'medium', 'engineering', NULL, CURRENT_DATE + INTERVAL '7 days');

-- Insert sample announcements
INSERT INTO announcements (organization_id, title, content, priority, author_email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Welcome to Startup OS!', 'We are excited to launch our new team collaboration platform.', 'high', 'admin@example.com');

-- Insert sample space
INSERT INTO spaces (organization_id, title, description, content, owner_email, owner_name, allowed_users, is_public) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Company Handbook', 'Company policies, benefits, and culture information', '<h2>Welcome to Our Company</h2><p>This handbook contains everything you need to know about working here.</p><h3>Our Values</h3><ul><li>Transparency</li><li>Collaboration</li><li>Innovation</li></ul>', 'admin@example.com', 'Admin User', '{}', true);

-- Insert company settings
INSERT INTO company_settings (organization_id, company_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Startup');

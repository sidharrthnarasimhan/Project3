/**
 * Email Templates for Startup OS
 * Beautiful, responsive HTML email templates
 */

// Base email template wrapper
const emailWrapper = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Startup OS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background-color: #f9fafb;
      -webkit-font-smoothing: antialiased;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }

    .header {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      padding: 40px 20px;
      text-align: center;
    }

    .logo {
      width: 60px;
      height: 60px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    .header-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }

    .content {
      padding: 40px 40px 20px;
    }

    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px;
    }

    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 24px;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 10px 0;
      box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
    }

    .button:hover {
      box-shadow: 0 6px 12px rgba(147, 51, 234, 0.4);
    }

    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #9333ea;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 8px;
    }

    .info-box-title {
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px;
      font-size: 16px;
    }

    .info-box-text {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }

    .checklist {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }

    .checklist-item {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .checklist-item:last-child {
      border-bottom: none;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #9333ea;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .footer {
      background-color: #f9fafb;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 8px;
    }

    .footer-link {
      color: #9333ea;
      text-decoration: none;
    }

    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 32px 0;
    }
  </style>
</head>
<body>
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">${preheader}</span>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>
`;

/**
 * Invitation Email Template
 */
export const invitationEmailTemplate = ({
  inviterName,
  inviterEmail,
  inviteeEmail,
  organizationName,
  role,
  invitationLink,
}) => emailWrapper(`
  <div class="header">
    <div class="logo">⚡</div>
    <h1 class="header-title">Startup OS</h1>
  </div>

  <div class="content">
    <h2 class="greeting">You're invited! 🎉</h2>

    <p class="message">
      <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join
      <strong>${organizationName}</strong> on Startup OS.
    </p>

    <div class="info-box">
      <p class="info-box-title">Your Role</p>
      <p class="info-box-text">
        You've been invited as a <strong>${role}</strong>. You'll be able to collaborate with your team
        on decisions, tasks, announcements, and more.
      </p>
    </div>

    <p class="message">
      Click the button below to accept your invitation and get started:
    </p>

    <center>
      <a href="${invitationLink}" class="button">Accept Invitation →</a>
    </center>

    <p class="message" style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      <strong>Important:</strong> You must sign up with the email address <strong>${inviteeEmail}</strong>
      to accept this invitation.
    </p>

    <div class="divider"></div>

    <p class="message" style="font-size: 14px;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>

  <div class="footer">
    <p class="footer-text">
      Sent by <strong>Startup OS</strong> on behalf of ${organizationName}
    </p>
    <p class="footer-text">
      <a href="#" class="footer-link">Help Center</a> •
      <a href="#" class="footer-link">Privacy Policy</a>
    </p>
  </div>
`, `${inviterName} invited you to join ${organizationName}`);

/**
 * Welcome Email Template
 */
export const welcomeEmailTemplate = ({
  memberName,
  organizationName,
  role,
  inviterName,
  dashboardLink,
}) => emailWrapper(`
  <div class="header">
    <div class="logo">🚀</div>
    <h1 class="header-title">Welcome to ${organizationName}!</h1>
  </div>

  <div class="content">
    <h2 class="greeting">Welcome aboard, ${memberName}! 👋</h2>

    <p class="message">
      We're excited to have you join <strong>${organizationName}</strong>.
      ${inviterName} and the team are looking forward to collaborating with you.
    </p>

    <div class="info-box">
      <p class="info-box-title">Your Account Details</p>
      <p class="info-box-text">
        <strong>Role:</strong> ${role}<br>
        <strong>Organization:</strong> ${organizationName}
      </p>
    </div>

    <center>
      <a href="${dashboardLink}" class="button">Go to Dashboard →</a>
    </center>

    <div class="divider"></div>

    <h3 style="color: #111827; font-size: 18px; margin: 32px 0 16px;">Getting Started</h3>

    <ul class="checklist">
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span>Complete your profile in Settings</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span>Explore the team directory in People</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span>Review active decisions and discussions</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span>Check out recent announcements</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span>Introduce yourself to the team</span>
      </li>
    </ul>
  </div>

  <div class="footer">
    <p class="footer-text">
      Questions? Reach out to your team or check our <a href="#" class="footer-link">Help Center</a>
    </p>
    <p class="footer-text">
      <strong>Startup OS</strong> - Your team's operating system
    </p>
  </div>
`, `Welcome to ${organizationName} - Get started with Startup OS`);

/**
 * Role Change Email Template
 */
export const roleChangeEmailTemplate = ({
  memberName,
  organizationName,
  oldRole,
  newRole,
  changedBy,
  dashboardLink,
}) => emailWrapper(`
  <div class="header">
    <div class="logo">🎭</div>
    <h1 class="header-title">Role Updated</h1>
  </div>

  <div class="content">
    <h2 class="greeting">Hi ${memberName},</h2>

    <p class="message">
      Your role in <strong>${organizationName}</strong> has been updated by ${changedBy}.
    </p>

    <div class="info-box">
      <p class="info-box-title">Role Change</p>
      <p class="info-box-text">
        <strong>Previous Role:</strong> ${oldRole}<br>
        <strong>New Role:</strong> ${newRole}
      </p>
    </div>

    <p class="message">
      This change may affect your access to certain features. Visit your dashboard to see what's available.
    </p>

    <center>
      <a href="${dashboardLink}" class="button">View Dashboard →</a>
    </center>
  </div>

  <div class="footer">
    <p class="footer-text">
      <strong>Startup OS</strong> - ${organizationName}
    </p>
  </div>
`, `Your role has been updated to ${newRole}`);

/**
 * Invitation Reminder Email Template
 */
export const invitationReminderTemplate = ({
  inviteeName,
  inviterName,
  organizationName,
  role,
  invitationLink,
  daysRemaining,
}) => emailWrapper(`
  <div class="header">
    <div class="logo">⏰</div>
    <h1 class="header-title">Invitation Reminder</h1>
  </div>

  <div class="content">
    <h2 class="greeting">Don't miss out, ${inviteeName}!</h2>

    <p class="message">
      This is a friendly reminder that <strong>${inviterName}</strong> invited you to join
      <strong>${organizationName}</strong> on Startup OS.
    </p>

    <div class="info-box">
      <p class="info-box-title">⚠️ Time-Sensitive</p>
      <p class="info-box-text">
        Your invitation expires in <strong>${daysRemaining} days</strong>.
        Accept now to join your team!
      </p>
    </div>

    <center>
      <a href="${invitationLink}" class="button">Accept Invitation →</a>
    </center>

    <p class="message" style="margin-top: 24px;">
      Role: <strong>${role}</strong>
    </p>
  </div>

  <div class="footer">
    <p class="footer-text">
      <strong>Startup OS</strong> - ${organizationName}
    </p>
  </div>
`, `Reminder: Accept your invitation to join ${organizationName}`);

/**
 * Onboarding Checklist Email Template
 */
export const onboardingChecklistTemplate = ({
  memberName,
  organizationName,
  dashboardLink,
}) => emailWrapper(`
  <div class="header">
    <div class="logo">✅</div>
    <h1 class="header-title">Your Onboarding Checklist</h1>
  </div>

  <div class="content">
    <h2 class="greeting">Let's get you started, ${memberName}!</h2>

    <p class="message">
      Here's a quick checklist to help you make the most of Startup OS at ${organizationName}.
    </p>

    <h3 style="color: #111827; font-size: 18px; margin: 24px 0 16px;">Week 1: Getting Oriented</h3>
    <ul class="checklist">
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Complete your profile</strong> - Add your photo, bio, and contact info</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Meet the team</strong> - Browse the People directory and introduce yourself</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Review active decisions</strong> - Catch up on what the team is discussing</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Read announcements</strong> - Stay informed about company updates</span>
      </li>
    </ul>

    <h3 style="color: #111827; font-size: 18px; margin: 32px 0 16px;">Week 2: Getting Involved</h3>
    <ul class="checklist">
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Participate in a decision</strong> - Vote or comment on a team discussion</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Create your first task</strong> - Add something to track your work</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Share an update</strong> - Post in announcements about your progress</span>
      </li>
      <li class="checklist-item">
        <div class="checkbox"></div>
        <span><strong>Set up notifications</strong> - Configure your preferences in Settings</span>
      </li>
    </ul>

    <center style="margin-top: 32px;">
      <a href="${dashboardLink}" class="button">Go to Dashboard →</a>
    </center>

    <div class="divider"></div>

    <div class="info-box">
      <p class="info-box-title">💡 Pro Tip</p>
      <p class="info-box-text">
        Check your dashboard daily to stay on top of decisions, tasks, and team updates.
        The more you engage, the more value you'll get!
      </p>
    </div>
  </div>

  <div class="footer">
    <p class="footer-text">
      Need help? Check our <a href="#" class="footer-link">Help Center</a> or ask your teammates
    </p>
    <p class="footer-text">
      <strong>Startup OS</strong> - ${organizationName}
    </p>
  </div>
`, `Your onboarding checklist for ${organizationName}`);

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@startupos.dev';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Startup OS';

/**
 * Send invitation email
 */
async function sendInvitationEmail({ inviterName, inviterEmail, inviteeEmail, organizationName, role, invitationLink }) {
  const msg = {
    to: inviteeEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: `You're invited to join ${organizationName} on Startup OS`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
          .logo { font-size: 32px; margin-bottom: 10px; }
          .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
          .content { padding: 40px 30px; }
          .content h2 { color: #18181b; font-size: 24px; margin: 0 0 20px 0; }
          .content p { color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .role-badge { display: inline-block; padding: 4px 12px; background-color: #f4f4f5; color: #9333ea; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .footer { padding: 30px; text-align: center; color: #a1a1aa; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡</div>
            <h1>Startup OS</h1>
          </div>
          <div class="content">
            <h2>You're invited! 🎉</h2>
            <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to join <strong>${organizationName}</strong> on Startup OS.</p>
            <p>You'll be joining as: <span class="role-badge">${role.toUpperCase()}</span></p>
            <p>Click the button below to accept your invitation and get started:</p>
            <center>
              <a href="${invitationLink}" class="button">Accept Invitation →</a>
            </center>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e7; font-size: 14px; color: #71717a;">
              This invitation was sent to ${inviteeEmail}. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>Built with ❤️ for Startup OS</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `You're invited to join ${organizationName}!\n\n${inviterName} (${inviterEmail}) has invited you to join as ${role}.\n\nAccept your invitation: ${invitationLink}\n\nThis invitation was sent to ${inviteeEmail}.`
  };

  try {
    await sgMail.send(msg);
    console.log(`Invitation email sent to ${inviteeEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    throw new Error('Failed to send invitation email');
  }
}

/**
 * Send welcome email after joining
 */
async function sendWelcomeEmail({ memberName, organizationName, role, inviterName, dashboardLink }) {
  const msg = {
    to: memberName, // This should be email, will fix in call
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: `Welcome to ${organizationName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
          .logo { font-size: 32px; margin-bottom: 10px; }
          .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
          .content { padding: 40px 30px; }
          .content h2 { color: #18181b; font-size: 24px; margin: 0 0 20px 0; }
          .content p { color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .footer { padding: 30px; text-align: center; color: #a1a1aa; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉</div>
            <h1>Welcome to ${organizationName}!</h1>
          </div>
          <div class="content">
            <h2>You're all set!</h2>
            <p>Welcome aboard! You've successfully joined <strong>${organizationName}</strong> as a ${role}.</p>
            <p>Get started by exploring your dashboard:</p>
            <center>
              <a href="${dashboardLink}" class="button">Go to Dashboard →</a>
            </center>
            <p style="margin-top: 30px;">Looking forward to seeing what you'll accomplish!</p>
          </div>
          <div class="footer">
            <p>Built with ❤️ for Startup OS</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ${organizationName}!\n\nYou've successfully joined as ${role}.\n\nGo to dashboard: ${dashboardLink}`
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

export {
  sendInvitationEmail,
  sendWelcomeEmail
};

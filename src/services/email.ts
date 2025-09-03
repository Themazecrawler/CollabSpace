// Email service for sending invitations and notifications
// Using Resend API (you can also use SendGrid, Mailgun, etc.)

interface EmailInvite {
  to: string;
  projectName: string;
  projectId: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com';
    this.baseUrl = 'https://api.resend.com/emails';
  }

  async sendProjectInvite(invite: EmailInvite): Promise<boolean> {
    if (!this.apiKey) {
      console.log('No email API key configured, simulating email send');
      return this.simulateEmailSend(invite);
    }

    try {
      const template = this.getInviteEmailTemplate(invite);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: invite.to,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return this.simulateEmailSend(invite);
    }
  }

  private getInviteEmailTemplate(invite: EmailInvite): EmailTemplate {
    const subject = `You've been invited to join ${invite.projectName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join the team and start collaborating</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p><strong>${invite.inviterName}</strong> has invited you to join the project <strong>${invite.projectName}</strong> as a <strong>${invite.role}</strong>.</p>
            
            <p>This is an exciting opportunity to collaborate with the team and contribute to the project's success.</p>
            
            <div style="text-align: center;">
              <a href="${invite.inviteLink}" class="button">Accept Invitation</a>
            </div>
            
            <p><strong>What you'll be able to do:</strong></p>
            <ul>
              <li>View and manage project tasks</li>
              <li>Participate in real-time discussions</li>
              <li>Collaborate on the whiteboard</li>
              <li>Track project progress</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to ${invite.inviterName}.</p>
          </div>
          <div class="footer">
            <p>This invitation will expire in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      You've been invited to join ${invite.projectName}
      
      ${invite.inviterName} has invited you to join the project ${invite.projectName} as a ${invite.role}.
      
      Accept the invitation: ${invite.inviteLink}
      
      What you'll be able to do:
      - View and manage project tasks
      - Participate in real-time discussions
      - Collaborate on the whiteboard
      - Track project progress
      
      If you have any questions, feel free to reach out to ${invite.inviterName}.
      
      This invitation will expire in 7 days.
    `;

    return { subject, html, text };
  }

  private async simulateEmailSend(invite: EmailInvite): Promise<boolean> {
    // Simulate email sending for development
    console.log('📧 Simulating email send:');
    console.log('To:', invite.to);
    console.log('Subject: You\'ve been invited to join', invite.projectName);
    console.log('Inviter:', invite.inviterName);
    console.log('Role:', invite.role);
    console.log('Link:', invite.inviteLink);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    if (!this.apiKey) {
      console.log('No email API key configured, simulating welcome email');
      return this.simulateEmailSend({
        to: email,
        projectName: 'Welcome to CollabSpace',
        projectId: '',
        inviterName: 'The Team',
        role: 'Member',
        inviteLink: window.location.origin
      });
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: email,
          subject: 'Welcome to CollabSpace! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Welcome to CollabSpace, ${userName}! 🎉</h1>
              <p>We're excited to have you on board. Here's what you can do to get started:</p>
              <ul>
                <li>Create your first project</li>
                <li>Invite team members</li>
                <li>Start collaborating on the whiteboard</li>
                <li>Use AI-powered insights</li>
              </ul>
              <p>Happy collaborating!</p>
            </div>
          `
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();

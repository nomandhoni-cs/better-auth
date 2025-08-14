import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  // In development, log the magic link instead of sending email
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔗 DEVELOPMENT MODE - Magic Link:');
    console.log('📧 Email:', email);
    console.log('🔗 Magic Link URL:', url);
    console.log('👆 Click this link to verify your email\n');
    
    // Return a mock success response
    return { id: 'dev-mock-id' };
  }

  try {
    // Check if we're sending to the verified Resend email
    const verifiedEmail = 'alnoman.dhoni@gmail.com'; // Your verified email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Magic Link <onboarding@resend.dev>';
    
    // If sending to a different email in production without domain verification
    if (email !== verifiedEmail && fromEmail.includes('resend.dev')) {
      console.warn('⚠️  Resend domain not verified. Email will only work for:', verifiedEmail);
      console.log('🔗 For testing, use this magic link directly:', url);
      
      // In this case, we'll still try to send but provide the link in console
      console.log('\n🔗 MAGIC LINK FOR TESTING:');
      console.log('📧 Email:', email);
      console.log('🔗 Magic Link URL:', url);
      console.log('👆 Use this link to verify\n');
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Email - Magic Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #44cc00; margin: 0;">Email Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            <p style="color: #666; line-height: 1.5;">
              Click the button below to verify your email address and complete your account setup:
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="display: inline-block; padding: 15px 30px; background-color: #44cc00; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Alternative:</strong> Copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; margin: 10px 0 0 0; font-family: monospace; font-size: 12px;">
              ${url}
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending magic link email:', error);
      
      // If it's a Resend domain error, provide the magic link in console
      if (error.message?.includes('verify a domain')) {
        console.log('\n🔗 RESEND DOMAIN ERROR - Use this magic link directly:');
        console.log('📧 Email:', email);
        console.log('🔗 Magic Link URL:', url);
        console.log('👆 Click this link to verify your email\n');
        
        // Return success so the flow continues
        return { id: 'console-fallback-id' };
      }
      
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending magic link email:', error);
    
    // As a last resort, always provide the magic link in console
    console.log('\n🔗 EMAIL FAILED - Use this magic link directly:');
    console.log('📧 Email:', email);
    console.log('🔗 Magic Link URL:', url);
    console.log('👆 Click this link to verify your email\n');
    
    // Don't throw error, return success so user can still verify
    return { id: 'console-fallback-id' };
  }
} 
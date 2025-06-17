
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    console.log('Processing approval token:', token);

    if (!token) {
      return new Response('Invalid token', { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get approval token details
    const { data: approvalToken, error: tokenError } = await supabaseClient
      .from('approval_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !approvalToken) {
      console.error('Token not found or already used:', tokenError);
      return new Response(`
        <html>
          <head>
            <title>Invalid Link - Dreamers Incubation</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 40px 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { 
                max-width: 500px; 
                background: white; 
                padding: 40px; 
                border-radius: 20px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
              }
              .error { color: #ef4444; }
              .icon { font-size: 48px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1 class="error">Invalid or Expired Link</h1>
              <p>This approval link is invalid or has already been used.</p>
              <p>If you need to review an application, please check your email for a valid link.</p>
            </div>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token is expired
    if (new Date(approvalToken.expires_at) < new Date()) {
      console.log('Token expired:', approvalToken.expires_at);
      return new Response(`
        <html>
          <head>
            <title>Link Expired - Dreamers Incubation</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 40px 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { 
                max-width: 500px; 
                background: white; 
                padding: 40px; 
                border-radius: 20px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
              }
              .warning { color: #f59e0b; }
              .icon { font-size: 48px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏰</div>
              <h1 class="warning">Link Expired</h1>
              <p>This approval link has expired (valid for 7 days).</p>
              <p>Please contact the system administrator if you need to review this application.</p>
            </div>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Get application details for better messaging
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select('founder_name, startup_name, incubation_centre')
      .eq('id', approvalToken.application_id)
      .single();

    // Update application status
    const newStatus = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const timestampField = approvalToken.action === 'approve' ? 'approved_at' : 'rejected_at';

    console.log('Updating application status to:', newStatus);

    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({ 
        status: newStatus,
        [timestampField]: new Date().toISOString()
      })
      .eq('id', approvalToken.application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return new Response(`
        <html>
          <head>
            <title>Error - Dreamers Incubation</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 40px 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { 
                max-width: 500px; 
                background: white; 
                padding: 40px; 
                border-radius: 20px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
              }
              .error { color: #ef4444; }
              .icon { font-size: 48px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1 class="error">Error Processing Request</h1>
              <p>There was an error processing your approval. Please try again or contact support.</p>
            </div>
          </body>
        </html>
      `, { 
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Mark token as used
    await supabaseClient
      .from('approval_tokens')
      .update({ used: true })
      .eq('token', token);

    // Send notification email to applicant
    try {
      await supabaseClient.functions.invoke('send-status-notification', {
        body: { 
          applicationId: approvalToken.application_id, 
          status: newStatus 
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    console.log('Application', newStatus, 'successfully');

    const actionText = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const actionColor = approvalToken.action === 'approve' ? '#10b981' : '#ef4444';
    const actionIcon = approvalToken.action === 'approve' ? '🎉' : '😔';

    return new Response(`
      <html>
        <head>
          <title>Application ${actionText.toUpperCase()} - Dreamers Incubation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 40px 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 600px; 
              background: white; 
              padding: 40px; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .success { color: ${actionColor}; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            .details { 
              background: #f8fafc; 
              padding: 25px; 
              border-radius: 12px; 
              margin: 25px 0; 
              text-align: left;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .status-badge {
              display: inline-block;
              background: ${actionColor};
              color: white;
              padding: 8px 20px;
              border-radius: 25px;
              font-weight: 600;
              font-size: 14px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">${actionIcon}</div>
            <h1 class="success">Application ${actionText.toUpperCase()}!</h1>
            <div class="status-badge">${actionText.toUpperCase()}</div>
            
            ${application ? `
            <div class="details">
              <div class="detail-row">
                <strong>Startup:</strong>
                <span>${application.startup_name}</span>
              </div>
              <div class="detail-row">
                <strong>Founder:</strong>
                <span>${application.founder_name}</span>
              </div>
              <div class="detail-row">
                <strong>Incubation Centre:</strong>
                <span>${application.incubation_centre}</span>
              </div>
            </div>
            ` : ''}
            
            <p><strong>The application has been successfully ${actionText}.</strong></p>
            <p>✅ The applicant has been notified automatically via email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Thank you for reviewing this application for ${application?.incubation_centre || 'your incubation center'}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error("Error in handle-approval function:", error);
    return new Response(`
      <html>
        <head>
          <title>Error - Dreamers Incubation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 40px 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 500px; 
              background: white; 
              padding: 40px; 
              border-radius: 20px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }
            .error { color: #ef4444; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1 class="error">Internal Server Error</h1>
            <p>An unexpected error occurred. Please try again later or contact support.</p>
          </div>
        </body>
      </html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
};

serve(handler);

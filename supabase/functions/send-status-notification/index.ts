import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  applicationId: string;
  status: 'approved' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId, status }: StatusNotificationRequest = await req.json();

    // Get application details
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Application not found:', appError);
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isApproved = status === 'approved';
    const statusText = isApproved ? 'Approved' : 'Rejected';
    const statusColor = isApproved ? '#10B981' : '#EF4444';
    const statusIcon = isApproved ? '🎉' : '😔';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application ${statusText} - Dreamers Incubation</title>
          <style>
            /* styles omitted for brevity */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <span class="icon">${statusIcon}</span>
                <h1>Application ${statusText}!</h1>
              </div>
              <div class="content">
                <div class="status-badge">${statusText.toUpperCase()}</div>
                <!-- details omitted -->
                <div class="message">
                  ${isApproved
                    ? `<p><strong>Congratulations!</strong> Your startup application has been approved by ${application.incubation_centre}.</p>
                       <p>Please log in with your email and password to view your approval details and next steps.</p>`
                    : `<p><strong>We regret to inform you that your application was not approved by ${application.incubation_centre} at this time.</p>
                       <p>Please log in with your email and password to see more information about your application status.</p>`
                  }
                </div>
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'http://localhost:3000'}/login" class="cta-button">
                  ${isApproved ? 'Access Your Dashboard →' : 'Log In to View Status →'}
                </a>
              </div>
              <div class="footer">
                <p>© 2025 Dreamers Incubation. All rights reserved.</p>
                <p>This email was sent regarding your application to ${application.incubation_centre}.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Dreamers Incubation <noreply@resend.dev>",
      to: [application.email],
      subject: `Your Application has been ${statusText}!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Status notification email sent successfully to:", application.email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${statusText} notification sent to ${application.email}`,
      emailResponse 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-status-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);

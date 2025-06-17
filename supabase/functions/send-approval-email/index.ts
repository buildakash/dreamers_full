
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  applicationId: string;
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

    const { applicationId }: EmailRequest = await req.json();

    console.log('Processing approval email for application:', applicationId);

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

    console.log('Application found:', application.startup_name, 'for centre:', application.incubation_centre);

    // Get incubation center admin email based on the selected centre
    const { data: incubationCenter, error: centerError } = await supabaseClient
      .from('incubation_centres')
      .select('admin_email, name')
      .eq('name', application.incubation_centre)
      .single();

    if (centerError || !incubationCenter) {
      console.error('Incubation center not found:', centerError);
      console.error('Looking for centre:', application.incubation_centre);
      return new Response(JSON.stringify({ error: 'Incubation center not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Sending email to incubation center admin:', incubationCenter.admin_email);

    // Create approval tokens with expiration date (7 days from now)
    const approveToken = crypto.randomUUID();
    const rejectToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

    const { error: tokenError } = await supabaseClient
      .from('approval_tokens')
      .insert([
        { 
          application_id: applicationId, 
          token: approveToken, 
          action: 'approve',
          expires_at: expiresAt.toISOString()
        },
        { 
          application_id: applicationId, 
          token: rejectToken, 
          action: 'reject',
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (tokenError) {
      console.error('Error creating tokens:', tokenError);
      return new Response(JSON.stringify({ error: 'Failed to create approval tokens' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Approval tokens created successfully');

    // Send email to incubation center admin (not generic admin)
    const approveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-approval?token=${approveToken}`;
    const rejectUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-approval?token=${rejectToken}`;

    const emailResponse = await resend.emails.send({
      from: "Dreamers Incubation <noreply@resend.dev>",
      to: [incubationCenter.admin_email],
      subject: `New Application for ${incubationCenter.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">New Startup Application Received</h2>
            <p style="margin: 0; color: #666;">A new startup has applied to join ${incubationCenter.name}</p>
          </div>
          
          <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Founder Name:</td>
                <td style="padding: 8px 0; color: #333;">${application.founder_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Startup Name:</td>
                <td style="padding: 8px 0; color: #333;">${application.startup_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${application.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                <td style="padding: 8px 0; color: #333;">${application.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Company Type:</td>
                <td style="padding: 8px 0; color: #333;">${application.company_type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Team Size:</td>
                <td style="padding: 8px 0; color: #333;">${application.team_size}</td>
              </tr>
              ${application.website ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Website:</td>
                <td style="padding: 8px 0; color: #333;"><a href="${application.website}" target="_blank">${application.website}</a></td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Startup Idea:</h3>
            <p style="color: #333; line-height: 1.6; margin: 0;">${application.idea_description}</p>
          </div>

          ${application.expectations && application.expectations.length > 0 ? `
          <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Expectations from Incubation:</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px;">
              ${application.expectations.map(exp => `<li style="margin-bottom: 5px;">${exp}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${application.challenges ? `
          <div style="background-color: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">Current Challenges:</h3>
            <p style="color: #333; line-height: 1.6; margin: 0;">${application.challenges}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #333; margin-bottom: 20px; font-weight: bold;">Please review this application and make your decision:</p>
            <div style="margin: 20px 0;">
              <a href="${approveUrl}" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block; font-weight: bold;">
                ✅ APPROVE APPLICATION
              </a>
              <a href="${rejectUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block; font-weight: bold;">
                ❌ REJECT APPLICATION
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>Important:</strong> These approval links will expire in 7 days.<br>
              This email was sent to you as the admin of ${incubationCenter.name}.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully to:", incubationCenter.admin_email, emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent to ${incubationCenter.name} admin`,
      adminEmail: incubationCenter.admin_email
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);

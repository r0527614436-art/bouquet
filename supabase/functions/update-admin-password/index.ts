import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentPassword, newPassword }: UpdatePasswordRequest = await req.json();
    
    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "Both current and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify current password first
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD secret not set");
      return new Response(
        JSON.stringify({ success: false, error: "Admin password not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (currentPassword !== adminPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "Current password is incorrect" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the password in the database (for persistence - will need to be synced with secret)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Store the new password in admin_settings table
    const { error: dbError } = await supabase
      .from('admin_settings')
      .upsert([{ id: 1, password: newPassword, updated_at: new Date().toISOString() }]);

    if (dbError) {
      console.error("Error updating password in database:", dbError);
      throw dbError;
    }

    console.log("Admin password updated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password updated. Note: You may need to update the ADMIN_PASSWORD secret for permanent changes." 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in update-admin-password function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default async function DebugPage() {
  const supabase = await createClient();
  
  // Check environment variables
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
  };

  // Test Supabase connection
  let connectionStatus: "success" | "error" | "unknown" = "unknown";
  let connectionError = "";
  let authStatus: "enabled" | "disabled" | "unknown" = "unknown";

  try {
    // Test basic connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    
    if (error) {
      connectionStatus = "error";
      connectionError = error.message;
    } else {
      connectionStatus = "success";
    }

    // Check if auth is enabled
    const { data: authData } = await supabase.auth.getSession();
    authStatus = "enabled";
  } catch (error) {
    connectionStatus = "error";
    connectionError = error instanceof Error ? error.message : "Unknown error";
    authStatus = "disabled";
  }

  // Check if we can read profiles
  let profileCount = 0;
  let profileError = "";
  
  try {
    const { data, error } = await supabase.from("profiles").select("id", { count: "exact" });
    if (error) {
      profileError = error.message;
    } else {
      profileCount = data?.length || 0;
    }
  } catch (error) {
    profileError = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Authentication Debug
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Diagnose signup and login issues
          </p>
        </div>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Check if Supabase configuration is properly set
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
              <div className="flex items-center">
                {envVars.supabaseUrl === "Set" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className={`text-sm ${envVars.supabaseUrl === "Set" ? "text-green-600" : "text-red-600"}`}>
                  {envVars.supabaseUrl}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <div className="flex items-center">
                {envVars.supabaseAnonKey === "Set" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className={`text-sm ${envVars.supabaseAnonKey === "Set" ? "text-green-600" : "text-red-600"}`}>
                  {envVars.supabaseAnonKey}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
            <CardDescription>
              Test database connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Connection</span>
              <div className="flex items-center">
                {connectionStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : connectionStatus === "error" ? (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                )}
                <span className={`text-sm capitalize ${
                  connectionStatus === "success" ? "text-green-600" : 
                  connectionStatus === "error" ? "text-red-600" : 
                  "text-yellow-600"
                }`}>
                  {connectionStatus}
                </span>
              </div>
            </div>
            {connectionError && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {connectionError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Service</CardTitle>
            <CardDescription>
              Check if auth is enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auth Service</span>
              <div className="flex items-center">
                {authStatus === "enabled" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : authStatus === "disabled" ? (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                )}
                <span className={`text-sm capitalize ${
                  authStatus === "enabled" ? "text-green-600" : 
                  authStatus === "disabled" ? "text-red-600" : 
                  "text-yellow-600"
                }`}>
                  {authStatus}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Access */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Access</CardTitle>
            <CardDescription>
              Test if we can read profiles from database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Count</span>
              <span className="text-sm text-muted-foreground">
                {profileCount} profiles found
              </span>
            </div>
            {profileError && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {profileError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
            <CardDescription>
              Common fixes for authentication issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>1. Environment Variables:</strong></p>
              <p className="text-muted-foreground ml-4">
                Ensure .env.local contains valid Supabase URL and anon key
              </p>
              
              <p><strong>2. Supabase Project:</strong></p>
              <p className="text-muted-foreground ml-4">
                Verify your Supabase project is active and not paused
              </p>
              
              <p><strong>3. Email Confirmation:</strong></p>
              <p className="text-muted-foreground ml-4">
                Go to Supabase Dashboard &gt; Authentication &gt; Settings and turn OFF "Confirm email" for testing
              </p>
              
              <p><strong>4. CORS Settings:</strong></p>
              <p className="text-muted-foreground ml-4">
                Add http://localhost:3000 to allowed URLs in Supabase Dashboard &gt; Settings &gt; API
              </p>
              
              <p><strong>5. Restart Dev Server:</strong></p>
              <p className="text-muted-foreground ml-4">
                Stop and restart npm run dev after changing environment variables
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

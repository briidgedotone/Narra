"use client";

import { ensureAdminAccess } from "@/app/actions/admin-test";
import { checkCurrentUserAdmin } from "@/app/actions/check-admin";
import { forceAdminCache } from "@/app/actions/force-admin-cache";
import { useEffect, useState } from "react";

export default function TestAdminPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run the admin test on component mount
    ensureAdminAccess().then(setResult).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "monospace" }}>
        <h1>Admin Access Test</h1>
        <p>Running admin test...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ padding: "20px", fontFamily: "monospace" }}>
        <h1>Admin Access Test</h1>
        <p>Error loading test results</p>
      </div>
    );
  }
  
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Admin Access Test</h1>
      <div style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
        <h3>Test Result:</h3>
        <p><strong>Success:</strong> {result.success ? "✅" : "❌"}</p>
        <p><strong>Message:</strong> {result.message}</p>
        <p><strong>User ID:</strong> {result.userId}</p>
        <p><strong>Role:</strong> {result.role}</p>
      </div>
      
      <div style={{ marginTop: "20px", background: "#e8f4f8", padding: "10px", borderRadius: "5px" }}>
        <h3>Cache Management:</h3>
        <button 
          onClick={async () => {
            try {
              const result = await forceAdminCache();
              console.log('Force Cache Result:', result);
              if (result.success) {
                alert(`Cache Updated!\nUser: ${result.email}\nRole: ${result.role}\nIs Admin: ${result.isAdmin}`);
              } else {
                alert(`Error: ${result.error}`);
              }
            } catch (err) {
              alert(`Error: ${err}`);
            }
          }}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          Force Update Cache
        </button>
        
        <button 
          onClick={async () => {
            try {
              const adminCheck = await checkCurrentUserAdmin();
              console.log('Admin Check:', adminCheck);
              alert(`Admin Check:\nSuccess: ${adminCheck.success}\nIs Admin: ${adminCheck.isAdmin}\nError: ${adminCheck.error || 'none'}`);
            } catch (err) {
              alert(`Error: ${err}`);
            }
          }}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#ffc107", 
            color: "black", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          Check Admin Status
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Try Admin Access
        </button>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Debugging Steps:</h3>
        <ol>
          <li>Click "Clear Cache & Reload" to force clear the middleware cache</li>
          <li>Then click "Try Admin Access" or manually visit <a href="/admin">/admin</a></li>
          <li>Check browser console and server logs for detailed debugging info</li>
          <li>If still blocked, there may be a timing issue with middleware</li>
        </ol>
      </div>
      
      <div style={{ marginTop: "20px", background: "#fff3cd", padding: "10px", borderRadius: "5px" }}>
        <h3>Expected Behavior:</h3>
        <p>✅ User should be admin in database</p>
        <p>✅ Cache should be cleared</p>
        <p>✅ Middleware should allow access to /admin</p>
        <p>✅ Admin page should load successfully</p>
      </div>
    </div>
  );
}
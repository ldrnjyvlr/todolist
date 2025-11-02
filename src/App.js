import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  // Loads the current user's role from the profiles table
  function useUserRole(currentUser) {
    const [role, setRole] = useState(null);
    const [roleLoading, setRoleLoading] = useState(!!currentUser);

    useEffect(() => {
      let isMounted = true;
      async function fetchRole() {
        if (!currentUser) {
          setRole(null);
          setRoleLoading(false);
          return;
        }
        setRoleLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();
        if (!isMounted) return;
        if (error) {
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
        setRoleLoading(false);
      }
      fetchRole();
      return () => {
        isMounted = false;
      };
    }, [currentUser]);

    return { role, roleLoading };
  }

  function DashboardRoute() {
    const { role, roleLoading } = useUserRole(user);
    if (!user) return <Navigate to="/" />;
    if (roleLoading) return <div>Loading...</div>;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Dashboard user={user} />;
  }

  function AdminRoute({ children }) {
    const { role, roleLoading } = useUserRole(user);
    if (!user) return <Navigate to="/" />;
    if (roleLoading) return <div>Loading...</div>;
    if (role !== "admin") return <Navigate to="/dashboard" replace />;
    return children;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

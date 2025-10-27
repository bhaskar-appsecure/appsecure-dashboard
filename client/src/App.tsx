import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import ClientLogin from "@/pages/ClientLogin";
import InternalLoginSelection from "@/pages/InternalLoginSelection";
import AdminLogin from "@/pages/AdminLogin";
import PentesterLogin from "@/pages/PentesterLogin";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/not-found";
import Dashboard from "./pages/Dashboard";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<ClientLogin />} />
            <Route
              path="/internal-login"
              element={<InternalLoginSelection />}
            />
            <Route path="/internal-login/admin" element={<AdminLogin />} />
            <Route
              path="/internal-login/pentester"
              element={<PentesterLogin />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

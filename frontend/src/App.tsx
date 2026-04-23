import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Credentials from "./pages/Credentials";
import Login from "./pages/Login";
import LMS from "./pages/LMS";
import Wellbeing from "./pages/Wellbeing";
import AIInsights from "./pages/AIInsights";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="lms" element={<LMS />} />
            <Route path="wellbeing" element={<Wellbeing />} />
            <Route path="ai-insights" element={<AIInsights />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

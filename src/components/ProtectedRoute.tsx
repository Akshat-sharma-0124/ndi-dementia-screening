import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isLoggedIn()) {
    // If user cookie or session is missing, redirect to patient login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

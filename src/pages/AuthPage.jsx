import React from 'react';
import AuthForm from '../components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
      <AuthForm />
    </div>
  );
}
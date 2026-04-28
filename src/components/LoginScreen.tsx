import React, { useState } from 'react';
import { Shield, Fingerprint, Lock } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = () => {
    setIsAuthenticating(true);
    // Simulate OAuth delay
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] transition-all duration-500">

      <div className="w-full max-w-md p-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e8f0fe] rounded-full mb-6">
            <Shield className="w-10 h-10 text-[#1a73e8]" />
          </div>
          <h1 className="text-4xl font-medium text-[var(--text-primary)] tracking-tight mb-2">ResQAI</h1>
          <p className="text-base text-[var(--text-secondary)]">Tactical Intelligence Portal</p>
        </div>

        <div className="card bg-[var(--bg-secondary)] border border-[var(--glass-border)] p-10 flex flex-col shadow-lg">
          {isAuthenticating ? (
             <div className="flex flex-col items-center justify-center py-8">
               <Fingerprint className="w-16 h-16 text-[#1a73e8] animate-pulse mb-6" />
               <p className="text-sm font-medium text-[var(--text-secondary)] mb-6">Verifying Biometrics...</p>
               <div className="w-full h-1.5 bg-[#e8f0fe] rounded-full overflow-hidden">
                 <div className="h-full bg-[#1a73e8] animate-[pulse_1s_ease-in-out_infinite] w-full origin-left"></div>
               </div>
             </div>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-2 text-sm font-medium text-[var(--success-text)] mb-8 pb-6 border-b border-[var(--glass-border)]">
                 <Lock className="w-4 h-4" />
                 <span>Secure Connection Active</span>
              </div>
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-4 bg-white hover:bg-[#f8f9fa] text-[#3c4043] font-medium py-3 px-6 rounded-lg border border-[#dadce0] transition-all shadow-sm"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

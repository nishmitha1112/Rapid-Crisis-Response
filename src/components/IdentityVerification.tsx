import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, ShieldAlert, ScanLine, ChevronDown } from 'lucide-react';

interface IdentityVerificationProps {
  onVerified: (role: 'GUEST' | 'STAFF' | 'ADMIN' | 'RESPONDER') => void;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ onVerified }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'approved' | 'rejected'>('idle');
  const [assignedRole, setAssignedRole] = useState<'GUEST' | 'STAFF' | 'ADMIN' | 'RESPONDER'>('GUEST');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      simulateScanning();
    }
  };

  const simulateScanning = () => {
    setStatus('scanning');
    
    // Simulate AI analysis delay
    setTimeout(() => {
      // In a real app, the backend would return the role based on ID authentication.
      // Here we simulate fetching the role, defaulting to the selected dropdown for demo purposes.
      setStatus('approved');
    }, 3000);
  };

  const handleComplete = () => {
    onVerified(assignedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] transition-colors duration-500">
      <div className="w-full max-w-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#202124] tracking-tight mb-2">Identity Verification</h1>
          <p className="text-[14px] text-[#5f6368]">Please select your role and verify identity</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-[#e8eaed] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {status === 'idle' && (
            <div className="flex flex-col items-center">
              <div 
                className="w-full border-[1.5px] border-dashed border-[#dadce0] rounded-xl p-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#f8f9fa] transition-all duration-150 ease-in-out group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-[#e8f0fe] rounded-full mb-4 group-hover:scale-105 transition-transform duration-150">
                  <UploadCloud className="w-8 h-8 text-[#1a73e8]" />
                </div>
                <p className="text-[#202124] font-medium text-[16px] mb-1">Upload ID Document</p>
                <p className="text-[14px] text-[#5f6368]">{file ? file.name : 'PDF, JPG, or PNG'}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }} />
              </div>
              
              <div className="w-full mt-[24px]">
                <label className="block text-[14px] font-medium text-[#5f6368] mb-2">Select Role</label>
                <div className="relative">
                  <select 
                     className="w-full h-[44px] px-[12px] bg-white text-[#202124] text-[14px] rounded-lg border border-[#dadce0] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all duration-150 ease-in-out cursor-pointer appearance-none"
                     value={assignedRole}
                     onChange={(e) => setAssignedRole(e.target.value as any)}
                     onClick={(e) => e.stopPropagation()}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="GUEST">Guest</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RESPONDER">First Responder</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f6368]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <button 
                onClick={simulateScanning}
                className="w-full mt-[24px] h-[40px] px-[20px] bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[14px] font-medium rounded-lg border-none transition-all duration-150 ease-in-out"
              >
                Verify
              </button>
            </div>
          )}

          {status === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-12 p-6 bg-[#e8f0fe] rounded-full" style={{ animation: 'pulse-ring 2s infinite' }}>
                <ScanLine className="w-12 h-12 text-[#1a73e8]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48px] w-[64px] h-[64px] pointer-events-none overflow-hidden">
                    <div className="w-full h-[3px] bg-[#1a73e8] shadow-[0_0_8px_rgba(26,115,232,0.8)] rounded-full" style={{ animation: 'scan 1.5s ease-in-out infinite' }}></div>
                </div>
              </div>
              <h3 className="text-xl font-medium text-[#202124] mb-2">Verifying Identity</h3>
              <p className="text-sm text-[#5f6368] animate-pulse">Processing secure document...</p>
            </div>
          )}

          {status === 'approved' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-[#34a853]" />
              </div>
              <h3 className="text-2xl font-medium text-[#202124] mb-2">Identity Verified</h3>
              <div className="px-4 py-2 bg-[#e6f4ea] rounded-full mb-10">
                 <p className="text-sm font-medium text-[#137333]">Role: {assignedRole}</p>
              </div>

              <button 
                onClick={handleComplete}
                className="w-full btn-primary py-3"
              >
                Continue
              </button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="p-4 bg-[#fce8e6] rounded-full mb-6">
                <ShieldAlert className="w-12 h-12 text-[#ea4335]" />
              </div>
              <h3 className="text-xl font-medium text-[#202124] mb-2">Verification Failed</h3>
              <p className="text-sm text-[#ea4335] mb-8">Invalid or unrecognizable document.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full btn-secondary py-3"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onLogin: () => void;
}

const AdminAuth = ({ onLogin }: AdminAuthProps) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (password === '0527614436') {
      onLogin();
      sessionStorage.setItem('admin_auth', password);
      setPassword('');
    } else {
      toast({
        title: "שגיאה",
        description: "סיסמה שגויה",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
            alt="בוקט לוגו" 
            width="476" 
            height="726"
            loading="lazy"
            decoding="async"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-pink-800">פאנל ניהול</h2>
        </div>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="הכנס סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="text-center"
          />
          <Button 
            onClick={handleLogin}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            כניסה
          </Button>
          <Link to="/" className="block text-center text-pink-600 hover:text-pink-700">
            חזרה לעמוד הראשי
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;

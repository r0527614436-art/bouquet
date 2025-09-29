
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAdminPassword } from '@/hooks/useAdminPassword';

interface PasswordDialogProps {
  showPasswordDialog: boolean;
  setShowPasswordDialog: (show: boolean) => void;
}

const PasswordDialog = ({ showPasswordDialog, setShowPasswordDialog }: PasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const { updatePasswordMutation } = useAdminPassword();

  const handleSavePassword = () => {
    updatePasswordMutation.mutate(newPassword);
    setShowPasswordDialog(false);
    setNewPassword('');
  };

  return (
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שנה סיסמה</DialogTitle>
          <DialogDescription>הזן את הסיסמה החדשה למערכת הניהול</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              onClick={handleSavePassword}
              disabled={!newPassword.trim()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Save className="h-4 w-4 ml-2" />
              שמור
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;

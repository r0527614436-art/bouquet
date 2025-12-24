
import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PasswordDialogProps {
  showPasswordDialog: boolean;
  setShowPasswordDialog: (show: boolean) => void;
}

const PasswordDialog = ({ showPasswordDialog, setShowPasswordDialog }: PasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSavePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות החדשות לא תואמות",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-admin-password', {
        body: { currentPassword, newPassword }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "הצלחה",
          description: "הסיסמה שונתה בהצלחה"
        });
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: "שגיאה",
          description: data?.error || "אירעה שגיאה בשינוי הסיסמה",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשינוי הסיסמה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שנה סיסמה</DialogTitle>
          <DialogDescription>הזן את הסיסמה הנוכחית והסיסמה החדשה</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="הכנס סיסמה נוכחית"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">סיסמה חדשה</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="הכנס סיסמה חדשה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">אימות סיסמה חדשה</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="הכנס שוב את הסיסמה החדשה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              onClick={handleSavePassword}
              disabled={isLoading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  שמור
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isLoading}
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

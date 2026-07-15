import React from 'react';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUndo } from '@/contexts/UndoContext';
import { useToast } from '@/hooks/use-toast';

const UndoButton: React.FC = () => {
  const { stack, undoLast, isUndoing } = useUndo();
  const { toast } = useToast();
  const last = stack[stack.length - 1];

  const handleClick = async () => {
    if (!last) return;
    try {
      await undoLast();
      toast({ title: 'הפעולה בוטלה', description: last.label });
    } catch (e: any) {
      toast({
        title: 'שגיאה בביטול הפעולה',
        description: e?.message || 'לא ניתן לבטל את הפעולה',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!last || isUndoing}
      variant="outline"
      className="border-pink-600 text-pink-600 hover:bg-pink-50 relative"
      title={last ? `בטל: ${last.label}` : 'אין פעולות לביטול'}
    >
      <Undo2 className="h-4 w-4 ml-2" />
      בטל פעולה אחרונה
      {stack.length > 0 && (
        <span className="mr-2 inline-flex items-center justify-center bg-pink-600 text-white text-xs rounded-full w-5 h-5">
          {stack.length}
        </span>
      )}
    </Button>
  );
};

export default UndoButton;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  category_id: string;
  image_url: string;
  title: string;
  price: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [itemForm, setItemForm] = useState({
    title: '',
    price: '',
    image_url: '',
    category_id: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === '0527614436') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === '0527614436') {
      setIsAuthenticated(true);
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

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated
  });

  const { data: items = [] } = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowCategoryDialog(false);
      setNewCategoryName('');
      toast({
        title: "הצלחה",
        description: "הקטגוריה נוספה בהצלחה"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setNewCategoryName('');
      toast({
        title: "הצלחה",
        description: "הקטגוריה עודכנה בהצלחה"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      toast({
        title: "הצלחה",
        description: "הקטגוריה נמחקה בהצלחה"
      });
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: Omit<Item, 'id'>) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      setShowItemDialog(false);
      setItemForm({ title: '', price: '', image_url: '', category_id: '' });
      toast({
        title: "הצלחה",
        description: "הפריט נוסף בהצלחה"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: Item) => {
      const { data, error } = await supabase
        .from('catalog_items')
        .update({
          title: item.title,
          price: item.price,
          image_url: item.image_url,
          category_id: item.category_id
        })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      setShowItemDialog(false);
      setEditingItem(null);
      setItemForm({ title: '', price: '', image_url: '', category_id: '' });
      toast({
        title: "הצלחה",
        description: "הפריט עודכן בהצלחה"
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      toast({
        title: "הצלחה",
        description: "הפריט נמחק בהצלחה"
      });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert([{ id: 1, password: newPassword }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setShowPasswordDialog(false);
      setNewPassword('');
      toast({
        title: "הצלחה",
        description: "הסיסמה שונתה בהצלחה"
      });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט לוגו" 
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center text-pink-600 hover:text-pink-700">
              <ArrowRight className="h-5 w-5 ml-2" />
              חזרה לעמוד הראשי
            </Link>
            
            <h1 className="text-2xl font-bold text-pink-800">פאנל ניהול</h1>
            
            <Button
              onClick={() => setShowPasswordDialog(true)}
              variant="outline"
              className="border-pink-600 text-pink-600 hover:bg-pink-50"
            >
              שנה סיסמה
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-pink-800">קטגוריות</h2>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName('');
                setShowCategoryDialog(true);
              }}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף קטגוריה
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setNewCategoryName(category.name);
                        setShowCategoryDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק את הקטגוריה?')) {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {items.filter(item => item.category_id === category.id).length} פריטים
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-pink-800">פריטים</h2>
            <Button
              onClick={() => {
                setEditingItem(null);
                setItemForm({ title: '', price: '', image_url: '', category_id: '' });
                setShowItemDialog(true);
              }}
              className="bg-pink-600 hover:bg-pink-700"
              disabled={categories.length === 0}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף פריט
            </Button>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">יש ליצור קטגוריה לפני הוספת פריטים</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const category = categories.find(cat => cat.id === item.category_id);
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category?.name}</p>
                      {item.price && (
                        <p className="text-pink-600 font-bold mb-3">₪{item.price}</p>
                      )}
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({
                              title: item.title,
                              price: item.price,
                              image_url: item.image_url,
                              category_id: item.category_id
                            });
                            setShowItemDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('האם אתה בטוח שברצונך למחוק את הפריט?')) {
                              deleteItemMutation.mutate(item.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="שם הקטגוריה"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={() => {
                  if (editingCategory) {
                    updateCategoryMutation.mutate({
                      id: editingCategory.id,
                      name: newCategoryName
                    });
                  } else {
                    createCategoryMutation.mutate(newCategoryName);
                  }
                }}
                disabled={!newCategoryName.trim()}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Save className="h-4 w-4 ml-2" />
                שמור
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'ערוך פריט' : 'הוסף פריט חדש'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="כותרת הפריט"
              value={itemForm.title}
              onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="מחיר (אופציונלי)"
              value={itemForm.price}
              onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
            />
            <Input
              placeholder="כתובת התמונה (URL)"
              value={itemForm.image_url}
              onChange={(e) => setItemForm(prev => ({ ...prev, image_url: e.target.value }))}
            />
            <select
              value={itemForm.category_id}
              onChange={(e) => setItemForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">בחר קטגוריה</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={() => {
                  if (editingItem) {
                    updateItemMutation.mutate({
                      ...editingItem,
                      ...itemForm
                    });
                  } else {
                    createItemMutation.mutate(itemForm);
                  }
                }}
                disabled={!itemForm.title.trim() || !itemForm.category_id || !itemForm.image_url.trim()}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Save className="h-4 w-4 ml-2" />
                שמור
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowItemDialog(false)}
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שנה סיסמה</DialogTitle>
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
                onClick={() => updatePasswordMutation.mutate(newPassword)}
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
    </div>
  );
};

export default Admin;

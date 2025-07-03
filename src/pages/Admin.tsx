
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import AdminAuth from '@/components/admin/AdminAuth';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ItemManagement from '@/components/admin/ItemManagement';
import PasswordDialog from '@/components/admin/PasswordDialog';
import HomepageSlideManagement from '@/components/admin/HomepageSlideManagement';

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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === '0527614436') {
      setIsAuthenticated(true);
    }
  }, []);

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

  if (!isAuthenticated) {
    return <AdminAuth onLogin={() => setIsAuthenticated(true)} />;
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
        <HomepageSlideManagement />
        <CategoryManagement categories={categories} items={items} />
        <ItemManagement categories={categories} items={items} />
      </main>

      <PasswordDialog 
        showPasswordDialog={showPasswordDialog} 
        setShowPasswordDialog={setShowPasswordDialog} 
      />
    </div>
  );
};

export default Admin;

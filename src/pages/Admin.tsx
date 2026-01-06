
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import AdminAuth from '@/components/admin/AdminAuth';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CategoryOrderManagement from '@/components/admin/CategoryOrderManagement';
import ItemManagement from '@/components/admin/ItemManagement';
import FilterManagement from '@/components/admin/FilterManagement';
import PasswordDialog from '@/components/admin/PasswordDialog';
import HomepageSlideManagement from '@/components/admin/HomepageSlideManagement';
import TestimonialsManagement from '@/components/admin/TestimonialsManagement';
import CatalogPDFManagement from '@/components/admin/CatalogPDFManagement';
import { useAutoGeneratePDF } from '@/hooks/useAutoGeneratePDF';

interface Category {
  id: string;
  name: string;
  subtitle: string | null;
  allow_cart: boolean;
  subcategories?: any;
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
  
  // Auto-generate PDF when admin panel is accessed
  useAutoGeneratePDF();

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: categories = [], refetch: refetchCategories } = useQuery({
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

  const handleReorderCategories = async (reorderedCategories: Category[]) => {
    // For now, we'll just update the order in the client
    // In a full implementation, you might want to add an order field to the database
    console.log('Categories reordered:', reorderedCategories);
  };

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
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center text-pink-600 hover:text-pink-700">
                <ArrowRight className="h-5 w-5 ml-2" />
                חזרה לעמוד הראשי
              </Link>
              <Link to="/catalog" className="flex items-center text-pink-600 hover:text-pink-700">
                <ArrowRight className="h-5 w-5 ml-2" />
                חזרה לקטלוג
              </Link>
            </div>
            
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
        <TestimonialsManagement />
        <CatalogPDFManagement />
        <CategoryOrderManagement 
          categories={categories} 
          onReorderCategories={handleReorderCategories}
        />
        <CategoryManagement categories={categories as any} items={items} />
        <FilterManagement categories={categories as any} items={items} />
        <ItemManagement categories={categories as any} items={items} />
      </main>

      <PasswordDialog 
        showPasswordDialog={showPasswordDialog} 
        setShowPasswordDialog={setShowPasswordDialog} 
      />
    </div>
  );
};

export default Admin;

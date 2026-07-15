
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderTree, Download, Package, MessageSquareQuote, MessageCircle, Images } from 'lucide-react';
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
import HomepagePopupManager from '@/components/admin/HomepagePopupManager';
import TestimonialsManagement from '@/components/admin/TestimonialsManagement';
import CatalogPDFManagement from '@/components/admin/CatalogPDFManagement';
import { useAutoGeneratePDF } from '@/hooks/useAutoGeneratePDF';
import { UndoProvider } from '@/contexts/UndoContext';
import UndoButton from '@/components/admin/UndoButton';

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

  const [activeSection, setActiveSection] = useState<string>('categories');

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
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated
  });

  if (!isAuthenticated) {
    return <AdminAuth onLogin={() => setIsAuthenticated(true)} />;
  }

  const sections = [
    { id: 'categories', label: 'ניהול קטגוריות', icon: FolderTree },
    { id: 'catalog-pdf', label: 'הורדת קטגוריות וקובץ קטלוג', icon: Download },
    { id: 'items', label: 'ניהול מוצרים', icon: Package },
    { id: 'testimonials', label: 'ניהול המלצות', icon: MessageSquareQuote },
    { id: 'popups', label: 'ניהול פופאפים', icon: MessageCircle },
    { id: 'slides', label: 'ניהול סליידר דף הבית', icon: Images },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'categories':
        return (
          <>
            <CategoryOrderManagement
              categories={categories}
              onReorderCategories={handleReorderCategories}
            />
            <CategoryManagement categories={categories as any} items={items} />
          </>
        );
      case 'catalog-pdf':
        return <CatalogPDFManagement />;
      case 'items':
        return (
          <>
            <FilterManagement categories={categories as any} items={items} />
            <ItemManagement categories={categories as any} items={items} />
          </>
        );
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'popups':
        return <HomepagePopupManager />;
      case 'slides':
        return <HomepageSlideManagement />;
      default:
        return null;
    }
  };

  return (
    <UndoProvider>
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
            
            <div className="flex items-center gap-2">
              <UndoButton />
              <Button
                onClick={() => setShowPasswordDialog(true)}
                variant="outline"
                className="border-pink-600 text-pink-600 hover:bg-pink-50"
              >
                שנה סיסמה
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6" dir="rtl">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-pink-100 p-2 lg:sticky lg:top-6">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {sections.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <li key={s.id} className="shrink-0 lg:shrink">
                    <button
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-right text-sm transition-colors whitespace-nowrap lg:whitespace-normal ${
                        active
                          ? 'bg-pink-600 text-white'
                          : 'text-pink-800 hover:bg-pink-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {renderSection()}
        </main>
      </div>

      <PasswordDialog 
        showPasswordDialog={showPasswordDialog} 
        setShowPasswordDialog={setShowPasswordDialog} 
      />
    </div>
    </UndoProvider>
  );
};

export default Admin;

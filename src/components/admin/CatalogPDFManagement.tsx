import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BUCKET_NAME = 'catalog-pdfs';
const CATALOG_PDF_PATH = 'catalog-download.pdf';

async function publicFileExists(publicUrl: string): Promise<boolean> {
  // Avoid CDN/browser caching of a previous 404 by adding a cache-busting query param.
  const bustUrl = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

  try {
    const headResponse = await fetch(bustUrl, { method: 'HEAD', cache: 'no-store' });
    if (headResponse.ok) return true;
    if (headResponse.status === 404) return false;

    // Some environments may not support HEAD properly (405/400). Fallback to GET and cancel the body.
    if (headResponse.status === 405 || headResponse.status === 400) {
      const getResponse = await fetch(bustUrl, { method: 'GET', cache: 'no-store' });
      // Cancel download ASAP (we only need headers / status)
      getResponse.body?.cancel();
      return getResponse.ok;
    }

    return false;
  } catch {
    return false;
  }
}

const CatalogPDFManagement = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if PDF exists
  const { data: pdfUrl, isLoading } = useQuery({
    queryKey: ['catalog-pdf-url'],
    queryFn: async () => {
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(CATALOG_PDF_PATH);
      
      const exists = await publicFileExists(data.publicUrl);
      return exists ? data.publicUrl : null;
    }
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "שגיאה",
        description: "אנא בחר קובץ PDF בלבד",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting PDF upload...', { fileName: file.name, fileSize: file.size, fileType: file.type });
      
      // First, try to delete the existing file if it exists
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([CATALOG_PDF_PATH]);
      
      if (deleteError) {
        console.log('Delete existing file result:', deleteError);
        // Don't throw here - file might not exist
      }
      
      // Upload the PDF file with a fixed name
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(CATALOG_PDF_PATH, file, {
          cacheControl: '3600',
          upsert: true
        });

      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      toast({
        title: "הצלחה",
        description: "קובץ ה-PDF הועלה בהצלחה"
      });

      // Optimistic UI update (avoid a stuck "לא קיים" due to caching/propagation)
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(CATALOG_PDF_PATH);
      queryClient.setQueryData(['catalog-pdf-url'], publicUrlData.publicUrl);

      // Then revalidate from the network
      await queryClient.invalidateQueries({ queryKey: ['catalog-pdf-url'] });
      // A short delay helps when the public endpoint needs a moment to reflect the new object
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['catalog-pdf-url'] });
      }, 800);
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error statusCode:', error?.statusCode);
      toast({
        title: "שגיאה",
        description: error?.message || "אירעה שגיאה בהעלאת הקובץ",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([CATALOG_PDF_PATH]);

      if (error) throw error;

      // Force refetch by removing the query and refetching
      queryClient.removeQueries({ queryKey: ['catalog-pdf-url'] });
      await queryClient.refetchQueries({ queryKey: ['catalog-pdf-url'] });

      toast({
        title: "הצלחה",
        description: "קובץ ה-PDF נמחק בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הקובץ",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        ניהול קובץ קטלוג PDF
      </h2>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          העלה קובץ PDF שיורד כאשר לקוחות לוחצים על כפתור "הורד קטלוג" בקטלוג
        </p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            ref={fileInputRef}
            className="hidden"
            id="pdf-upload"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                מעלה...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                העלה PDF חדש
              </>
            )}
          </Button>

          {pdfUrl && (
            <>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  צפה בקובץ
                </Button>
              </a>

              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    מוחק...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    מחק
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {isLoading ? (
          <p className="text-gray-500 text-sm">בודק אם קיים קובץ...</p>
        ) : pdfUrl ? (
          <p className="text-green-600 text-sm flex items-center gap-1">
            <FileText className="h-4 w-4" />
            קובץ PDF קיים ופעיל
          </p>
        ) : (
          <p className="text-orange-600 text-sm">
            לא קיים קובץ PDF. העלה קובץ כדי לאפשר הורדה מהקטלוג.
          </p>
        )}
      </div>
    </div>
  );
};

export default CatalogPDFManagement;

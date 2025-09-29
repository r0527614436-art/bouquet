import jsPDF from 'jspdf';

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
  subcategory?: string;
}

interface Category {
  id: string;
  name: string;
  subtitle?: string | null;
}
export const generateCatalogPDF = async (items: CatalogItem[], categories: Category[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;
  
  // Add Hebrew font support - using Arial Unicode MS
  pdf.setLanguage('he');
  
  // Header
  pdf.setFontSize(24);
  pdf.setFont('Arial', 'bold');
  pdf.text('קטלוג בוקט', pageWidth / 2, currentY, { align: 'center' });
  
  // Add logo area (placeholder for now)
  currentY += 20;
  pdf.setFontSize(12);
  pdf.text('רוחי רובינשטיין עיצוב אירועים', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 20;
  
  // Group items by category
  const groupedItems = items.reduce((groups: Record<string, CatalogItem[]>, item) => {
    if (!groups[item.category_id]) groups[item.category_id] = [];
    groups[item.category_id].push(item);
    return groups;
  }, {});
  
  // Process each category
  for (const categoryId of Object.keys(groupedItems)) {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryItems = groupedItems[categoryId];
    
    if (!category) continue;
    
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Category header
    pdf.setFontSize(18);
    pdf.setFont('Arial', 'bold');
    pdf.text(category.name, margin, currentY);
    currentY += 10;
    
    if (category.subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('Arial', 'normal');
      pdf.text(category.subtitle, margin, currentY);
      currentY += 10;
    }
    
    // Group items by subcategory
    const subcategoryGroups = categoryItems.reduce((groups: Record<string, CatalogItem[]>, item) => {
      const key = item.subcategory || 'main';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
    
    // Process each subcategory
    for (const [subcategoryKey, subcategoryItems] of Object.entries(subcategoryGroups)) {
      if (subcategoryKey !== 'main') {
        // Subcategory header
        pdf.setFontSize(14);
        pdf.setFont('Arial', 'bold');
        pdf.text(subcategoryKey, margin + 5, currentY);
        currentY += 8;
      }
      
      // List items
      pdf.setFontSize(11);
      pdf.setFont('Arial', 'normal');
      
      for (const item of subcategoryItems) {
        // Check if we need a new page
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = margin;
        }
        
        let itemText = `• ${item.title}`;
        if (item.price) {
          itemText += ` - ₪${item.price}`;
        }
        
        const textLines = pdf.splitTextToSize(itemText, contentWidth - 10);
        
        for (const line of textLines) {
          pdf.text(line, margin + 10, currentY);
          currentY += 5;
        }
      }
      
      currentY += 5; // Space after subcategory
    }
    
    currentY += 10; // Space after category
  }
  
  // Add footer with contact info
  if (currentY > pageHeight - 40) {
    pdf.addPage();
    currentY = margin;
  } else {
    currentY = pageHeight - 30;
  }
  
  pdf.setFontSize(10);
  pdf.setFont('Arial', 'normal');
  pdf.text('ליצירת קשר: רוחי רובינשטיין', pageWidth / 2, currentY, { align: 'center' });
  pdf.text('עיצוב אירועים וחתונות חרדיות', pageWidth / 2, currentY + 5, { align: 'center' });
  
  return pdf;
};

export const downloadCatalogPDF = async (items: CatalogItem[], categories: Category[]) => {
  try {
    const pdf = await generateCatalogPDF(items, categories);
    const fileName = `קטלוג בוקט.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
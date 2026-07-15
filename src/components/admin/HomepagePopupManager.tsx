import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PopupSettingsForm from './PopupSettingsForm';

const HomepagePopupManager: React.FC = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>ניהול פופאפים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="homepage" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="homepage">פופאפ דף הבית</TabsTrigger>
            <TabsTrigger value="catalog">פופאפ הקטלוג</TabsTrigger>
          </TabsList>
          <TabsContent value="homepage">
            <PopupSettingsForm
              tableName="homepage_popup"
              queryKey="homepage-popup-admin"
              publicQueryKey="homepage-popup"
            />
          </TabsContent>
          <TabsContent value="catalog">
            <PopupSettingsForm
              tableName="catalog_popup"
              queryKey="catalog-popup-admin"
              publicQueryKey="catalog-popup"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HomepagePopupManager;

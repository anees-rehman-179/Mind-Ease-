import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, isGuest } = useAuth();
  const [textSize, setTextSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-card">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Account Settings */}
              {!isGuest && (
                <Card className="card-calm border-border/50">
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ''} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={user?.name || ''} className="bg-input/50" />
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </CardContent>
                </Card>
              )}

              {/* Accessibility */}
              <Card className="card-calm border-border/50">
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Text Size</Label>
                    <Select value={textSize} onValueChange={setTextSize}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>High Contrast Mode</Label>
                    <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Text-to-Speech</Label>
                    <Switch checked={textToSpeech} onCheckedChange={setTextToSpeech} />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="card-calm border-border/50">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label>Daily Check-in Reminders</Label>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Save Settings
              </Button>
            </div>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

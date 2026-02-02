import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import {
  MessageCircle,
  SmilePlus,
  BarChart3,
  Settings,
  LogOut,
  Heart,
  History,
  User,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

const menuItems = [
  { title: 'Chat', url: '/chat', icon: MessageCircle },
  { title: 'Mood Tracking', url: '/mood', icon: SmilePlus },
  { title: 'Progress', url: '/progress', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  const { sessions, startNewChat, loadSession } = useChat();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewChat = () => {
    startNewChat();
    if (location.pathname !== '/chat') navigate('/chat');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">MindEase</span>
              <span className="text-xs text-muted-foreground">Wellness companion</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <button onClick={() => navigate(item.url)} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isGuest && !collapsed && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-2">
              <SidebarGroupLabel className="flex items-center gap-2">
                <History className="h-3 w-3" />
                History
              </SidebarGroupLabel>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewChat}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton asChild>
                      <button 
                        onClick={() => {
                          loadSession(session.id);
                          if (location.pathname !== '/chat') navigate('/chat');
                        }}
                        className="flex flex-col items-start gap-0.5 w-full py-2"
                      >
                        <span className="text-sm truncate w-full text-left font-medium">
                          {session.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(session.timestamp, 'MMM d, h:mm a')}
                        </span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{user?.name || 'Guest'}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
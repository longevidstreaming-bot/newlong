

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Home, 
  Search, 
  Upload, 
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Play,
  Music,
  CreditCard,
  Crown,
  Bell,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AdSenseScript from '@/components/ads/AdSenseScript';

// Main navigation links for everyone
const mainNavLinks = [
  { name: 'Início', icon: Home, url: 'Home' },
  { name: 'Premium', icon: Crown, url: 'Pricing' },
];

const exploreCategories = [
    { name: "Pop", value: "pop" },
    { name: "Rock", value: "rock" },
    { name: "Sertanejo", value: "sertanejo" },
    { name: "Hip Hop", value: "hiphop" },
    { name: "MPB", value: "mpb" },
    { name: "Eletrônica", value: "eletronica" },
    { name: "Gospel", value: "gospel" },
    { name: "Reggae", value: "reggae" },
    { name: "Metal", value: "metal" },
    { name: "Infantil", value: "infantil" }
];

// Role-specific links for the main navigation (left side of header)
const mainNavRoleSpecificLinks = {
  user: [],
  artist: [
    { name: "Painel Artista", icon: Music, url: "ArtistDashboard" },
    { name: "Upload", icon: Upload, url: "UploadVideo" }
  ],
  admin: []
};

// Links for the user dropdown menu
const dropdownNavLinks = {
  user: [
    { name: 'Meu Perfil', icon: UserIcon, url: 'Profile' },
    { name: 'Torne-se Artista', icon: Music, url: 'BecomeArtist' },
    { name: 'Assinatura', icon: CreditCard, url: 'PlanSelection' },
  ],
  artist: [
    { name: 'Meu Perfil', icon: UserIcon, url: 'ArtistProfile' },
    { name: 'Dashboard', icon: Music, url: 'ArtistDashboard' },
    { name: 'Upload', icon: Upload, url: 'UploadVideo' },
    { name: 'Assinatura', icon: CreditCard, url: 'PlanSelection' },
  ],
  admin: [
    { name: 'Meu Perfil', icon: UserIcon, url: 'Profile' },
    { name: 'Painel Admin', icon: ShieldCheck, url: 'AdminDashboard' },
    { name: 'Assinatura', icon: CreditCard, url: 'PlanSelection' },
  ],
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Verificar autenticação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.id);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser, location.pathname]);

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    try {
      const userNotifications = await Notification.filter({ user_id: userId }, '-created_date', 50);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await Notification.update(notification.id, { read: true });
        if (currentUser) {
          fetchNotifications(currentUser.id);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.video_id) {
      window.location.href = createPageUrl(`Watch?v=${notification.video_id}`);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    const promises = unreadNotifications.map(n => Notification.update(n.id, { read: true }));
    try {
      await Promise.all(promises);
      if (currentUser) {
        fetchNotifications(currentUser.id);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl(`Home?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setCurrentUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };
  
  const getNavLinks = (role) => {
    const baseLinks = [...mainNavLinks];
    const roleLinks = mainNavRoleSpecificLinks[role] || [];
    return baseLinks.concat(roleLinks);
  };
  
  const filteredNavLinks = useMemo(() => getNavLinks(currentUser?.role || 'user'), [currentUser]);

  const handleMenuItemClick = (item) => {
    setAdminMenuOpen(false);
    if (item.action === "logout") {
      handleLogout();
    } else if (item.url) {
      window.location.href = createPageUrl(item.url);
    }
  };

  const displayedUserDropdownLinks = useMemo(() => {
    if (!currentUser) return [];
    return dropdownNavLinks[currentUser.role] || [];
  }, [currentUser]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212' }}>
      <AdSenseScript />
      
      <nav className="border-b sticky top-0 z-50" style={{ backgroundColor: '#1E1E2F', borderColor: '#2C2C3E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-[#2C2C3E] mr-3"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <a href={createPageUrl('Home')} className="flex items-center space-x-3 text-white">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF4F81, #7B61FF)' }}>
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <span className="text-xl font-bold">LONGEVID</span>
              </a>

              <div className="hidden lg:flex items-center space-x-8 ml-10">
                {filteredNavLinks.map((link) => (
                  <a
                    key={link.name}
                    href={createPageUrl(link.url)}
                    className="text-[#B0B0B0] hover:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </a>
                ))}

                <Popover>
                    <PopoverTrigger asChild>
                    <button className="text-[#B0B0B0] hover:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-2">
                        <Compass className="w-4 h-4" />
                        <span>Explorar</span>
                    </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 bg-[#1E1E2F] border-[#2C2C3E] text-white p-2">
                    <div className="grid gap-1">
                        {exploreCategories.map((category) => (
                        <a
                            key={category.value}
                            href={createPageUrl(`Home?category=${category.value}`)}
                            className="p-2 rounded-md hover:bg-[#2C2C3E] text-sm text-[#B0B0B0] hover:text-white transition-colors"
                            onClick={() => setSidebarOpen(false)}
                        >
                            {category.name}
                        </a>
                        ))}
                    </div>
                    </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                  <Input
                    type="text"
                    placeholder="Pesquisar artistas, músicas..."
                    className="pl-10 pr-4 py-2 w-full bg-[#121212] border-[#2C2C3E] text-white placeholder-[#B0B0B0] focus:border-[#7B61FF] rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {authLoading ? (
                <div className="w-20 h-8 bg-[#2C2C3E] rounded-md animate-pulse"></div>
              ) : currentUser ? (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-[#B0B0B0] hover:text-white hover:bg-[#2C2C3E]">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[#1E1E2F]" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#1E1E2F] border-[#2C2C3E] text-white p-0">
                        <div className="p-4 border-b border-[#2C2C3E] flex justify-between items-center">
                            <h4 className="font-semibold">Notificações</h4>
                            {unreadCount > 0 && (
                                <Button variant="link" size="sm" className="text-blue-400 p-0 h-auto" onClick={markAllAsRead}>
                                    Marcar todas como lidas
                                </Button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div 
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 border-b border-[#2C2C3E] cursor-pointer hover:bg-[#2C2C3E] ${!n.read ? 'bg-blue-500/10' : ''}`}
                                    >
                                        <p className="text-sm">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-8">Nenhuma notificação ainda.</p>
                            )}
                        </div>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center space-x-3">
                    <span className="hidden lg:block text-white text-sm">
                      {currentUser.full_name}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <img 
                        src={currentUser.artist_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=7B61FF&color=fff`}
                        alt={currentUser.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      {currentUser.role === 'artist' && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Artista Verificado"></div>
                      )}
                      {currentUser.role === 'admin' && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full" title="Administrador"></div>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                        className="text-[#B0B0B0] hover:text-white hover:bg-[#2C2C3E]"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>

                      {adminMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setAdminMenuOpen(false)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-20" style={{ backgroundColor: '#1E1E2F', border: '1px solid #2C2C3E' }}>
                            <div className="py-2">
                              {displayedUserDropdownLinks.map((link) => (
                                <button
                                  key={link.name}
                                  onClick={() => handleMenuItemClick(link)}
                                  className="w-full flex items-center px-4 py-3 text-sm text-[#B0B0B0] hover:text-white hover:bg-[#2C2C3E] transition-colors text-left"
                                >
                                  <link.icon className="w-4 h-4 mr-3" />
                                  {link.name}
                                </button>
                              ))}
                              
                              <button
                                onClick={() => handleLogout()}
                                className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-colors text-left border-t"
                                style={{ borderColor: '#2C2C3E' }}
                              >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sair
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={() => window.location.href = createPageUrl('AuthPage')}
                  className="font-bold"
                  style={{ background: 'linear-gradient(135deg, #FF4F81, #7B61FF)' }}
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#2C2C3E' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavLinks.map((link) => (
                <a
                  key={link.name}
                  href={createPageUrl(link.url)}
                  className="text-[#B0B0B0] hover:text-white block px-3 py-2 text-base font-medium flex items-center space-x-2"
                  onClick={() => setSidebarOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </a>
              ))}
              
              <div className="border-t border-[#2C2C3E] my-2"></div>
              <span className="text-white px-3 py-2 text-base font-medium flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>Explorar Gêneros</span>
              </span>
              {exploreCategories.map((category) => (
                <a
                  key={category.value}
                  href={createPageUrl(`Home?category=${category.value}`)}
                  className="text-[#B0B0B0] hover:text-white block pl-10 pr-3 py-2 text-base font-medium"
                  onClick={() => setSidebarOpen(false)}
                >
                  {category.name}
                </a>
              ))}
              
              {currentUser && (
                <>
                  <div className="border-t border-[#2C2C3E] my-2"></div>
                  {displayedUserDropdownLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => { 
                        setSidebarOpen(false); 
                        window.location.href = createPageUrl(link.url);
                      }}
                      className="w-full text-left text-[#B0B0B0] hover:text-white block px-3 py-2 text-base font-medium flex items-center space-x-2"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </button>
                  ))}
                   <button
                      onClick={() => { setSidebarOpen(false); handleLogout(); }}
                      className="w-full text-left text-red-400 hover:text-red-300 block px-3 py-2 text-base font-medium flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                </>
              )}
              
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                  <Input
                    type="text"
                    placeholder="Pesquisar..."
                    className="pl-10 pr-4 py-2 w-full bg-[#121212] border-[#2C2C3E] text-white placeholder-[#B0B0B0] focus:border-[#7B61FF] rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}


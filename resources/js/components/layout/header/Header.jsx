import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Globe,
  Sparkles
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, language, changeLanguage } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isSticky
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between h-20 px-4 md:px-8">
        {/* Left side - Mobile Toggle & Search Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="xl:hidden p-2.5 rounded-2xl bg-card border border-border/50 hover:bg-muted text-foreground transition-all shadow-sm active:scale-95"
          >
            <Menu size={22} />
          </button>
          
          <div className="hidden md:flex items-center gap-2 group cursor-pointer px-4 py-2 rounded-2xl bg-muted/40 border border-transparent hover:border-primary/20 hover:bg-muted/60 transition-all">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                {t('common.actions.search') || 'Search'}
            </span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outlinemuted" padding="sm" rounded="2xl" className="transition-all">
                <Globe size={18} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">{language}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border rounded-2xl p-1 shadow-xl">
              {['en', 'fr', 'ar'].map((lang) => (
                <DropdownMenuItem
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold cursor-pointer transition-colors ${language === lang ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
                >
                    <div className="flex items-center justify-between w-full">
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                        {language === lang && <Sparkles size={12} className="text-primary" />}
                    </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-card border border-border/50 hover:bg-muted text-foreground transition-all shadow-sm active:scale-95"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-primary" />}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-muted transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all font-black">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-start">
                  <p className="text-sm font-black text-foreground tracking-tight leading-none mb-1">{user?.name || 'User'}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground hidden lg:block group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-md border-border rounded-[24px] p-2 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-muted/40 rounded-xl mb-2">
                <DropdownMenuLabel className="p-0 text-sm font-black text-foreground tracking-tight">{t('header.myAccount') || 'My Account'}</DropdownMenuLabel>
                <p className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="rounded-lg py-2.5 cursor-pointer font-bold text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <User size={16} strokeWidth={2.5} className="mr-3 ml-1" />
                {t('header.profile')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50 my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg py-2.5 cursor-pointer font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} strokeWidth={2.5} className="mr-3 ml-1" />
                {t('header.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Header;

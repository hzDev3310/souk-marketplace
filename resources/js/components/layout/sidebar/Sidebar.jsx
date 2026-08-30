import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { imageFallback } from '@/utils/imageFallback';
import { useTranslation } from 'react-i18next';
import SidebarContent from './SidebarItems';
import * as Icons from 'lucide-react';

const renderSidebarItems = (items, currentPath, isDarkMode, userRole, t, isRTL = false, onClose = () => {}, user = null) => {
  const filteredItems = items.filter(item => {
    return !item.roles || item.roles.includes(userRole);
  });
  
  if (filteredItems.length === 0) return null;

  return filteredItems.map((item, index) => {
    const isSelected = currentPath === item?.url;
    const IconComponent = Icons[item.icon] || Icons.Circle;
    
    const translationKey = `sidebar.${item.name.charAt(0).toLowerCase()}${item.name.slice(1).replace(/\s+/g, '')}`;

    return (
      <div onClick={onClose} key={index} className="px-3">
        <Link
          to={item.url || '#'}
          className={`
            relative flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1
            transition-all duration-300 group
            ${isSelected
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-foreground hover:text-primary'
            }
            ${isRTL ? 'flex-row-reverse text-right' : ''}
          `}
        >
          <div className="relative z-10 flex items-center gap-3 w-full">
            <IconComponent 
                size={22} 
                className={`transition-all duration-300 ${isSelected ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'}`} 
                strokeWidth={isSelected ? 2.5 : 2}
            />
            <span className={`truncate flex-1 text-sm font-bold tracking-tight transition-colors ${isSelected ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'}`}>
                {t(translationKey)}
            </span>
            
            {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
            )}
          </div>
        </Link>
      </div>
    );
  });
};

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isDarkMode, language } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = user?.role || 'CLIENT';
  const isRTL = language === 'ar';

  return (
    <aside className={`fixed top-0 z-40 h-screen w-[280px] ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} bg-background transition-all duration-500 border-border/60`}>
      {/* Logo Section */}
      <div className="flex items-center h-24 px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500 bg-card flex items-center justify-center">
            <img src="/images/logo.png" alt="Souk AI" className="w-full h-full object-cover" onError={imageFallback} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground tracking-tighter">
                Souk AI
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest -mt-1 opacity-80">
                Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <ScrollArea className="h-[calc(100vh-96px)]">
        <div className="py-6">
          {SidebarContent.map((section, index) => {
            const hasVisibleChildren = section.children?.some(item => !item.roles || item.roles.includes(userRole));
            if (!hasVisibleChildren) return null;

            const sectionKey = `sidebar.${section.heading.toLowerCase().replace(/\s+/g, '')}`;

            return (
              <div key={index} className="mb-6">
                {section.heading && (
                  <h3 className={`px-8 text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-muted-foreground/60`}>
                    {t(sectionKey)}
                  </h3>
                )}
                <div className="space-y-1">
                  {renderSidebarItems(
                    section.children || [],
                    pathname,
                    isDarkMode,
                    userRole,
                    t,
                    isRTL,
                    onClose,
                    user
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
    </aside>
  );
};

export default Sidebar;

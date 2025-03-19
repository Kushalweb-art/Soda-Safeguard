
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Database,
  Home,
  CheckCircle,
  FileSpreadsheet,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/datasets', label: 'Datasets', icon: Database },
    { path: '/validation', label: 'Data Validation', icon: CheckCircle },
    { path: '/results', label: 'Results', icon: BarChart3 }
  ];
  
  return (
    <div
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-2', collapsed && 'hidden')}>
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">Soda Safeguard</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <Icon size={20} />
              <span className={cn('text-sm', collapsed && 'hidden')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center gap-3 px-2',
          collapsed && 'justify-center'
        )}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="text-sm font-medium">SS</span>
          </div>
          <div className={cn('flex flex-col', collapsed && 'hidden')}>
            <span className="text-sm font-medium">Soda Safeguard</span>
            <span className="text-xs text-muted-foreground">Data validation made simple</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

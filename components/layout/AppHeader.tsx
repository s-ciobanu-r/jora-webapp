'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  FileText, 
  Users, 
  LayoutDashboard,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useTranslation, languages, type Language } from '@/i18n/config';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: t('common.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/contracts/new',
      label: t('common.newContract'),
      icon: FileText,
    },
    {
      href: '/buyers',
      label: t('common.buyers'),
      icon: Users,
    },
  ];

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center px-4 sm:h-16">
          <span className="text-xl font-bold">Jora</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link 
              href={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">J</span>
              </div>
              <span className="text-xl font-bold">{t('common.appName')}</span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                >
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`cursor-pointer ${
                      language === code ? 'bg-primary/10 font-medium text-primary' : ''
                    }`}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu (Desktop) */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="hidden h-9 gap-2 rounded-lg px-2 sm:flex sm:px-3"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-semibold text-primary">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden font-medium lg:inline">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-l border-border bg-background p-4 shadow-xl">
            {/* User Info */}
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

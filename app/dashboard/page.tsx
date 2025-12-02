'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowRight,
  BarChart3,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/i18n/config';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/apiClient';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch last contract
  const { data: lastContract } = useQuery({
    queryKey: ['last-contract'],
    queryFn: api.contracts.getLast,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: t('dashboard.contractsToday'),
      value: '3',
      icon: Calendar,
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: t('dashboard.contractsThisWeek'),
      value: '12',
      icon: TrendingUp,
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: t('dashboard.contractsThisMonth'),
      value: '47',
      icon: BarChart3,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: t('dashboard.totalBuyers'),
      value: '234',
      icon: Users,
      change: '+12',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('dashboard.welcome')}, {user?.name || 'User'}!
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {new Date().toLocaleDateString('ro-RO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.title}
                </span>
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="text-2xl font-bold sm:text-3xl">{stat.value}</span>
                <p className={`mt-1 text-xs ${
                  stat.changeType === 'positive' 
                    ? 'text-green-500' 
                    : stat.changeType === 'negative' 
                    ? 'text-red-500' 
                    : 'text-muted-foreground'
                }`}>
                  {stat.change} {t('dashboard.fromLastPeriod')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* New Contract Card */}
        <div className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t('common.newContract')}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t('dashboard.startContractDesc')}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/contracts/new">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                {t('common.startNewContract')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Buyers Card */}
        <div className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">{t('common.buyers')}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t('dashboard.manageBuyersDesc')}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/buyers">
              <Button variant="outline" className="w-full gap-2">
                {t('buyers.buyersList')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Contract Card */}
        <div className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md sm:col-span-2 sm:p-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">{t('dashboard.recentContracts')}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t('dashboard.lastContractDesc')}
              </p>
            </div>
          </div>
          <div className="mt-4">
            {lastContract?.contract ? (
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold">
                    #{lastContract.contract.contract_number}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lastContract.contract.contract_date}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lastContract.contract.buyer_name}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.noRecentContracts')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <span className="text-lg">💡</span>
          {t('dashboard.quickStart')}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', text: t('dashboard.step1') },
            { step: '2', text: t('dashboard.step2') },
            { step: '3', text: t('dashboard.step3') },
            { step: '4', text: t('dashboard.step4') },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {item.step}
              </span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      changeType: 'positive',
    },
    {
      title: t('dashboard.contractsThisWeek'),
      value: '12',
      icon: TrendingUp,
      change: '+15%',
      changeType: 'positive',
    },
    {
      title: t('dashboard.contractsThisMonth'),
      value: '47',
      icon: BarChart3,
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: t('dashboard.totalBuyers'),
      value: '234',
      icon: Users,
      change: '+12',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome')}, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('ro-RO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={cn(
                  'text-xs',
                  stat.changeType === 'positive' && 'text-green-600',
                  stat.changeType === 'negative' && 'text-red-600',
                  stat.changeType === 'neutral' && 'text-muted-foreground'
                )}>
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('common.newContract')}
            </CardTitle>
            <CardDescription>
              Start creating a new vehicle sales contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/contracts/new">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {t('common.startNewContract')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('common.buyers')}
            </CardTitle>
            <CardDescription>
              Manage buyer database and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/buyers">
              <Button variant="outline" className="w-full">
                {t('buyers.buyersList')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('dashboard.recentContracts')}
            </CardTitle>
            <CardDescription>
              View and manage recent contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastContract?.contract ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">#{lastContract.contract.contract_number}</span>
                  {' - '}
                  <span className="text-muted-foreground">
                    {lastContract.contract.buyer_name}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastContract.contract.contract_date}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent contracts</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.help')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.helpText')}
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">1.</span>
              <span>Click "Contract nou" to start a new contract</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">2.</span>
              <span>Follow the chat flow to input contract details</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">3.</span>
              <span>Use OCR to scan documents or enter data manually</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">4.</span>
              <span>Review and confirm to generate the PDF contract</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

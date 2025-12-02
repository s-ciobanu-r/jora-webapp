'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  X,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '@/i18n/config';
import { useAuthStore } from '@/store/authStore';
import api, { Buyer } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { debounce } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

// Buyer form schema
const buyerSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  street: z.string().optional(),
  street_no: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  document_number: z.string().optional(),
  document_authority: z.string().optional(),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

export default function BuyersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
  });

  // Search buyers query
  const { data: buyers, isLoading } = useQuery({
    queryKey: ['buyers', searchTerm],
    queryFn: () => api.buyers.search(searchTerm),
    enabled: isAuthenticated,
  });

  // Debounced search
  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  // Create buyer mutation
  const createMutation = useMutation({
    mutationFn: api.buyers.create,
    onSuccess: () => {
      toast.success(t('buyers.buyerAdded'));
      setIsAddOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
    onError: (error) => {
      console.error('Create buyer error:', error);
      toast.error(t('common.error'));
    },
  });

  // Update buyer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BuyerFormData> }) =>
      api.buyers.update(id, data),
    onSuccess: () => {
      toast.success(t('buyers.buyerUpdated'));
      setEditingBuyer(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
    onError: (error) => {
      console.error('Update buyer error:', error);
      toast.error(t('common.error'));
    },
  });

  // Handle form submit
  const onSubmit = (data: BuyerFormData) => {
    // Clean up empty email
    if (data.email === '') {
      data.email = undefined;
    }
    
    if (editingBuyer) {
      updateMutation.mutate({ id: editingBuyer.id, data });
    } else {
      createMutation.mutate(data as Omit<Buyer, 'id' | 'created_at'>);
    }
  };

  // Open edit dialog
  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    Object.keys(buyer).forEach((key) => {
      if (key !== 'id' && key !== 'created_at') {
        setValue(key as keyof BuyerFormData, buyer[key as keyof Buyer] || '');
      }
    });
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsAddOpen(false);
    setEditingBuyer(null);
    reset();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('buyers.buyersList')}</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('buyers.addBuyer')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('buyers.searchBuyers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('buyers.searchBuyers')}
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Buyers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : buyers && buyers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('buyers.name')}</TableHead>
                  <TableHead>{t('buyers.city')}</TableHead>
                  <TableHead>{t('buyers.phone')}</TableHead>
                  <TableHead>{t('buyers.email')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {buyer.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {buyer.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {buyer.city}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {buyer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {buyer.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {buyer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {buyer.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(buyer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <User className="h-12 w-12 mb-4" />
              <p>{t('common.noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || !!editingBuyer} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBuyer ? t('buyers.editBuyer') : t('buyers.addBuyer')}
            </DialogTitle>
            <DialogDescription>
              {editingBuyer
                ? 'Update buyer information'
                : 'Add a new buyer to the database'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">{t('buyers.name')} *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">{t('buyers.street')}</Label>
                  <Input
                    id="street"
                    {...register('street')}
                    placeholder="Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="street_no">{t('buyers.streetNumber')}</Label>
                  <Input
                    id="street_no"
                    {...register('street_no')}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">{t('buyers.zipCode')}</Label>
                  <Input
                    id="zip"
                    {...register('zip')}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t('buyers.city')}</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Munich"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">{t('buyers.phone')}</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <Label htmlFor="email">{t('buyers.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_number">{t('buyers.documentNumber')}</Label>
                  <Input
                    id="document_number"
                    {...register('document_number')}
                    placeholder="AB123456"
                  />
                </div>
                <div>
                  <Label htmlFor="document_authority">{t('buyers.documentAuthority')}</Label>
                  <Input
                    id="document_authority"
                    {...register('document_authority')}
                    placeholder="City Hall"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

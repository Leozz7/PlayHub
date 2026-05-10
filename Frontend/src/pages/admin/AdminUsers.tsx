import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Users, Search, Filter, ShieldAlert, User as UserIcon, Edit2, 
  Mail, Lock, Info, Activity, ShieldCheck, MapPin, 
  MoreHorizontal, Trash2, Plus, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDeleteModal, StatusModal } from '@/components/ui/PremiumModal';


type UserDto = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: string;
  coutsId: string[];
  created: string;
};
 
export type CourtDto = {
  id: string;
  name: string;
  city: string;
  sport: string;
};



export default function AdminUsers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState<string>(searchParams.get('role') || 'all');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const pageSize = 10;
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedRole !== 'all') params.set('role', selectedRole);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [search, selectedRole, page, setSearchParams]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<string>('User');
  const [editCourts, setEditCourts] = useState<string[]>([]);
  const [courtSearch, setCourtSearch] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, status: 'loading' | 'success' | 'error', title: string, message?: string }>({
    isOpen: false,
    status: 'loading',
    title: '',
  });

  const { data: pagedUsers, isLoading: isLoadingUsers } = useQuery<{ items: UserDto[], totalCount: number, totalPages: number }>({
    queryKey: ['admin', 'users', search, selectedRole, page],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: {
          search: search || undefined,
          role: selectedRole === 'all' ? undefined : selectedRole,
          pageNumber: page,
          pageSize: pageSize
        }
      });
      return res.data;
    }
  });

  const users = pagedUsers?.items || [];

  const { data: courtsData } = useQuery<{ items: CourtDto[] }>({
    queryKey: ['admin', 'courts'],
    queryFn: async () => {
      const res = await api.get('/courts?pageSize=100');
      return res.data;
    }
  });

  const courts = courtsData?.items || [];

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: editId,
        name: editName,
        email: editEmail,
        phone: editPhone,
        cpf: editCpf,
        password: editPassword || undefined,
        role: editRole,
        coutsId: editRole === 'Manager' ? editCourts : [],
      };
      await api.put(`/users/${editId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('admin.users.toasts.updateSuccess'));
      setIsModalOpen(false);
    },
    onError: () => {
      setStatusModal({
        isOpen: true,
        status: 'error',
        title: t('admin.users.modals.errorTitle'),
        message: t('admin.users.modals.updateErrorMessage')
      });
      toast.error(t('admin.users.toasts.updateError'));
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        cpf: editCpf,
        password: editPassword,
        role: editRole,
      };
      const response = await api.post('/users', payload);
      if (editRole === 'Manager' && editCourts.length > 0) {
         const newUserId = response.data.id || response.data;
         const updatePayload = {
           id: newUserId,
           name: editName,
           email: editEmail,
           phone: editPhone,
           cpf: editCpf,
           role: editRole,
           coutsId: editCourts,
         };
         await api.put(`/users/${newUserId}`, updatePayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('admin.users.toasts.createSuccess'));
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      setStatusModal({
        isOpen: true,
        status: 'error',
        title: t('admin.users.modals.errorTitle'),
        message: error?.response?.data || t('admin.users.modals.createErrorMessage')
      });
      toast.error(error?.response?.data || t('admin.users.toasts.createError'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteModalOpen(false);
      setStatusModal({
        isOpen: true,
        status: 'success',
        title: t('admin.users.modals.deleteSuccessTitle'),
        message: t('admin.users.modals.deleteSuccessMessage')
      });
      toast.success(t('admin.users.toasts.deleteSuccess'));
    },
    onError: () => {
      setDeleteModalOpen(false);
      setStatusModal({
        isOpen: true,
        status: 'error',
        title: t('admin.users.modals.errorTitle'),
        message: t('admin.users.modals.deleteErrorMessage')
      });
      toast.error(t('admin.users.toasts.deleteError'));
    }
  });

  const filteredUsers = users;

  const handleCreateClick = () => {
    setModalMode('create');
    setEditId('');
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditCpf('');
    setEditPassword('');
    setEditRole('User');
    setEditCourts([]);
    setCourtSearch('');
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleEditClick = (user: UserDto) => {
    setModalMode('edit');
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditCpf(user.cpf || '');
    setEditPassword('');
    setEditRole(user.role);
    setEditCourts(user.coutsId || []);
    setCourtSearch('');
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  };

  const toggleCourt = (courtId: string) => {
    setEditCourts(prev => 
      prev.includes(courtId) ? prev.filter(id => id !== courtId) : [...prev, courtId]
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === 'Admin') return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> {t('admin.roles.admin')}</Badge>;
    if (role === 'Manager') return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {t('admin.roles.manager')}</Badge>;
    return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20 px-3 py-1.5"><UserIcon className="w-3.5 h-3.5 mr-1.5" /> {t('admin.roles.athlete')}</Badge>;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Users className="w-6 h-6" />
            </div>
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.users.subtitle')}</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-[#8CE600] text-gray-950 hover:opacity-90 font-black px-6 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('admin.users.newUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.users.stats.total'), value: pagedUsers?.totalCount || 0, icon: Users, color: 'text-blue-500' },
          { label: t('admin.users.stats.admins'), value: users.filter(u => u.role === 'Admin').length, icon: ShieldAlert, color: 'text-red-500' },
          { label: t('admin.users.stats.managers'), value: users.filter(u => u.role === 'Manager').length, icon: ShieldCheck, color: 'text-purple-500' },
          { label: t('admin.users.stats.athletes'), value: users.filter(u => u.role === 'User').length, icon: UserIcon, color: 'text-[#8CE600]' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-2xl bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('admin.users.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder={t('admin.users.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">{t('admin.users.allRoles')}</SelectItem>
                <SelectItem value="Admin">{t('admin.roles.admin')}</SelectItem>
                <SelectItem value="Manager">{t('admin.roles.manager')}</SelectItem>
                <SelectItem value="User">{t('admin.roles.athlete')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-gray-400">{t('admin.users.table.user')}</TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-gray-400">{t('admin.users.table.email')}</TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-gray-400">{t('admin.users.table.role')}</TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-gray-400">{t('admin.users.table.courts')}</TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-gray-400">{t('admin.users.table.joined')}</TableHead>
                <TableHead className="px-6 py-4 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-60 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="font-bold">{t('admin.users.noUsers')}</p>
                      <p className="text-sm">{t('admin.users.noUsersDesc')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.role === 'Admin' ? 'bg-red-500/10 text-red-500' :
                            u.role === 'Manager' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600]'
                          }`}>
                            {(u.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors">{u.name || t('admin.users.noName')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{u.email}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getRoleBadge(u.role)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {u.role === 'Manager' ? (
                          <Badge variant="outline" className="rounded-full border-gray-100 dark:border-white/10 text-[10px] font-bold">
                            {t('admin.users.table.courtsCount', { count: u.coutsId?.length || 0 })}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {new Date(u.created).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600]">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-xl shadow-xl">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('admin.users.table.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(u)} className="flex items-center gap-2 text-xs font-bold py-2.5 rounded-lg cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" /> {t('admin.users.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToDelete({ id: u.id, name: u.name });
                                setDeleteModalOpen(true);
                              }}
                              className="flex items-center gap-2 text-xs font-bold text-red-500 py-2.5 rounded-lg cursor-pointer hover:bg-red-500/10!"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> {t('admin.users.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {pagedUsers && pagedUsers.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {t('admin.users.pagination.showing', { count: users.length, total: pagedUsers.totalCount })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-xl border-gray-100 dark:border-white/10 font-bold text-xs"
              >
                {t('admin.users.pagination.previous')}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagedUsers.totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${page === i + 1 ? 'bg-[#8CE600] text-gray-950' : ''}`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(pagedUsers.totalPages, prev + 1))}
                disabled={page === pagedUsers.totalPages}
                className="rounded-xl border-gray-100 dark:border-white/10 font-bold text-xs"
              >
                {t('admin.users.pagination.next')}
              </Button>
            </div>
          </div>
        )}
      </div>


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <div className="flex h-full overflow-hidden">
            <div className="w-64 bg-gray-50 dark:bg-white/[0.02] border-r border-gray-100 dark:border-white/10 p-8 flex flex-col">
              <div className="mb-8">
                <div className="w-10 h-10 bg-[#8CE600]/10 text-[#8CE600] rounded-xl flex items-center justify-center mb-4">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight dark:text-white leading-none">
                  {modalMode === 'create' ? t('admin.users.modals.newUserTitle') : t('admin.users.modals.editUserTitle')}
                </h2>
                <p className="text-[10px] font-bold text-[#8CE600] uppercase tracking-[0.2em] mt-2">
                  {modalMode === 'create' ? t('admin.users.modals.registration') : t('admin.users.modals.adjustments')}
                </p>
              </div>

              <nav className="flex-1 space-y-2">
                {[
                  { id: 'general', label: t('admin.users.modals.infoTab'), icon: UserIcon },
                  { id: 'access', label: t('admin.users.modals.accessTab'), icon: ShieldCheck },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-[#8CE600] text-gray-950 shadow-md shadow-[#8CE600]/20' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-background rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.users.modals.security')}</p>
                    <p className="text-[11px] font-bold text-emerald-500 truncate">{t('admin.users.modals.protectedData')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-white dark:bg-background overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-10">
                  <AnimatePresence mode="wait">
                    {activeTab === 'general' && (
                      <motion.div 
                        key="general"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-8 bg-[#8CE600] rounded-full" />
                          <h3 className="text-xl font-bold">{t('admin.users.modals.personalData')}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.fullName')}</Label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="h-12 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50"
                                placeholder={t('admin.users.modals.fullNamePlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.emailAccess')}</Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                                className="h-12 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50"
                                placeholder={t('admin.users.modals.emailPlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.phoneOptional')}</Label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value)}
                                className="h-12 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50"
                                placeholder={t('admin.users.modals.phonePlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.cpfOptional')}</Label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={editCpf}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                  const formatted = val
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                  setEditCpf(formatted);
                                }}
                                className="h-12 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50"
                                placeholder={t('admin.users.modals.cpfPlaceholder')}
                                maxLength={14}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                              {t('admin.users.modals.passwordHint', { 
                                mode: modalMode === 'edit' ? t('admin.users.modals.passwordModeEdit') : t('admin.users.modals.passwordModeCreate') 
                              })}
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                type="password"
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                                className="h-12 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50"
                                placeholder={t('admin.users.modals.passwordPlaceholder')}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center gap-6 border border-gray-100 dark:border-white/5">
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-card flex items-center justify-center text-[#8CE600] shadow-sm">
                            <Info className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest mb-1 dark:text-white">{t('admin.users.modals.securityTip')}</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{t('admin.users.modals.securityTipDesc')}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'access' && (
                      <motion.div 
                        key="access"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-8 bg-blue-500 rounded-full" />
                          <h3 className="text-xl font-black">{t('admin.users.modals.roleOnPlatform')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.roleOnPlatform')}</Label>
                            <div className="grid grid-cols-1 gap-3">
                              {[
                                { value: 'User', label: t('admin.users.modals.roles.user'), icon: UserIcon, desc: t('admin.users.modals.roles.userDesc') },
                                { value: 'Manager', label: t('admin.users.modals.roles.manager'), icon: ShieldCheck, desc: t('admin.users.modals.roles.managerDesc') },
                                { value: 'Admin', label: t('admin.users.modals.roles.admin'), icon: ShieldAlert, desc: t('admin.users.modals.roles.adminDesc') },
                              ].map(role => (
                                <button
                                  key={role.value}
                                  onClick={() => setEditRole(role.value)}
                                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${
                                    editRole === role.value 
                                      ? 'bg-[#8CE600]/10 border-[#8CE600] shadow-lg shadow-[#8CE600]/5 scale-[1.02]' 
                                      : 'bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-gray-200'
                                  }`}
                                >
                                  <div className={`p-3 rounded-xl ${editRole === role.value ? 'bg-[#8CE600] text-gray-950' : 'bg-white dark:bg-card text-gray-400'}`}>
                                    <role.icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className={`text-sm font-black uppercase tracking-tight ${editRole === role.value ? 'text-gray-950 dark:text-[#8CE600]' : 'text-gray-900 dark:text-white'}`}>{role.label}</p>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{role.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {editRole === 'Manager' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('admin.users.modals.courtAssociation')}</Label>
                                <span className="text-[10px] font-black bg-[#8CE600] text-gray-950 px-3 py-1 rounded-full">{t('admin.users.modals.courtsSelected', { count: editCourts.length })}</span>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input 
                                    placeholder={t('admin.users.modals.searchCourts')} 
                                    value={courtSearch}
                                    onChange={e => setCourtSearch(e.target.value)}
                                    className="h-12 pl-12 bg-white dark:bg-card border-none rounded-xl text-sm font-bold"
                                  />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                  {courts
                                    .filter((c: CourtDto) => c.name.toLowerCase().includes(courtSearch.toLowerCase()) || c.city.toLowerCase().includes(courtSearch.toLowerCase()))
                                    .map((court: CourtDto) => (
                                    <label 
                                      key={court.id} 
                                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                                        editCourts.includes(court.id) 
                                          ? 'bg-white dark:bg-white/[0.05] border-[#8CE600] shadow-sm' 
                                          : 'bg-white/50 dark:bg-transparent border-transparent hover:bg-white dark:hover:bg-white/5'
                                      }`}
                                    >
                                      <Checkbox 
                                        checked={editCourts.includes(court.id)} 
                                        onCheckedChange={() => toggleCourt(court.id)} 
                                        className="w-5 h-5 data-[state=checked]:bg-[#8CE600] data-[state=checked]:border-[#8CE600] rounded-lg"
                                      />
                                      <div className="flex flex-col">
                                        <span className={`text-sm font-black ${editCourts.includes(court.id) ? 'text-[#8CE600]' : 'text-gray-900 dark:text-white'}`}>
                                          {court.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-2">
                                          <MapPin className="w-2.5 h-2.5" />
                                          {court.city} • {court.sport}
                                        </span>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="p-8 border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.01] flex items-center justify-between">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-widest px-8 h-12">{t('common.actions.cancel')}</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending || createMutation.isPending}
                  className="h-12 px-12 text-xs font-bold bg-[#8CE600] hover:bg-[#7bc900] text-gray-950 rounded-xl uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  {(updateMutation.isPending || createMutation.isPending) ? (
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> {t('common.actions.processing')}</span>
                  ) : modalMode === 'create' ? t('admin.users.modals.registerBtn') : t('admin.users.modals.saveBtn')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
        isLoading={deleteMutation.isPending}
        title={t('admin.users.modals.deleteConfirmTitle')}
        description={t('admin.users.modals.deleteConfirmDesc')}
        itemName={userToDelete?.name}
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}





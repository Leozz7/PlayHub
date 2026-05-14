import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import {
  FileText, Search, Filter, ShieldAlert, Activity, Monitor,
  Terminal, User, Clock, AlertCircle, ArrowDownToLine,
  RefreshCcw, Database, ShieldCheck, HeartPulse, ChevronLeft, ChevronRight,
  Eye, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type SystemLogDto = {
  id: string;
  level: number;
  message: string;
  exception?: string;
  source?: string;
  ipAddress?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
};

type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const LOG_LEVEL_MAP: Record<number, string> = {
  1: 'info',
  2: 'warning',
  3: 'error',
  4: 'critical'
};

export default function AdminLogs() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [selectedLog, setSelectedLog] = useState<SystemLogDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const pageSize = 15;

  // Sincroniza URL com estados locais
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [search, selectedType, page, setSearchParams]);

  const { data: pagedLogs, isLoading, isFetching, refetch } = useQuery<PagedResult<SystemLogDto>>({
    queryKey: ['admin', 'logs', search, selectedType, page],
    queryFn: async () => {
      const level = selectedType === 'all' ? undefined :
        selectedType === 'info' ? 1 :
          selectedType === 'warning' ? 2 :
            selectedType === 'error' ? 3 :
              selectedType === 'critical' ? 4 : undefined;

      const res = await api.get('/logs', {
        params: {
          search: search || undefined,
          level: level,
          pageNumber: page,
          pageSize: pageSize
        }
      });
      return res.data;
    }
  });

  const logs = pagedLogs?.items || [];

  const getTypeBadge = (level: number) => {
    const type = LOG_LEVEL_MAP[level] || 'info';
    switch (type) {
      case 'info': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><Activity className="w-3.5 h-3.5 mr-1.5" /> {t('admin.logs.levels.info')}</Badge>;
      case 'warning': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5"><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {t('admin.logs.levels.warning')}</Badge>;
      case 'error': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> {t('admin.logs.levels.error')}</Badge>;
      case 'critical': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-purple-600 text-white px-3 py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> {t('admin.logs.levels.critical')}</Badge>;
      default: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20 px-3 py-1.5">{t('admin.logs.levels.other')}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Terminal className="w-6 h-6" />
            </div>
            {t('admin.logs.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.logs.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-12 px-6 rounded-2xl font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${(isLoading || isFetching) ? 'animate-spin' : ''}`} /> {t('admin.logs.sync')}
          </Button>
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
            <ArrowDownToLine className="w-4 h-4 mr-2" /> {t('admin.logs.export')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600]">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.stats.health')}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{t('admin.logs.stats.healthy')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.stats.sink')}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">MongoDB Persistence</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.stats.audit')}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{t('admin.logs.stats.connected')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('admin.logs.searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-11 h-12 bg-white dark:bg-card border-none shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={(val) => {
              setSelectedType(val);
              setPage(1);
            }}>
              <SelectTrigger className="h-12 bg-white dark:bg-card shadow-sm border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder={t('admin.logs.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">{t('admin.logs.allLevels')}</SelectItem>
                <SelectItem value="info">{t('admin.logs.levels.info')}</SelectItem>
                <SelectItem value="warning">{t('admin.logs.levels.warning')}</SelectItem>
                <SelectItem value="error">{t('admin.logs.levels.error')}</SelectItem>
                <SelectItem value="critical">{t('admin.logs.levels.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.logs.table.timestamp')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.logs.table.message')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.logs.table.level')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.logs.table.identity')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">IP</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400 text-right">{t('admin.logs.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-12 w-full max-w-md rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-28 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-9 w-9 rounded-lg float-right" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="font-bold">{t('admin.logs.noLogs')}</p>
                      <p className="text-sm">{t('admin.logs.noLogsDesc')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium ml-5">
                            {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col max-w-md">
                          <span className="text-sm font-black text-gray-900 dark:text-white truncate">{log.message}</span>
                          {log.exception && (
                            <span className="text-[10px] font-mono text-red-400 line-clamp-1 bg-red-500/5 p-1 rounded mt-1">
                              {log.exception}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getTypeBadge(log.level)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {log.userName && log.userName !== 'anonymous' ? log.userName : 
                             (log.userId ? log.userId.substring(0, 8) + '...' : 'System')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {log.ipAddress || '0.0.0.0'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-all duration-300"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {pagedLogs && pagedLogs.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-white/[0.01]">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {t('admin.logs.pagination.showing', { count: logs.length, total: pagedLogs.totalCount })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-xl border-gray-100 dark:border-white/10 font-bold text-xs h-9"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('admin.logs.pagination.previous')}
              </Button>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                {Array.from({ length: Math.min(5, pagedLogs.totalPages) }).map((_, i) => {
                  // mostrar páginas próximas à atual
                  const pageNum = page <= 3 ? i + 1 : page + i - 2;
                  if (pageNum > pagedLogs.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${page === pageNum ? 'bg-[#8CE600] text-gray-950' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(pagedLogs.totalPages, prev + 1))}
                disabled={page === pagedLogs.totalPages}
                className="rounded-xl border-gray-100 dark:border-white/10 font-bold text-xs h-9"
              >
                {t('admin.logs.pagination.next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2rem] bg-white dark:bg-[#0A0A0A] shadow-2xl shadow-black/50">
          <div className="relative">
            {/* Header com gradiente baseado no nível */}
            <div className={`p-8 pb-12 ${selectedLog?.level === 4 ? 'bg-purple-600' :
                selectedLog?.level === 3 ? 'bg-red-500' :
                  selectedLog?.level === 2 ? 'bg-amber-500' :
                    'bg-blue-500'
              }`}>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                  {selectedLog ? LOG_LEVEL_MAP[selectedLog.level] : ''}
                </Badge>
                <div className="text-white/60 text-xs font-mono">
                  ID: {selectedLog?.id}
                </div>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {selectedLog?.message}
              </h2>
            </div>

            {/* Conteúdo */}
            <div className="p-8 -mt-6 bg-white dark:bg-[#0A0A0A] rounded-t-[2rem] relative z-10">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {t('admin.logs.table.timestamp')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedLog && new Date(selectedLog.createdAt).toLocaleString('pt-BR', {
                      dateStyle: 'full',
                      timeStyle: 'medium'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="w-3 h-3" /> {t('admin.logs.table.source')}
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-900 dark:text-white truncate">
                    {selectedLog?.source || 'System'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {t('admin.logs.table.identity')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedLog?.userName && selectedLog.userName !== 'anonymous' ? selectedLog.userName : 
                     (selectedLog?.userId || 'System')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Monitor className="w-3 h-3" /> IP Address
                  </p>
                  <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                    {selectedLog?.ipAddress || '0.0.0.0'}
                  </p>
                </div>
              </div>

              <Separator className="mb-6 bg-gray-100 dark:bg-white/5" />

              {selectedLog?.exception && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exception Trace
                  </p>
                  <ScrollArea className="h-[250px] w-full rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-4">
                    <pre className="text-[11px] font-mono text-red-400/80 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.exception}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="h-12 px-8 rounded-2xl font-black bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
                >
                  Fechar Detalhes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


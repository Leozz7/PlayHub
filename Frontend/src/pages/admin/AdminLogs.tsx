import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Search, Filter, ShieldAlert, Activity, Monitor, 
  Terminal, User, Clock, CheckCircle2, AlertCircle, Trash2, ArrowDownToLine,
  RefreshCcw, Database, ShieldCheck, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const MOCK_LOGS = [
  { id: 'LOG-001', type: 'info', action: 'HTTP GET /api/courts', user: 'admin@playhub.com', date: new Date().toISOString(), ip: '192.168.1.45', details: 'Query: { "city": "São Paulo" } - 200 OK (45ms)' },
  { id: 'LOG-002', type: 'warning', action: 'Fail-Fast Validation', user: 'desconhecido', date: new Date(Date.now() - 3600000).toISOString(), ip: '45.22.19.100', details: 'Password complexity failed - Request blocked before hashing' },
  { id: 'LOG-003', type: 'error', action: 'Database Connection', user: 'system', date: new Date(Date.now() - 7200000).toISOString(), ip: '127.0.0.1', details: 'MongoDB replicaset timeout - Automatic retry initiated' },
  { id: 'LOG-004', type: 'success', action: 'Price Calculated', user: 'maria.souza@email.com', date: new Date(Date.now() - 86400000).toISOString(), ip: '177.50.30.1', details: 'Server-side price calculation for Reservation #RES-998' },
  { id: 'LOG-005', type: 'info', action: 'Serilog Initialized', user: 'system', date: new Date(Date.now() - 172800000).toISOString(), ip: '127.0.0.1', details: 'Structured logging sink: logs/playhub-2024.log' },
];

export default function AdminLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const search = searchParams.get('search') || '';
  const selectedType = searchParams.get('type') || 'all';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'info': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><Activity className="w-3.5 h-3.5 mr-1.5" /> Info</Badge>;
      case 'success': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20 px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Sucesso</Badge>;
      case 'warning': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5"><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Alerta</Badge>;
      case 'error': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Erro</Badge>;
      default: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20 px-3 py-1.5">Outro</Badge>;
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
            Logs do Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Auditoria estruturada com Serilog & Observabilidade RFC 7807.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            className="h-12 px-6 rounded-2xl font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Sincronizar
          </Button>
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600]">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Health Check</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">Saudável</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Log Sink</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">MongoDB / File</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Segurança</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">Padrão RFC 7807</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por evento, detalhes ou usuário..."
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-card border-none shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={(val) => updateFilters('type', val)}>
              <SelectTrigger className="h-12 bg-white dark:bg-card shadow-sm border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Tipo de Log" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">Todos os Logs</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Alerta</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Timestamp</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Evento Estruturado</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Nível</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Identidade</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Network IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="font-bold">Nenhum log encontrado</p>
                      <p className="text-sm">Os sinks do Serilog não retornaram resultados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredLogs.map((log) => (
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
                            {new Date(log.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium ml-5">
                            {new Date(log.date).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col max-w-md">
                          <span className="text-sm font-black text-gray-900 dark:text-white truncate">{log.action}</span>
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg mt-1">
                            {log.details}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getTypeBadge(log.type)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">
                            {log.ip}
                          </span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


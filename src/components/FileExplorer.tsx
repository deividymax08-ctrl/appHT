import React from 'react';
import { 
  Folder, 
  FileJson, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Clock, 
  Database,
  User,
  FileText,
  Zap,
  Package,
  ClipboardCheck,
  BarChart3,
  HardDrive
} from 'lucide-react';
import { db } from '../db';
import { HistoryEntry } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type FolderType = 'client' | 'budget' | 'service' | 'material' | 'package' | 'order' | 'report';

interface FolderConfig {
  id: FolderType;
  name: string;
  icon: any;
  color: string;
}

const FOLDERS: FolderConfig[] = [
  { id: 'client', name: 'Clientes', icon: User, color: 'text-blue-500' },
  { id: 'budget', name: 'Orçamentos', icon: FileText, color: 'text-amber-500' },
  { id: 'service', name: 'Serviços', icon: Zap, color: 'text-red-500' },
  { id: 'material', name: 'Materiais', icon: Package, color: 'text-emerald-500' },
  { id: 'package', name: 'Pacotes', icon: Database, color: 'text-purple-500' },
  { id: 'order', name: 'Ordens de Serviço', icon: ClipboardCheck, color: 'text-indigo-500' },
  { id: 'report', name: 'Relatórios', icon: BarChart3, color: 'text-pink-500' },
];

export function FileExplorer() {
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<HistoryEntry | null>(null);

  React.useEffect(() => {
    setHistory(db.getHistory());
  }, []);

  const toggleFolder = (folderId: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(folderId)) newSet.delete(folderId);
    else newSet.add(folderId);
    setExpandedFolders(newSet);
  };

  const getEntriesForFolder = (folderId: FolderType) => {
    return history.filter(h => h.entityType === folderId && 
      h.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Central de Arquivos</h2>
          <p className="text-zinc-400">Histórico completo de todas as alterações e salvamentos do sistema.</p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-2xl text-zinc-500">
          <HardDrive size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Explorer Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="Buscar nos arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-2 space-y-1">
              {FOLDERS.map((folder) => {
                const isExpanded = expandedFolders.has(folder.id);
                const entries = getEntriesForFolder(folder.id);
                
                return (
                  <div key={folder.id} className="space-y-1">
                    <button 
                      onClick={() => toggleFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg transition-colors group",
                        isExpanded ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      )}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Folder size={18} className={cn("shrink-0", folder.color)} />
                      <span className="text-sm font-medium flex-1 text-left">{folder.name}</span>
                      <span className="text-[10px] font-bold bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 group-hover:text-zinc-400">
                        {entries.length}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-6 space-y-1"
                        >
                          {entries.map((entry) => (
                            <button 
                              key={entry.id}
                              onClick={() => setSelectedFile(entry)}
                              className={cn(
                                "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                                selectedFile?.id === entry.id ? "bg-red-600/10 text-red-500" : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
                              )}
                            >
                              <FileJson size={14} className="shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{entry.entityName}</p>
                                <p className="text-[10px] opacity-60">{formatDate(entry.timestamp)}</p>
                              </div>
                              <span className={cn(
                                "text-[8px] uppercase font-black px-1 rounded",
                                entry.action === 'create' ? "bg-emerald-500/10 text-emerald-500" :
                                entry.action === 'update' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
                              )}>
                                {entry.action === 'create' ? 'Novo' : entry.action === 'update' ? 'Edit' : 'Del'}
                              </span>
                            </button>
                          ))}
                          {entries.length === 0 && (
                            <p className="text-[10px] text-zinc-600 italic p-2">Pasta vazia</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Viewer Column */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px]"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-900 rounded-xl">
                    <FileJson size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedFile.entityName}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Clock size={12} />
                      Salvo em {formatDate(selectedFile.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    selectedFile.action === 'create' ? "bg-emerald-500/10 text-emerald-500" :
                    selectedFile.action === 'update' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {selectedFile.action === 'create' ? 'Criação' : selectedFile.action === 'update' ? 'Atualização' : 'Exclusão'}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-auto font-mono text-sm">
                <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800/50">
                  <pre className="text-emerald-500/90 whitespace-pre-wrap">
                    {JSON.stringify(selectedFile.data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-between items-center">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">ID do Arquivo: {selectedFile.id}</p>
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(selectedFile.data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedFile.entityName.replace(/\s+/g, '_')}_${selectedFile.timestamp}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Baixar JSON
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
              <div className="p-6 bg-zinc-900 rounded-full text-zinc-700 mb-4">
                <FileJson size={48} />
              </div>
              <h3 className="text-xl font-bold text-zinc-400">Selecione um arquivo</h3>
              <p className="text-zinc-600 max-w-xs mt-2">Navegue pelas pastas ao lado para visualizar os dados salvos e o histórico de alterações.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

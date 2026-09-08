import { useState, useMemo } from 'react';
import { useMessages } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatDateTime } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import type { Message, MessageStatus } from '../../types';
import { Search, Mail, Phone, Eye, Trash2, MailOpen, Archive } from 'lucide-react';

const statusOptions: MessageStatus[] = ['new', 'read', 'replied', 'archived'];

export function AdminMessages() {
  const { messages, loading, refetch } = useMessages();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Message | null>(null);

  const filtered = useMemo(() => {
    let result = [...messages];
    if (statusFilter !== 'all') result = result.filter(m => m.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    return result;
  }, [messages, search, statusFilter]);

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (msg.status === 'new') {
      await supabase.from('messages').update({ status: 'read' }).eq('id', msg.id);
      refetch();
    }
  };

  const updateStatus = async (id: string, status: MessageStatus) => {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (error) show('Failed to update', 'error'); else { show('Status updated', 'success'); refetch(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) show('Failed to delete', 'error'); else { show('Deleted', 'success'); setSelected(null); refetch(); }
  };

  const newCount = messages.filter(m => m.status === 'new').length;

  return (
    <AdminLayout title="Messages">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="md:w-44">
          <option value="all">All Messages</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </div>

      {newCount > 0 && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800 font-medium">{newCount} new message(s) awaiting response</span>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(msg => (
              <div
                key={msg.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${msg.status === 'new' ? 'bg-amber-50/50' : ''}`}
                onClick={() => openMessage(msg)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.status === 'new' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{msg.name}</p>
                    {msg.status === 'new' && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{msg.subject}: {msg.message}</p>
                </div>
                <div className="hidden md:block flex-shrink-0">
                  <StatusBadge status={msg.status} />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 hidden lg:block">{formatDateTime(msg.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Message Details">
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{selected.subject}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{selected.name}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {selected.email}</span>
                {selected.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {selected.phone}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(selected.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}>
                <Button size="sm">
                  <MailOpen className="h-4 w-4 mr-1" /> Reply
                </Button>
              </a>
              <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'replied')}>Mark Replied</Button>
              <Button size="sm" variant="ghost" onClick={() => updateStatus(selected.id, 'archived')}>
                <Archive className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => handleDelete(selected.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

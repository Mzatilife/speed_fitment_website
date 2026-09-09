import { useState, useMemo } from 'react';
import { useProfiles } from '../../lib/hooks';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatDate } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select, Input } from '../../components/ui/Input';
import { DataTableToolbar, SortableHeader, useTableSort } from '../../components/ui/DataTable';
import type { Profile, UserRole } from '../../types';
import { User, Pencil, Trash2, ShieldCheck, UserPlus } from 'lucide-react';

export function AdminUsers() {
  const { profiles, loading, refetch } = useProfiles();
  const { profile: currentUser } = useAuth();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('customer');
  const [saving, setSaving] = useState(false);

  // Create user state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'customer' as UserRole });
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    let result = [...profiles];
    if (roleFilter !== 'all') result = result.filter(p => p.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.full_name.toLowerCase().includes(q) || (p.phone || '').includes(search));
    }
    return result;
  }, [profiles, search, roleFilter]);
  const { sortedRows, sort, toggleSort } = useTableSort(filtered, (profile, key) => {
    if (key === 'user') return profile.full_name ?? '';
    if (key === 'phone') return profile.phone ?? '';
    if (key === 'joined') return profile.created_at;
    return profile.role;
  }, 'joined');

  const openEdit = (p: Profile) => {
    setEditing(p);
    setEditName(p.full_name);
    setEditPhone(p.phone || '');
    setEditRole(p.role);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName, phone: editPhone, role: editRole })
      .eq('id', editing.id);
    setSaving(false);
    if (error) { show('Failed to update user', 'error'); return; }
    show('User updated', 'success');
    setEditing(null); refetch();
  };

  const handleCreate = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      show('Name, email, and password are required', 'error');
      return;
    }
    setCreating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
          phone: createForm.phone,
          role: createForm.role,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        show(result.error || 'Failed to create user', 'error');
      } else {
        show(`${createForm.role.charAt(0).toUpperCase() + createForm.role.slice(1)} account created for ${createForm.full_name}`, 'success');
        setShowCreate(false);
        setCreateForm({ full_name: '', email: '', phone: '', password: '', role: 'customer' });
        refetch();
      }
    } catch {
      show('Network error creating user', 'error');
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) { show('You cannot delete your own account', 'error'); return; }
    if (!confirm('Remove this user? This will sign them out permanently.')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) show('Failed to remove user', 'error'); else { show('User removed', 'success'); refetch(); }
  };

  const roleColors: Record<UserRole, 'amber' | 'blue' | 'gray'> = {
    admin: 'amber', cashier: 'blue', customer: 'gray',
  };

  const stats = {
    admins: profiles.filter(p => p.role === 'admin').length,
    cashiers: profiles.filter(p => p.role === 'cashier').length,
    customers: profiles.filter(p => p.role === 'customer').length,
  };

  return (
    <AdminLayout title="Staff & Users">
      {/* Role Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-600">{stats.admins}</p>
          <p className="text-xs text-gray-500">Administrators</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-600">{stats.cashiers}</p>
          <p className="text-xs text-gray-500">Cashiers</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-gray-600">{stats.customers}</p>
          <p className="text-xs text-gray-500">Customers</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1"><DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search users by name or phone..." resultCount={sortedRows.length} onClear={() => { setSearch(''); setRoleFilter('all'); }} filter={<Select aria-label="Filter users by role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full md:w-44">
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="cashier">Cashiers</option>
          <option value="customer">Customers</option>
        </Select>} /></div>
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          Add User
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <SortableHeader label="User" column="user" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Phone" column="phone" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Role" column="role" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Joined" column="joined" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden lg:table-cell" />
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRows.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                          {p.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.full_name || 'Unnamed'}</p>
                          {p.id === currentUser?.id && <span className="text-xs text-amber-600">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge color={roleColors[p.role]}>
                        {p.role === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                        {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" iconOnly aria-label={`Edit ${p.full_name || 'user'}`} title="Edit user" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {p.id !== currentUser?.id && (
                          <Button size="sm" variant="ghost" iconOnly aria-label={`Delete ${p.full_name || 'user'}`} title="Delete user" onClick={() => handleDelete(p.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {sortedRows.map(p => (
              <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {p.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{p.full_name || 'Unnamed'}</p>
                      {p.id === currentUser?.id && <span className="text-xs text-amber-600">You</span>}
                    </div>
                    <p className="text-xs text-gray-500">{p.phone || '—'}</p>
                  </div>
                  <Badge color={roleColors[p.role]}>
                    {p.role === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                    {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Joined {formatDate(p.created_at)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" iconOnly aria-label={`Edit ${p.full_name || 'user'}`} title="Edit user" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {p.id !== currentUser?.id && (
                      <Button size="sm" variant="ghost" iconOnly aria-label={`Delete ${p.full_name || 'user'}`} title="Delete user" onClick={() => handleDelete(p.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Create a new staff or customer account. The user will be able to sign in with the credentials below.</p>
          <Input label="Full Name *" value={createForm.full_name} onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="John Doe" />
          <Input label="Email *" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="john@example.com" />
          <Input label="Phone" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="(+265) 000-0000" />
          <Input label="Password *" type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="At least 6 characters" />
          <Select label="Role" value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value as UserRole })}>
            <option value="customer">Customer</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Administrator</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={creating} className="flex-1">Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User" size="sm">
        {editing && (
          <div className="space-y-4">
            <Input label="Full Name" value={editName} onChange={e => setEditName(e.target.value)} />
            <Input label="Phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            <Select label="Role" value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}>
              <option value="customer">Customer</option>
              <option value="cashier">Cashier</option>
              <option value="admin">Administrator</option>
            </Select>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Member, MemberStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate, getExpiryStatus } from '@/lib/formatting/dates';
import { formatINR } from '@/lib/formatting/currency';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  X,
} from 'lucide-react';

export const Members: React.FC = () => {
  const { currentGym } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Form State for new member
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newDob, setNewDob] = useState('1998-01-01');
  const [newAddress, setNewAddress] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');

  // Bulk CSV state
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  const members = gymStore.getMembers(currentGym.id);
  const plans = gymStore.getPlans(currentGym.id);

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone) return;

    gymStore.createMember(
      currentGym.id,
      {
        full_name: newFullName,
        phone: newPhone.startsWith('+91') ? newPhone : `+91 ${newPhone}`,
        email: newEmail || undefined,
        gender: newGender,
        date_of_birth: newDob,
        address: newAddress,
        emergency_contact_name: newEmergencyName,
        emergency_contact_phone: newEmergencyPhone,
        joining_date: new Date().toISOString().split('T')[0],
      },
      newPlanId || plans[0]?.id
    );

    setIsAddModalOpen(false);
    // Reset form
    setNewFullName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
  };

  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) return;
    const lines = bulkCsvText.trim().split('\n');
    let imported = 0;

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        gymStore.createMember(
          currentGym.id,
          {
            full_name: parts[0],
            phone: parts[1].startsWith('+91') ? parts[1] : `+91 ${parts[1]}`,
            email: parts[2] || undefined,
            gender: parts[3] || 'Male',
            joining_date: new Date().toISOString().split('T')[0],
          },
          plans[0]?.id
        );
        imported++;
      }
    });

    setBulkMessage(`Successfully validated and imported ${imported} members into ${currentGym.name}!`);
    setTimeout(() => {
      setIsBulkModalOpen(false);
      setBulkCsvText('');
      setBulkMessage('');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Member Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Total {members.length} registered members • Live biometric, subscription & contact profiles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => setIsBulkModalOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" />
            Bulk CSV Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Member Code, Name, or Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D1322] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'expiring', 'expired', 'frozen'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors select-none whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {status} ({status === 'all' ? members.length : members.filter((m) => m.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19] border-b border-white/10 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No members found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const sub = member.current_subscription;
                  const expiry = sub ? getExpiryStatus(sub.end_date) : null;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                    >
                      {/* Name & Code */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{member.full_name}</p>
                          <p className="text-[10px] font-mono text-emerald-400">{member.member_code}</p>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-200">{member.phone}</p>
                        <p className="text-[10px] text-slate-500">{member.email || '-'}</p>
                      </td>

                      {/* Active Plan */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-200">{sub?.plan?.name || 'No Plan Active'}</p>
                        <p className="text-[10px] text-slate-500">Joined: {formatDate(member.joining_date)}</p>
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4">
                        {sub ? (
                          <div>
                            <p className="font-mono">{formatDate(sub.end_date)}</p>
                            <p className="text-[10px] text-amber-400">{expiry?.label}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            member.status === 'active'
                              ? 'active'
                              : member.status === 'expiring'
                              ? 'expiring'
                              : member.status === 'expired'
                              ? 'expired'
                              : 'neutral'
                          }
                        >
                          {member.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                          }}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border-l border-white/10 h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-base flex items-center justify-center">
                  {selectedMember.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedMember.full_name}</h3>
                  <p className="text-xs font-mono text-emerald-400">{selectedMember.member_code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Contact Details</span>
                <div className="mt-1 space-y-1">
                  <p className="text-slate-200 font-mono">Mobile: {selectedMember.phone}</p>
                  <p className="text-slate-200">Email: {selectedMember.email || 'None'}</p>
                  <p className="text-slate-200">Address: {selectedMember.address || 'None'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Emergency Contact</span>
                <div className="mt-1 space-y-1">
                  <p className="text-slate-200">{selectedMember.emergency_contact_name || 'None'}</p>
                  <p className="text-slate-200 font-mono">{selectedMember.emergency_contact_phone || 'None'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Medical / Fitness Notes</span>
                <p className="mt-1 text-slate-300 bg-[#090D16] p-2.5 rounded border border-white/5">
                  {selectedMember.medical_conditions || 'No health conditions declared. Approved for all training.'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Subscription Validity</span>
                <div className="mt-1 p-3 bg-[#090D16] rounded border border-white/5 space-y-1">
                  <p className="font-semibold text-slate-100">{selectedMember.current_subscription?.plan?.name || 'No active plan'}</p>
                  {selectedMember.current_subscription && (
                    <p className="text-slate-400">
                      Valid: {formatDate(selectedMember.current_subscription.start_date)} to {formatDate(selectedMember.current_subscription.end_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const newStatus: MemberStatus = selectedMember.status === 'active' ? 'frozen' : 'active';
                  gymStore.updateMember(selectedMember.id, { status: newStatus });
                  setSelectedMember({ ...selectedMember, status: newStatus });
                }}
              >
                {selectedMember.status === 'active' ? 'Freeze Member' : 'Activate Member'}
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={() => setSelectedMember(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Gym Member"
        description="Add a new member to the facility and assign initial membership plan."
      >
        <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
          <Input
            label="Full Name *"
            placeholder="e.g. Vikram Sharma"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Indian Mobile Number *"
              placeholder="98200 12345"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="vikram@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                className="w-full bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Membership Plan</label>
            <select
              value={newPlanId}
              onChange={(e) => setNewPlanId(e.target.value)}
              className="w-full bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-100"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatINR(p.price, false)} ({p.duration_days} days)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emergency Contact Person"
              placeholder="e.g. Brother / Parent"
              value={newEmergencyName}
              onChange={(e) => setNewEmergencyName(e.target.value)}
            />
            <Input
              label="Emergency Contact Phone"
              placeholder="98200 99881"
              value={newEmergencyPhone}
              onChange={(e) => setNewEmergencyPhone(e.target.value)}
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="Flat, Building, Street, City"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Member
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Bulk CSV Modal */}
      <Dialog
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Member CSV Importer"
        description="Paste comma-separated member records in format: Full Name, Phone, Email, Gender"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-400">
            Example:<br />
            <span className="font-mono text-emerald-400">Ravi Shankar, 9811234567, ravi@gmail.com, Male</span><br />
            <span className="font-mono text-emerald-400">Pooja Hegde, 9876543210, pooja@outlook.com, Female</span>
          </p>

          <textarea
            rows={5}
            value={bulkCsvText}
            onChange={(e) => setBulkCsvText(e.target.value)}
            placeholder="Paste CSV lines here..."
            className="w-full bg-[#0D1322] border border-white/10 rounded-md p-3 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />

          {bulkMessage && (
            <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
              {bulkMessage}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleBulkImport}>
              Validate & Import
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

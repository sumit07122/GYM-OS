import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Lead, LeadStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatting/dates';
import {
  UserCheck,
  PlusCircle,
  Phone,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const Leads: React.FC = () => {
  const { currentGym } = useTenant();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const leads = gymStore.getLeads(currentGym.id);

  const stages: { key: LeadStatus; label: string; color: string }[] = [
    { key: 'new', label: 'New Inquiries', color: 'border-blue-500/30 bg-blue-500/10' },
    { key: 'contacted', label: 'Contacted', color: 'border-indigo-500/30 bg-indigo-500/10' },
    { key: 'trial_scheduled', label: 'Trial Scheduled', color: 'border-amber-500/30 bg-amber-500/10' },
    { key: 'trial_attended', label: 'Trial Attended', color: 'border-purple-500/30 bg-purple-500/10' },
    { key: 'converted', label: 'Converted to Member', color: 'border-emerald-500/30 bg-emerald-500/10' },
  ];

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    gymStore.createLead(currentGym.id, {
      full_name: fullName,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      email: email || undefined,
      source,
      status: 'new',
      follow_up_date: followUpDate,
      notes,
    });

    setIsAddModalOpen(false);
    // Reset Form
    setFullName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const handleMoveStage = (leadId: string, currentStatus: LeadStatus) => {
    const order: LeadStatus[] = ['new', 'contacted', 'trial_scheduled', 'trial_attended', 'converted'];
    const idx = order.indexOf(currentStatus);
    if (idx < order.length - 1) {
      gymStore.updateLeadStatus(leadId, order[idx + 1]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Leads & Inquiries CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track prospective member inquiries, schedule trials, and maximize gym conversion rates
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Capture New Lead
        </Button>
      </div>

      {/* Visual Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);

          return (
            <div key={stage.key} className="bg-[#111827] border border-white/10 rounded-xl p-3 flex flex-col h-[70vh]">
              {/* Stage Header */}
              <div className={`p-2.5 rounded-lg border flex items-center justify-between mb-3 ${stage.color}`}>
                <span className="text-xs font-bold text-white uppercase tracking-wider">{stage.label}</span>
                <span className="text-xs font-mono font-bold text-slate-300">{stageLeads.length}</span>
              </div>

              {/* Lead Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-500 border border-dashed border-white/5 rounded-lg">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-[#0B0F19] border border-white/10 rounded-lg hover:border-emerald-500/40 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">{lead.full_name}</span>
                        <Badge variant="neutral" className="text-[9px]">
                          {lead.source}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{lead.phone}</span>
                      </div>

                      {lead.follow_up_date && (
                        <div className="flex items-center gap-1.5 text-amber-400 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          <span>Follow-up: {formatDate(lead.follow_up_date)}</span>
                        </div>
                      )}

                      {lead.notes && (
                        <p className="text-[10px] text-slate-400 italic line-clamp-2 bg-[#090D16] p-1.5 rounded">
                          "{lead.notes}"
                        </p>
                      )}

                      {stage.key !== 'converted' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveStage(lead.id, lead.status)}
                          className="w-full text-[11px] py-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Advance Stage <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Capture Lead Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Capture New Prospective Lead"
        description="Log an inquiry from walk-in, social media, or phone."
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <Input
            label="Prospect Full Name *"
            placeholder="e.g. Siddharth Malhotra"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mobile Number *"
              placeholder="98200 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="sid@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-100"
              >
                <option value="Walk-in">Walk-in Inquiry</option>
                <option value="Instagram Ad">Instagram Ad / DM</option>
                <option value="Referral">Member Referral</option>
                <option value="Google Maps">Google Maps / Search</option>
                <option value="Website">Website Form</option>
              </select>
            </div>

            <Input
              label="Scheduled Follow-up Date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <Input
            label="Inquiry Remarks & Fitness Goal"
            placeholder="e.g. Interested in fat loss and evening weight training."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Capture Lead
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

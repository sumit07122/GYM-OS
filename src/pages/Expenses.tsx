import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { MetricCard } from '@/components/shared/MetricCard';
import { formatINR } from '@/lib/formatting/currency';
import { formatDate } from '@/lib/formatting/dates';
import { PaymentMethod } from '@/types';
import {
  TrendingUp,
  PlusCircle,
  Building,
  Zap,
  Wrench,
  DollarSign,
} from 'lucide-react';

export const Expenses: React.FC = () => {
  const { currentGym } = useTenant();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const expenses = gymStore.getExpenses(currentGym.id);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    gymStore.recordExpense(currentGym.id, {
      category,
      amount: amountNum,
      payment_method: paymentMethod,
      date: expenseDate,
      vendor_name: vendorName,
      notes,
    });

    setIsAddModalOpen(false);
    // Reset Form
    setAmount('');
    setVendorName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Operational Expenses Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track rent, utility bills, maintenance charges, and operational outflows
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Record New Expense
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Outflows (MTD)"
          value={formatINR(totalExpenses, false)}
          subValue="All active expenses"
          icon={DollarSign}
          iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
        />
        <MetricCard
          label="Premises Rent"
          value={formatINR(expenses.filter(e => e.category === 'Rent').reduce((a, b) => a + b.amount, 0), false)}
          subValue="Facility lease cost"
          icon={Building}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <MetricCard
          label="Utilities & Power"
          value={formatINR(expenses.filter(e => e.category === 'Electricity').reduce((a, b) => a + b.amount, 0), false)}
          subValue="AC and electricity load"
          icon={Zap}
          iconColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
        />
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-sm font-bold">Chronological Expenditures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F19] border-b border-white/10 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor / Payee</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-slate-400">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{exp.category}</td>
                      <td className="py-3 px-4 text-slate-300">{exp.vendor_name || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" className="uppercase text-[9px]">
                          {exp.payment_method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px] max-w-xs truncate">
                        {exp.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                        {formatINR(exp.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Record Expense Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Operational Expense"
        description="Log an operational expenditure into the gym's financial ledger."
      >
        <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-100"
              >
                <option value="Rent">Facility Rent</option>
                <option value="Electricity">Electricity & Utilities</option>
                <option value="Maintenance">Equipment Maintenance</option>
                <option value="Salaries">Staff Salaries</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <Input
              label="Amount (INR) *"
              type="number"
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 text-xs text-slate-100"
              >
                <option value="bank_transfer">Net Banking / NEFT</option>
                <option value="upi">UPI (GPay / PhonePe)</option>
                <option value="cash">Cash Outflow</option>
                <option value="card">Company Debit Card</option>
              </select>
            </div>

            <Input
              label="Expense Date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          <Input
            label="Vendor / Recipient Name"
            placeholder="e.g. Adani Electricity / Landlord"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />

          <Input
            label="Remarks / Notes"
            placeholder="e.g. October month utility bill"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Expense
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

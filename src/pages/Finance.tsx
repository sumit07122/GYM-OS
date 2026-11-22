import React, { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { gymosRepository } from '@/lib/supabase/repository';
import { Payment, PaymentMethod, PaymentType, Expense, Member } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { MetricCard } from '@/components/shared/MetricCard';
import { formatINR, calculateGST } from '@/lib/formatting/currency';
import { formatDateTime, formatDate } from '@/lib/formatting/dates';
import { generateWhatsAppReceiptUrl, generateWhatsAppReminderUrl } from '@/lib/communications/whatsapp';
import {
  Receipt,
  CreditCard,
  PlusCircle,
  FileText,
  Printer,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  MessageCircle,
  X,
} from 'lucide-react';

export const Finance: React.FC = () => {
  const { currentGym, settings } = useTenant();
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Form State
  const [memberId, setMemberId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentType, setPaymentType] = useState<PaymentType>('membership_fee');
  const [balanceDue, setBalanceDue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [members, setMembers] = useState<Member[]>(() => gymStore.getMembers(currentGym.id));
  const [payments, setPayments] = useState<Payment[]>(() => gymStore.getPayments(currentGym.id));
  const [expenses, setExpenses] = useState<Expense[]>(() => gymStore.getExpenses(currentGym.id));

  useEffect(() => {
    gymosRepository.getMembers(currentGym.id).then((data) => {
      if (data && data.length > 0) setMembers(data);
    });
    gymosRepository.getPayments(currentGym.id).then((data) => {
      if (data && data.length > 0) setPayments(data);
    });
    gymosRepository.getExpenses(currentGym.id).then((data) => {
      if (data && data.length > 0) setExpenses(data);
    });
  }, [currentGym.id]);

  // Aggregates
  const totalCollections = payments.reduce((acc, p) => acc + p.amount_paid, 0);
  const totalTax = payments.reduce((acc, p) => acc + p.tax_amount, 0);
  const totalDues = payments.reduce((acc, p) => acc + p.balance_due, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netMargin = totalCollections - totalExpenses;

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const paidNum = parseFloat(amountPaid);
    if (!memberId || isNaN(paidNum) || paidNum <= 0) return;

    const dueNum = parseFloat(balanceDue) || 0;

    const newPayment = gymStore.recordPayment(currentGym.id, {
      memberId,
      amountPaid: paidNum,
      paymentMethod,
      paymentType,
      balanceDue: dueNum,
      dueDate: dueNum > 0 ? dueDate : undefined,
      reference,
      notes,
    });

    setIsCollectModalOpen(false);
    setSelectedReceipt(newPayment);

    // Reset Form
    setAmountPaid('');
    setBalanceDue('');
    setReference('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Payments & Financial POS
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Complete financial ledger, GST tax reporting (18%), and downloadable invoices
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCollectModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Collect Fee / Create Invoice
        </Button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Collections"
          value={formatINR(totalCollections, false)}
          subValue="Total revenue collected"
          trend={{ value: '+18.4% MoM', isPositive: true }}
          icon={CreditCard}
        />
        <MetricCard
          label="Total GST Collected"
          value={formatINR(totalTax, false)}
          subValue="CGST 9% + SGST 9%"
          icon={Receipt}
          iconColor="text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <MetricCard
          label="Outstanding Dues"
          value={formatINR(totalDues, false)}
          subValue="Pending balance ledger"
          trend={{ value: 'Action Required', isPositive: false }}
          icon={DollarSign}
          iconColor="text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          label="Net Operating Profit"
          value={formatINR(netMargin, false)}
          subValue={`Expenses: ${formatINR(totalExpenses, false)}`}
          trend={{ value: 'Positive Margin', isPositive: true }}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* Transaction History Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Payment Transactions & Consecutive Invoices
          </CardTitle>
          <Badge variant="neutral" className="text-xs">
            {payments.length} Records
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                      No payment records found. Collect fee to generate invoice.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                      {/* Invoice No */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.invoice_number}
                      </td>

                      {/* Member */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{p.member?.full_name || 'Member'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(p.created_at)}</p>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="capitalize">{p.payment_type.replace('_', ' ')}</span>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <Badge variant="neutral" className="uppercase text-[10px]">
                          {p.payment_method}
                        </Badge>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(p.amount_paid)}
                      </td>

                      {/* Due */}
                      <td className="py-3 px-4 text-right font-mono">
                        {p.balance_due > 0 ? (
                          <span className="text-amber-500 dark:text-amber-400 font-semibold">{formatINR(p.balance_due)}</span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(p)}
                          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Collect Fee Modal */}
      <Dialog
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Collect Fee / Generate Tax Invoice"
        description="Record fee collection with GST breakdown and consecutive invoice numbering."
      >
        <form onSubmit={handleCollectPayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Member *</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              required
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code} • {m.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="w-full bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="membership_fee">Membership Fee</option>
                <option value="renewal">Plan Renewal</option>
                <option value="personal_training">Personal Training (PT)</option>
                <option value="supplement">Supplement</option>
                <option value="registration_fee">Registration Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Collection</option>
                <option value="bank_transfer">Net Banking / NEFT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount Paid (INR) *"
              type="number"
              placeholder="e.g. 15000"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
            />
            <Input
              label="Balance Remaining Due (INR)"
              type="number"
              placeholder="0"
              value={balanceDue}
              onChange={(e) => setBalanceDue(e.target.value)}
            />
          </div>

          {parseFloat(balanceDue) > 0 && (
            <Input
              label="Balance Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          )}

          <Input
            label="Transaction Reference / UTR Number"
            placeholder="e.g. UPI/402819283719"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <Input
            label="Notes / Remarks"
            placeholder="e.g. Annual renewal payment"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Collect & Issue Invoice
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Tax Invoice Printable Drawer */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">GST Tax Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-xl p-6 space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 dark:border-white/10 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentGym.name}</h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{currentGym.address_line1}, {currentGym.city}, {currentGym.state}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">GSTIN: {currentGym.gstin || '27AABCO1234F1Z5'}</p>
              </div>

              <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <span className="text-slate-500">BILLED TO:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{selectedReceipt.member?.full_name || 'Member'}</p>
                  <p className="text-slate-600 dark:text-slate-400">{selectedReceipt.member?.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">INVOICE NUMBER:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReceipt.invoice_number}</p>
                  <p className="text-slate-500 dark:text-slate-400">{formatDateTime(selectedReceipt.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Description:</span>
                  <span className="font-semibold uppercase">{selectedReceipt.payment_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Payment Mode:</span>
                  <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{selectedReceipt.payment_method}</span>
                </div>
                {selectedReceipt.transaction_reference && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                    <span>Reference / UTR:</span>
                    <span>{selectedReceipt.transaction_reference}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxable Value:</span>
                  <span>{formatINR(selectedReceipt.amount_paid - selectedReceipt.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CGST (9%):</span>
                  <span>{formatINR(selectedReceipt.tax_amount / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>SGST (9%):</span>
                  <span>{formatINR(selectedReceipt.tax_amount / 2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-white/10">
                  <span>TOTAL PAID:</span>
                  <span>{formatINR(selectedReceipt.amount_paid)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = generateWhatsAppReceiptUrl({
                    phone: selectedReceipt.member?.phone || '9820098200',
                    memberName: selectedReceipt.member?.full_name || 'Member',
                    gymName: currentGym.name,
                    invoiceNumber: selectedReceipt.invoice_number,
                    amount: selectedReceipt.amount_paid,
                    paymentMethod: selectedReceipt.payment_method,
                  });
                  window.open(url, '_blank');
                }}
                className="gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 border-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                WhatsApp Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Settings as SettingsIcon,
  Palette,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentGym, settings, branding, refreshTenant } = useTenant();

  // Profile Form
  const [gymName, setGymName] = useState(currentGym.name);
  const [legalName, setLegalName] = useState(currentGym.legal_business_name || '');
  const [gstin, setGstin] = useState(currentGym.gstin || '');
  const [phone, setPhone] = useState(currentGym.phone);
  const [email, setEmail] = useState(currentGym.email);
  const [address, setAddress] = useState(currentGym.address_line1);
  const [city, setCity] = useState(currentGym.city);
  const [state, setState] = useState(currentGym.state);

  // Branding Form
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color || '#10B981');
  const [logoUrl, setLogoUrl] = useState(branding.logo_url || '');
  const [tagline, setTagline] = useState(branding.tagline || '');

  // Invoice Form
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix);
  const [taxRate, setTaxRate] = useState(String(settings.tax_rate_percent));

  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    gymStore.updateBranding(currentGym.id, {
      primary_color: primaryColor,
      logo_url: logoUrl,
      tagline,
    });

    gymStore.updateSettings(currentGym.id, {
      invoice_prefix: invoicePrefix,
      tax_rate_percent: parseFloat(taxRate) || 18,
    });

    refreshTenant();
    setSavedMessage('Configuration and white-label branding updated successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-400" />
            Gym Settings & White-Label Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure legal business information, GSTIN, invoice sequence prefixes, and brand appearance
          </p>
        </div>

        {savedMessage && (
          <Badge variant="active" className="gap-1.5 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {savedMessage}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Business Profile */}
        <Card>
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Gym Business Profile & GSTIN
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Gym Display Name *"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
              />
              <Input
                label="Legal Business Name"
                placeholder="e.g. Olympia Fitness LLP"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="GSTIN (15 Digits)"
                placeholder="27AABCO1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
              />
              <Input
                label="Official Phone *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Official Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  label="Address Line 1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Input
                label="City / State"
                value={`${city}, ${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCity(parts[0]?.trim() || city);
                  setState(parts[1]?.trim() || state);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* White-Label Appearance & Brand Tokens */}
        <Card>
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              White-Label Branding & Accent Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 bg-[#0D1322] border border-white/10 rounded-md px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <Input
                label="Brand Tagline"
                placeholder="e.g. Forge Your Greatest Physique"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <Input
              label="Logo Image URL"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Tax & Invoicing Rules */}
        <Card>
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Invoice Sequences & Tax Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Invoice Prefix"
                placeholder="e.g. OLY"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
              />
              <Input
                label="Standard Tax Rate (%)"
                placeholder="18"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" size="md" type="submit">
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

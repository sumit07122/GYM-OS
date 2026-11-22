import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Settings as SettingsIcon,
  Palette,
  FileText,
  Save,
  CheckCircle2,
  Radio,
  LocateFixed,
  CreditCard,
  MessageCircle,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentGym, settings, branding, refreshTenant } = useTenant();

  // Settings State
  const [gymName, setGymName] = useState(currentGym.name);
  const [legalName, setLegalName] = useState(currentGym.legal_business_name || '');
  const [gstin, setGstin] = useState(currentGym.gstin || '');
  const [phone, setPhone] = useState(currentGym.phone);
  const [email, setEmail] = useState(currentGym.email);
  const [address, setAddress] = useState(currentGym.address_line1);
  const [city, setCity] = useState(currentGym.city);
  const [state, setState] = useState(currentGym.state);

  // Branding State
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color || '#10B981');
  const [logoUrl, setLogoUrl] = useState(branding.logo_url || '');
  const [tagline, setTagline] = useState(branding.tagline || '');

  // Invoicing & Tax State
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix || 'INV');
  const [taxRate, setTaxRate] = useState(String(settings.tax_rate_percent || 18));

  // Geofence & Integrations
  const [latitude, setLatitude] = useState(String(settings.latitude || '19.0596'));
  const [longitude, setLongitude] = useState(String(settings.longitude || '72.8295'));
  const [geofenceRadius, setGeofenceRadius] = useState(String(settings.geofence_radius_meters || 100));
  const [geofenceEnabled, setGeofenceEnabled] = useState(settings.geofence_attendance_enabled ?? true);
  const [razorpayKey, setRazorpayKey] = useState(settings.razorpay_key_id || '');
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsapp_business_number || '');

  const [savedMessage, setSavedMessage] = useState('');

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setSavedMessage('Current GPS location detected successfully!');
          setTimeout(() => setSavedMessage(''), 3000);
        },
        () => {
          alert('Could not access GPS location. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Core Gym Info
    gymStore.updateGym(currentGym.id, {
      name: gymName,
      legal_business_name: legalName,
      gstin,
      phone,
      email,
      address_line1: address,
      city,
      state,
    });

    // 2. Update Branding
    gymStore.updateBranding(currentGym.id, {
      primary_color: primaryColor,
      logo_url: logoUrl,
      tagline,
    });

    // 3. Update Operational Settings
    gymStore.updateSettings(currentGym.id, {
      invoice_prefix: invoicePrefix,
      tax_rate_percent: parseFloat(taxRate) || 18,
      latitude: parseFloat(latitude) || 19.0596,
      longitude: parseFloat(longitude) || 72.8295,
      geofence_radius_meters: parseInt(geofenceRadius, 10) || 100,
      enable_gps_attendance: geofenceEnabled,
      geofence_attendance_enabled: geofenceEnabled,
      razorpay_key_id: razorpayKey,
      whatsapp_business_number: whatsappPhone,
    });

    refreshTenant();
    setSavedMessage('Configuration and white-label branding updated successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Gym Settings & White-Label Configuration
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
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
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              White-Label Branding & Accent Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 dark:border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 font-mono text-xs text-slate-900 dark:text-white"
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
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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

        {/* GPS Geofence & Auto-Attendance Perimeter */}
        <Card className="border border-emerald-500/20">
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              GPS Geofence & Automated Member Attendance
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              Detect Current GPS
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Configure the exact geographical coordinates of your gym facility. Members within this radius can automatically check in using their smartphone's GPS.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Latitude (Dec Degrees)"
                placeholder="19.0596"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
              <Input
                label="Longitude (Dec Degrees)"
                placeholder="72.8295"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
              <Input
                label="Geofence Radius (Meters)"
                placeholder="100"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="geofenceToggle"
                checked={geofenceEnabled}
                onChange={(e) => setGeofenceEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-100 dark:bg-[#0D1322] border-slate-300 dark:border-white/20 focus:ring-emerald-500"
              />
              <label htmlFor="geofenceToggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                Enable GPS Geofenced Self Check-In on Member Portal
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Payments Gateway & WhatsApp Cloud API Integrations */}
        <Card>
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Payment Gateway & WhatsApp Cloud Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Razorpay Key ID (UPI / Cards)"
                  placeholder="rzp_live_..."
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Used to create instant UPI dynamic QR codes and checkout links.</p>
              </div>

              <div>
                <Input
                  label="WhatsApp Business Phone Number"
                  placeholder="+91 98200 98200"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Used to dispatch 1-click tax invoices and payment dues alerts.</p>
              </div>
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
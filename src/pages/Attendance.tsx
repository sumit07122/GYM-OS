import React, { useState } from 'react';
import { useTenant } from '@/lib/tenant/context';
import { gymStore } from '@/lib/supabase/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/formatting/dates';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Camera,
  UserCheck,
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const { currentGym, currentUser } = useTenant();
  const [manualQuery, setManualQuery] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const members = gymStore.getMembers(currentGym.id);
  const todayAttendance = gymStore.getTodayAttendance(currentGym.id);

  const handleManualCheckIn = (memberId: string) => {
    const res = gymStore.checkInMember(currentGym.id, memberId, 'reception_manual', currentUser.full_name);
    setCheckInResult(res);
    setManualQuery('');
    setTimeout(() => {
      setCheckInResult(null);
    }, 4000);
  };

  const handleSimulateQrScan = () => {
    // Pick the first active member to simulate scanning their mobile QR code
    const targetMember = members[0];
    if (!targetMember) return;

    const res = gymStore.checkInMember(currentGym.id, targetMember.id, 'qr_scan', 'Kiosk Camera');
    setCheckInResult(res);
    setTimeout(() => {
      setCheckInResult(null);
    }, 4000);
  };

  // Matched members for quick search dropdown
  const matchedMembers = manualQuery.trim()
    ? members.filter(
        (m) =>
          m.full_name.toLowerCase().includes(manualQuery.toLowerCase()) ||
          m.member_code.toLowerCase().includes(manualQuery.toLowerCase()) ||
          m.phone.includes(manualQuery)
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            Attendance & Access Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic QR Scanner & Front-Desk Manual Verification with 60-Minute Anti-Duplicate Lockout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="active" className="py-1 px-3 text-xs gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            {todayAttendance.length} Checked In Today
          </Badge>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {checkInResult && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top duration-200 ${
            checkInResult.success
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {checkInResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <div className="text-xs font-semibold">{checkInResult.message}</div>
        </div>
      )}

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Check-in Terminal Interface */}
        <div className="lg:col-span-5 space-y-6">
          {/* QR Scanner Kiosk Camera Box */}
          <Card className="border-emerald-500/30 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-950/40 to-[#111827] border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Live Camera / USB Scanner Viewport
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="relative mx-auto w-48 h-48 border-2 border-dashed border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-4 bg-[#090D16]/80 overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                <QrCode className="w-16 h-16 text-emerald-400/80 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] text-slate-400">Position Member Digital QR Here</p>
                <div className="absolute bottom-2 text-[9px] text-slate-600 font-mono">Auto-refreshes every 60s</div>
              </div>

              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={handleSimulateQrScan} className="w-full text-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Simulate QR Scan Check-In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Receptionist Manual Search & Punch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Receptionist Manual Check-In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter Member Code (M-00101) or Mobile..."
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="w-full bg-[#0D1322] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Matched Dropdown results */}
              {matchedMembers.length > 0 && (
                <div className="bg-[#090D16] border border-white/10 rounded-lg p-2 max-h-56 overflow-y-auto divide-y divide-white/5 text-xs">
                  {matchedMembers.map((m) => (
                    <div key={m.id} className="py-2 px-2 flex items-center justify-between hover:bg-white/5 rounded">
                      <div>
                        <p className="font-semibold text-slate-100">{m.full_name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">{m.member_code} • {m.phone}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleManualCheckIn(m.id)}
                        className="text-xs py-1 px-2.5"
                      >
                        Check In
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Member List */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[11px] font-semibold text-slate-400">Quick Roster Check-In:</p>
                <div className="space-y-1.5">
                  {members.slice(0, 3).map((m) => (
                    <div key={m.id} className="p-2 bg-[#090D16] rounded-md flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{m.full_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManualCheckIn(m.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 py-0.5"
                      >
                        Punch In
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 Cols): Live Attendance Feed */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Today's Live Verification Stream
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Chronological record of verified entrance passes</p>
              </div>
              <Badge variant="neutral" className="font-mono text-xs">
                {todayAttendance.length} Total Today
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {todayAttendance.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  No attendance records logged yet today. Check-in members on the left terminal.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {todayAttendance.map((rec) => (
                    <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                          {rec.member?.full_name.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{rec.member?.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {rec.member?.member_code} • {rec.member?.phone}
                          </p>
                          <Badge
                            variant={rec.method === 'qr_scan' ? 'active' : 'info'}
                            className="text-[9px] mt-1 py-0 px-1.5"
                          >
                            {rec.method === 'qr_scan' ? 'QR Scanner Pass' : 'Receptionist Manual'}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-slate-200 font-semibold">{formatDateTime(rec.check_in_time)}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">By {rec.verified_by_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

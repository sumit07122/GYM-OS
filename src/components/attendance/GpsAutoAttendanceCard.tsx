import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { calculateDistanceMeters, formatDistance, isWithinGeofence } from '@/lib/geo/distance';
import { gymStore } from '@/lib/supabase/store';
import type { Gym, Member } from '@/types';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Radio,
  RefreshCw,
  LocateFixed,
  ShieldCheck,
} from 'lucide-react';

interface GpsAutoAttendanceCardProps {
  gym: Gym;
  member: Member;
  onAttendanceSuccess?: () => void;
}

export const GpsAutoAttendanceCard: React.FC<GpsAutoAttendanceCardProps> = ({
  gym,
  member,
  onAttendanceSuccess,
}) => {
  const gymSettings = gymStore.getSettings(gym.id);
  const gymLat = gymSettings.latitude ?? 19.0596;
  const gymLon = gymSettings.longitude ?? 72.8295;
  const radius = gymSettings.geofence_radius_meters ?? 100;

  // Simulation or real GPS state
  const [mode, setMode] = useState<'device' | 'simulate_at_gym' | 'simulate_outside'>('simulate_at_gym');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: gymLat + 0.0001, // ~12 meters away (Inside gym)
    lon: gymLon + 0.0001,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Compute live distance
  const distanceMeters = calculateDistanceMeters(coords.lat, coords.lon, gymLat, gymLon);
  const inside = isWithinGeofence(distanceMeters, radius);

  // Acquire real device GPS
  const fetchDeviceGps = () => {
    if (!navigator.geolocation) {
      setStatusMessage({ success: false, text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setMode('device');
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setStatusMessage({
          success: false,
          text: `GPS Access Error: ${err.message}. Defaulting to front desk simulator.`,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleModeChange = (newMode: 'device' | 'simulate_at_gym' | 'simulate_outside') => {
    setMode(newMode);
    setStatusMessage(null);
    if (newMode === 'device') {
      fetchDeviceGps();
    } else if (newMode === 'simulate_at_gym') {
      setCoords({ lat: gymLat + 0.0001, lon: gymLon + 0.0001 });
    } else {
      setCoords({ lat: gymLat + 0.015, lon: gymLon + 0.015 }); // ~2.3km away
    }
  };

  const handlePunchAttendance = () => {
    const res = gymStore.checkInMemberViaGps(gym.id, member.id, coords.lat, coords.lon);
    setStatusMessage({ success: res.success, text: res.message });
    if (res.success && onAttendanceSuccess) {
      onAttendanceSuccess();
    }
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  return (
    <Card className="border border-emerald-500/30 bg-gradient-to-br from-[#0c1322] via-[#090D16] to-[#090D16] overflow-hidden shadow-glow">
      <CardHeader className="border-b border-white/5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className={`w-4 h-4 ${inside ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>GPS Geofenced Auto-Attendance</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 bg-[#090D16] p-1 rounded-lg border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => handleModeChange('simulate_at_gym')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                mode === 'simulate_at_gym'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              At Gym (20m)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('simulate_outside')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                mode === 'simulate_outside'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outside (2.3km)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('device')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                mode === 'device'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LocateFixed className="w-3 h-3" />
              Live Device
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Status / Message Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs animate-in slide-in-from-top duration-200 ${
              statusMessage.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Radar / Distance Visualizer */}
          <div className="flex items-center gap-3 bg-[#070b12] p-3 rounded-xl border border-white/5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                inside
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-glow'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Navigation className={`w-6 h-6 ${inside ? 'rotate-45' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Distance to Gym</span>
              <p className="text-base font-extrabold text-white font-mono mt-0.5">
                {formatDistance(distanceMeters)}
              </p>
              <p className="text-[10px] text-slate-400">
                Max Allowed Radius: <span className="font-mono text-emerald-400">{radius}m</span>
              </p>
            </div>
          </div>

          {/* Location Coordinates & Geofence Status */}
          <div className="bg-[#070b12] p-3 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Geofence Status</span>
              <Badge variant={inside ? 'active' : 'expired'} className="text-[10px]">
                {inside ? 'Inside Perimeter' : 'Outside Perimeter'}
              </Badge>
            </div>
            <div className="text-[11px] font-mono text-slate-300 pt-1">
              Lat: {coords.lat.toFixed(4)} • Lon: {coords.lon.toFixed(4)}
            </div>
            <p className="text-[10px] text-slate-500">
              Verified against: <span className="text-slate-400 font-semibold">{gym.name}</span>
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            <Button
              variant={inside ? 'primary' : 'secondary'}
              size="md"
              disabled={!inside || gpsLoading}
              onClick={handlePunchAttendance}
              className="w-full text-xs font-bold gap-2 py-3 shadow-glow"
            >
              <ShieldCheck className="w-4 h-4" />
              {inside ? 'Check In via GPS Now' : 'Move Closer to Check In'}
            </Button>
            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              60-min anti-duplicate lockout enforced
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

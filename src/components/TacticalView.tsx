import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Radio,
  Users,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  MapPin,
  Lock,
  Unlock,
  Clock,
  Video,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  FileText,
  Image,
  PhoneOff,
  Camera,
  X,
  RefreshCw
} from "lucide-react";
import { WalkieUser, ChatMessage, ConnectionStatus } from "../types";

interface TacticalViewProps {
  status: ConnectionStatus;
  currentTime: string;
  batteryLevel: number;
  audioMuted: boolean;
  setAudioMuted: (val: boolean) => void;
  handleDisconnect: () => void;
  isJoined: boolean;
  codename: string;
  setCodename: (val: string) => void;
  channel: string;
  setChannel: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  friendLocation: string;
  setFriendLocation: (val: string) => void;
  pathMetrics: { distanceKn: number; latencyMs: number };
  handleConnect: (e: React.FormEvent) => void;
  BANGLADESH_DISTRICTS: string[];
  activeTab: "radio" | "video" | "chat";
  setActiveTab: (tab: "radio" | "video" | "chat") => void;
  users: WalkieUser[];
  isLocalSpeaking: boolean;
  isHandsFree: boolean;
  setIsHandsFree: React.Dispatch<React.SetStateAction<boolean>>;
  triggerTransmissionStart: () => void;
  triggerTransmissionStop: () => void;
  remoteSpeakerId: string | null;
  remoteSpeakerName: string;
  getWavePath: () => string;
  localVolume: number;
  remoteVolume: number;
  isVideoCalling: boolean;
  simulatedLocalFeed: boolean;
  simulatedRemoteFeed: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  startVideoCall: () => void;
  stopVideoCall: () => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleFileShare: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  remoteStream: MediaStream | null;
}

export const TacticalView: React.FC<TacticalViewProps> = ({
  status,
  currentTime,
  batteryLevel,
  audioMuted,
  setAudioMuted,
  handleDisconnect,
  isJoined,
  codename,
  setCodename,
  channel,
  setChannel,
  location,
  setLocation,
  friendLocation,
  setFriendLocation,
  pathMetrics,
  handleConnect,
  BANGLADESH_DISTRICTS,
  activeTab,
  setActiveTab,
  users,
  isLocalSpeaking,
  isHandsFree,
  setIsHandsFree,
  triggerTransmissionStart,
  triggerTransmissionStop,
  remoteSpeakerId,
  remoteSpeakerName,
  getWavePath,
  localVolume,
  remoteVolume,
  isVideoCalling,
  simulatedLocalFeed,
  simulatedRemoteFeed,
  localVideoRef,
  remoteVideoRef,
  startVideoCall,
  stopVideoCall,
  chatMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  handleFileShare,
  chatBottomRef,
  remoteStream
}) => {
  return (
    <div className="min-h-screen bg-[#070a11] font-sans text-slate-200 flex flex-col selection:bg-orange-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* High-Tech Cyber Ambient Lighting */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        
        {/* ================= TOP FLIGHTDECK BAR ================= */}
        <header className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3.5 sm:px-5 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-orange-700/10 border border-orange-500/30 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center justify-center">
              <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center gap-1.5">
                  AURA<span className="text-orange-500">TACTICAL</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-orange-950/60 border border-orange-500/30 text-orange-400 rounded-md">v2.5</span>
                </h1>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                {isJoined ? `FREQ: 144.825 MHz • CH: ${channel}` : "STANDBY FREQUENCY BRIDGE"}
              </p>
            </div>
          </div>

          {/* Center Info Stats */}
          <div className="hidden md:flex items-center gap-4 bg-[#1e293b]/60 px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className={`font-bold ${status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status === 'connected' ? 'ONLINE (কানেক্টেড)' : status === 'connecting' ? 'সংযো গ হচ্ছে...' : 'STANDBY'}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentTime ? currentTime.split(" ")[4] : "00:00:00"} UTC</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <span>BAT: {batteryLevel}%</span>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAudioMuted(!audioMuted)}
              className={`p-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                audioMuted 
                  ? "bg-rose-950/50 text-rose-400 border-rose-800/60" 
                  : "bg-[#1e293b] text-slate-300 border-slate-700 hover:text-white hover:border-slate-600"
              }`}
              title={audioMuted ? "শব্দ আনমিউট করুন" : "শব্দ মিউট করুন"}
            >
              {audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
              <span className="hidden sm:inline">{audioMuted ? "স্পিকার বন্ধ" : "সাউন্ড অন"}</span>
            </button>

            {isJoined && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>ডিসকানেক্ট</span>
              </button>
            )}
          </div>
        </header>

        {/* ================= MAIN CONTENT WORKSPACE ================= */}
        <AnimatePresence mode="wait">
          {!isJoined ? (
            
            /* STAGE 1: MODERN GLASS ONBOARDING PORTAL */
            <motion.div
              key="onboarding-portal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center my-auto py-6"
            >
              <div className="w-full max-w-xl bg-[#0f172a]/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                
                {/* Decorative glowing gradient top border */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-500" />

                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-3 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                    <Radio className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                    ট্যাকটিক্যাল ভয়েস ও মিডিয়া হাবে স্বাগতম
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    রিয়েল-টাইম পুশ-টু-টক (PTT) রেডিও, এইচডি ভিডিও কল এবং ফাইল ট্রান্সফার চ্যানেলে যুক্ত হতে কলসাইন ও রুম ফ্রিকোয়েন্সি বেছে নিন।
                  </p>
                </div>

                <form onSubmit={handleConnect} className="space-y-5">
                  {/* Codename Input */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex justify-between">
                      <span>১. আপনার কলসাইন / নাম (CODENAME)</span>
                      <span className="text-orange-400 text-[10px]">REQUIRED</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={codename}
                        onChange={(e) => setCodename(e.target.value)}
                        placeholder="যেমন: ALPHA-1, COM-99, KILO-7"
                        className="w-full py-3 px-4 bg-[#1e293b]/80 border border-slate-700/80 focus:border-orange-500 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const callsigns = ["ALPHA-1", "DELTA-7", "SIERRA-X", "ECHO-9", "VICTOR-3", "BRAVO-2"];
                          setCodename(callsigns[Math.floor(Math.random() * callsigns.length)]);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono transition cursor-pointer"
                      >
                        অটো আইডি
                      </button>
                    </div>
                  </div>

                  {/* Channel Frequency Selector & Presets */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      ২. চ্যানেল রুম কোড (FREQUENCY ROOM)
                    </label>
                    <input
                      type="text"
                      required
                      value={channel}
                      onChange={(e) => setChannel(e.target.value.toUpperCase())}
                      placeholder="যেমন: ROOM_01, ALPHA_SEC"
                      className="w-full py-3 px-4 bg-[#1e293b]/80 border border-slate-700/80 focus:border-orange-500 rounded-xl text-sm text-orange-400 font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition mb-2 uppercase"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {["ROOM_01", "ALPHA_SEC", "EMERGENCY_911", "TACTICAL_09"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setChannel(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border cursor-pointer ${
                            channel === preset
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/50 font-bold"
                              : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location District Bridge Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">আপনার জেলা (LOCATION)</label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full py-2.5 px-3 bg-[#1e293b]/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-orange-500"
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d} className="bg-[#0f172a] text-slate-200">{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">সহযোগীর জেলা (TARGET)</label>
                      <select
                        value={friendLocation}
                        onChange={(e) => setFriendLocation(e.target.value)}
                        className="w-full py-2.5 px-3 bg-[#1e293b]/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-orange-500"
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d} className="bg-[#0f172a] text-slate-200">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculated Route Info Badge */}
                  <div className="p-3 bg-[#1e293b]/50 border border-slate-800 rounded-xl flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>দূরত্ব: {pathMetrics.distanceKn} কিমি</span>
                    </div>
                    <div>
                      <span>আনুমানিক ল্যাটেন্সি: ~{pathMetrics.latencyMs}ms</span>
                    </div>
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={status === "connecting"}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 active:scale-[0.99] rounded-xl text-slate-950 font-display font-black text-xs uppercase tracking-widest transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{status === "connecting" ? "সংযোগ করা হচ্ছে..." : "চ্যানেল ফ্রিকোয়েনসিতে কানেক্ট করুন"}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (

            /* STAGE 2: ACTIVE DUAL-COLUMN TACTICAL DASHBOARD */
            <motion.div
              key="active-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start"
            >
              
              {/* ================= LEFT SIDEBAR: CHANNEL & OPERATORS ================= */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Active Channel Card */}
                <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        সক্রিয় ফ্রিকোয়েন্সি
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-950/60 border border-orange-500/30 text-orange-400 rounded text-[10px] font-mono font-bold">
                      {channel}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>আপনার আইডি:</span>
                      <span className="text-orange-400 font-bold">@{codename}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>রুট ব্রিজ:</span>
                      <span className="text-slate-200">{location.split(" ")[0]} ↔ {friendLocation.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>দূরত্ব ও পিং:</span>
                      <span className="text-emerald-400">{pathMetrics.distanceKn} km ({pathMetrics.latencyMs}ms)</span>
                    </div>
                  </div>
                </div>

                {/* Active Channel Operators Roster */}
                <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                      <Users className="w-4 h-4 text-orange-400" />
                      <span>উপস্থিত সদস্যসমূহ ({users.length + 1})</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {/* Self item */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[11px]">
                          {codename.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">@{codename} (YOU)</p>
                          <p className="text-[9px] text-slate-500">{isLocalSpeaking ? "TRANSMITTING" : "IDLE"}</p>
                        </div>
                      </div>
                      {isLocalSpeaking && (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold rounded animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Remote users */}
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded-xl bg-[#1e293b]/60 border border-slate-800 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">
                            {u.codename.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-300">@{u.codename}</p>
                            <p className="text-[9px] text-slate-500">{u.isSpeaking ? "TALKING..." : "LISTENING"}</p>
                          </div>
                        </div>
                        {u.isSpeaking && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded animate-pulse">
                            SPEAKING
                          </span>
                        )}
                      </div>
                    ))}

                    {users.length === 0 && (
                      <div className="p-3 bg-[#1e293b]/30 rounded-xl text-center text-[11px] font-mono text-slate-500 italic">
                        অন্যদের রুমে জয়েন করতে চ্যানেল কোড "{channel}" দিন।
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Mic Lock / Controls Card */}
                <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="text-xs font-mono font-bold text-slate-300 mb-2.5 flex items-center justify-between">
                    <span>হ্যান্ডস-ফ্রি মাইক কন্ট্রোল</span>
                    <span className="text-[10px] text-slate-500">HOTKEY: SPACEBAR</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isHandsFree) {
                        setIsHandsFree(false);
                        if (isLocalSpeaking) triggerTransmissionStop();
                      } else {
                        setIsHandsFree(true);
                        triggerTransmissionStart();
                      }
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                      isHandsFree
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20"
                        : "bg-[#1e293b] text-slate-300 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {isHandsFree ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-slate-400" />}
                    <span>{isHandsFree ? "MIC LOCKED (হ্যান্ডস-ফ্রি অন)" : "LOCK MIC (হ্যান্ডস-ফ্রি)"}</span>
                  </button>
                </div>
              </div>

              {/* ================= RIGHT MAIN WORKSPACE ================= */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Tactical Navigation Sub-Tabs */}
                <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 flex gap-1.5 shadow-xl">
                  {[
                    { id: "radio", label: "রেডিও (PTT)", icon: Radio },
                    { id: "video", label: "ভিডিও কল HD", icon: Video },
                    { id: "chat", label: "চ্যাট ও ফাইল শেয়ার", icon: MessageSquare }
                  ].map((tb) => {
                    const IconComp = tb.icon;
                    const isSelected = activeTab === tb.id;
                    return (
                      <button
                        key={tb.id}
                        type="button"
                        onClick={() => setActiveTab(tb.id as any)}
                        className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/60"
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span>{tb.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: WALKIE TALKIE (PTT VOICE ENGINE) */}
                {activeTab === "radio" && (
                  <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
                    
                    {/* OLED Oscilloscope Visual Display */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isLocalSpeaking || remoteSpeakerId ? 'bg-orange-500 animate-ping' : 'bg-slate-700'}`} />
                          <span className="uppercase text-slate-400 font-bold">
                            {isLocalSpeaking ? "TRANSMITTING [TX]" : remoteSpeakerId ? `RECEIVING [RX] @${remoteSpeakerName}` : "SIGNAL FLATLINE [STANDBY]"}
                          </span>
                        </div>
                        <span>SQUELCH AUTO-FILTER</span>
                      </div>

                      {/* Wave Canvas SVG */}
                      <div className="h-20 w-full flex items-center justify-center relative">
                        <svg className="w-full h-full" viewBox="0 0 360 48" preserveAspectRatio="none">
                          <path
                            d={getWavePath()}
                            fill="none"
                            stroke={isLocalSpeaking ? "#ef4444" : remoteSpeakerId ? "#10b981" : "#f97316"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* Volume Peak Bar */}
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                          style={{ width: `${Math.min(isLocalSpeaking ? localVolume : remoteVolume, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Giant Tactile Push-To-Talk Button */}
                    <div className="flex flex-col items-center justify-center py-4 relative">
                      {/* Animated halo pulses */}
                      <AnimatePresence>
                        {isLocalSpeaking && (
                          <>
                            <motion.div
                              initial={{ scale: 1, opacity: 0.6 }}
                              animate={{ scale: 1.7, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                              className="absolute w-44 h-44 border-2 border-rose-500 rounded-full pointer-events-none"
                            />
                            <motion.div
                              initial={{ scale: 1, opacity: 0.4 }}
                              animate={{ scale: 2.2, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                              className="absolute w-44 h-44 border border-orange-500/40 rounded-full pointer-events-none"
                            />
                          </>
                        )}
                      </AnimatePresence>

                      <motion.button
                        onMouseDown={(e) => {
                          if (e.button === 0 && !isHandsFree) triggerTransmissionStart();
                        }}
                        onMouseUp={() => {
                          if (!isHandsFree && isLocalSpeaking) triggerTransmissionStop();
                        }}
                        onMouseLeave={() => {
                          if (!isHandsFree && isLocalSpeaking) triggerTransmissionStop();
                        }}
                        onTouchStart={() => {
                          if (!isHandsFree) triggerTransmissionStart();
                        }}
                        onTouchEnd={() => {
                          if (!isHandsFree && isLocalSpeaking) triggerTransmissionStop();
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center cursor-pointer select-none border-4 transition-all shadow-2xl ${
                          isLocalSpeaking
                            ? "bg-gradient-to-br from-rose-600 to-rose-800 border-rose-400 shadow-rose-500/40"
                            : "bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 shadow-orange-500/30"
                        }`}
                      >
                        <div className="p-3 bg-black/20 rounded-full mb-1">
                          {isLocalSpeaking ? <Mic className="w-8 h-8 text-white animate-pulse" /> : <MicOff className="w-8 h-8 text-white" />}
                        </div>
                        <span className="text-white font-black text-sm tracking-widest uppercase font-display">
                          {isLocalSpeaking ? "কথা বলুন" : "পাকড়ান ও বলুন"}
                        </span>
                        <span className="text-[9px] font-mono text-orange-200 mt-0.5 uppercase font-bold tracking-wider opacity-90">
                          {isLocalSpeaking ? "TRANSMITTING" : "HOLD TO TALK"}
                        </span>
                      </motion.button>

                      <p className="text-[11px] font-mono text-slate-400 mt-4 flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-orange-400" />
                        <span>ডেস্কটপে <strong>Spacebar</strong> চেপে ধরেও বলা যাবে</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: HD VIDEO CALL STUDIO */}
                {activeTab === "video" && (
                  <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                    {!isVideoCalling ? (
                      <div className="border border-slate-800 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-3 text-orange-400">
                          <Camera className="w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
                          রিয়েল-টাইম HD ভিডিও কল স্টুডিও
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed font-sans mb-5">
                          WebRTC-P2P সরাসরি ভিডিও সংযোগ ব্যবহার করে রিয়েল-টাইমে ফেস-টু-ফেস কথা বলুন।
                        </p>
                        <button
                          type="button"
                          onClick={startVideoCall}
                          className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 rounded-xl text-slate-950 font-display font-black text-xs uppercase tracking-widest transition shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>ভিডিও কল শুরু করুন</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Local Feed */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              আপনার ভিডিও (@{codename})
                            </span>
                            <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                              {simulatedLocalFeed ? (
                                <div className="text-center p-3 font-mono text-[10px] text-orange-400">
                                  <Camera className="w-6 h-6 mx-auto mb-1 animate-pulse" />
                                  <span>LOCAL_CAM: SIMULATED</span>
                                </div>
                              ) : (
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                              )}
                            </div>
                          </div>

                          {/* Remote Feed */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              সহযোগীর ভিডিও
                            </span>
                            <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                              {simulatedRemoteFeed ? (
                                <div className="text-center p-3 font-mono text-[10px] text-emerald-400">
                                  <RefreshCw className="w-5 h-5 mx-auto mb-1 animate-spin" />
                                  <span>P2P NEURAL FEED ACTIVE</span>
                                </div>
                              ) : remoteStream ? (
                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-3 font-mono text-[10px] text-slate-600">
                                  <span>সংযোগের জন্য অপেক্ষমান...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* End Call Button */}
                        <div className="flex justify-end pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={stopVideoCall}
                            className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <PhoneOff className="w-3.5 h-3.5" />
                            <span>কল শেষ করুন</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CHAT & FILE TRANSFER */}
                {activeTab === "chat" && (
                  <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                    
                    {/* Chat Messages Feed */}
                    <div className="h-64 overflow-y-auto space-y-2.5 pr-1 flex flex-col pt-1" id="chat-feed-box">
                      {chatMessages.length === 0 ? (
                        <div className="text-slate-600 text-center my-auto py-12 text-xs italic font-mono">
                          এই চ্যানেলে বার্তা বা ফাইল শেয়ার করা হয়নি। নিচে টাইপ করে পাঠান!
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isSelf = msg.codename === codename;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${isSelf ? "self-end items-end" : "self-start items-start"}`}
                            >
                              <span className="text-[9px] font-mono text-slate-500 mb-0.5 px-1">
                                @{msg.codename || "System"} • {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                                isSelf
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-medium rounded-tr-none"
                                  : "bg-[#1e293b] border border-slate-700/80 text-slate-100 rounded-tl-none"
                              }`}>
                                {msg.file ? (
                                  <div className="space-y-2 min-w-[160px]">
                                    <div className="flex items-center gap-2 border-b border-black/10 pb-1.5">
                                      {msg.file.type.startsWith("image/") ? <Image className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
                                      <div className="min-w-0 flex-1">
                                        <p className="font-mono text-[10px] font-bold truncate">{msg.file.name}</p>
                                        <p className="text-[8px] opacity-70 font-mono">{Math.round(msg.file.size / 1024)} KB</p>
                                      </div>
                                    </div>

                                    {msg.file.type.startsWith("image/") && (
                                      <img src={msg.file.data} alt={msg.file.name} className="max-h-24 w-full object-cover rounded-lg" />
                                    )}

                                    <a
                                      href={msg.file.data}
                                      download={msg.file.name}
                                      className="inline-flex items-center gap-1 py-1 px-2.5 bg-black/20 hover:bg-black/30 rounded-lg text-[10px] font-mono font-bold transition"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>ডাউনলোড</span>
                                    </a>
                                  </div>
                                ) : (
                                  <span>{msg.message}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Form Bar */}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input type="file" id="chat-file-input" className="hidden" onChange={handleFileShare} />
                      
                      <label
                        htmlFor="chat-file-input"
                        className="p-2.5 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-orange-400 rounded-xl cursor-pointer transition border border-slate-700 flex items-center justify-center shrink-0"
                        title="ফাইল যোগ করুন"
                      >
                        <Paperclip className="w-4 h-4" />
                      </label>

                      <input
                        type="text"
                        required
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="বার্তা টাইপ করুন..."
                        className="flex-1 py-2.5 px-3.5 bg-[#1e293b]/80 border border-slate-700/80 focus:border-orange-500 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
                      />

                      <button
                        type="submit"
                        className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 rounded-xl text-slate-950 font-bold text-xs uppercase transition flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info badge */}
        <footer className="mt-auto pt-6 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          AURA TACTICAL COMM NETWORK • CHITTAGONG ⇆ CUMILLA BRIDGE
        </footer>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  Cpu, 
  BarChart3, 
  RefreshCw, 
  Terminal,
  ArrowUpRight
} from "lucide-react";
import { LeaveStorageService } from "@/services/leave-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { AuthStorageService } from "@/services/auth-storage";

interface ActivityPoint {
  day: string;
  count: number;
  label: string;
}

interface DeptMetric {
  name: string;
  percentage: number;
  count: number;
  color: string;
  glow: string;
}

interface StatusMetric {
  status: string;
  count: number;
  percentage: number;
  color: string;
  strokeColor: string;
  glow: string;
}

export function FuturisticChart() {
  const [activeTab, setActiveTab] = useState<"activity" | "departments">("activity");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [radarHovered, setRadarHovered] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[SYS] Terminal diagnostics active.",
    "[NET] Connection secure at localhost:3000."
  ]);
  const [data, setData] = useState<{
    activityData: ActivityPoint[];
    deptData: DeptMetric[];
    statusData: StatusMetric[];
    totalCount: number;
    approvalRate: number;
  }>({
    activityData: [],
    deptData: [],
    statusData: [],
    totalCount: 0,
    approvalRate: 0
  });

  const loadData = () => {
    setIsSyncing(true);
    
    // Add logging
    const currentSession = AuthStorageService.getSession();
    const userDept = currentSession?.department || "";
    const userRole = currentSession?.role || "";

    setLogs(prev => [
      `[SYS-SYNC] Calibrating telemetry streams for ${userDept || "All Departments"}...`,
      ...prev.slice(0, 3)
    ]);

    setTimeout(async () => {
      const leaves = await LeaveStorageService.getAll();
      const approvedLeaves = await LeaveStorageService.getApproved();
      const employees = await EmployeeStorageService.getAll();

      // 1. Calculate Activity Data: Approved leaves for employees in the same department
      const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayCounts: { [key: string]: number } = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
      
      const approvedSameDeptLeaves = approvedLeaves.filter((l) => {
        const emp = employees.find((e) => e.id === l.employeeId);
        if (!emp) return false;
        // If user is Admin, they see all approved leaves
        if (userRole === "ADMIN") return true;
        return emp.department === userDept;
      });

      approvedSameDeptLeaves.forEach((l) => {
        try {
          const d = new Date(l.startDate);
          if (!isNaN(d.getTime())) {
            const dayName = daysOfWeek[d.getDay()];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
          }
        } catch {}
      });

      const finalActivityData = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => {
        const count = dayCounts[day] || 0;
        return {
          day,
          count,
          label: `${count} Approved Leaves`,
        };
      });

      // 2. Calculate Dept Data: Approved leaves count per department
      const deptLeaveCounts: { [key: string]: number } = {};
      const departments = ["Engineering", "Human Resources", "Finance", "Marketing"];
      
      departments.forEach(d => {
        deptLeaveCounts[d] = 0;
      });

      const totalApproved = approvedLeaves.length;

      approvedLeaves.forEach(l => {
        const emp = employees.find(e => e.id === l.employeeId);
        if (emp && departments.includes(emp.department)) {
          deptLeaveCounts[emp.department]++;
        }
      });

      const colors = [
        { color: "from-cyan-400 to-blue-500", glow: "rgba(6,182,212,0.4)" },
        { color: "from-purple-400 to-pink-500", glow: "rgba(168,85,247,0.4)" },
        { color: "from-emerald-400 to-teal-500", glow: "rgba(16,185,129,0.4)" },
        { color: "from-amber-400 to-orange-500", glow: "rgba(245,158,11,0.4)" },
      ];

      const finalDeptData = departments.map((dept, idx) => {
        const leaveCount = deptLeaveCounts[dept];
        const percentage = totalApproved > 0 ? Math.round((leaveCount / totalApproved) * 100) : 0;

        return {
          name: dept,
          percentage: Math.min(percentage, 100),
          count: leaveCount,
          color: colors[idx % colors.length].color,
          glow: colors[idx % colors.length].glow,
        };
      });

      // 3. Calculate Status Ring Data
      const total = leaves.length || 1;
      const pending = leaves.filter(l => l.status === "PENDING").length;
      const approved = leaves.filter(l => l.status === "APPROVED").length;
      const rejected = leaves.filter(l => l.status === "REJECTED").length;
      
      const approvalRate = Math.round((approved / total) * 100);

      const finalStatusData = [
        {
          status: "APPROVED",
          count: approved,
          percentage: Math.max(15, Math.round((approved / total) * 100)),
          color: "text-emerald-400",
          strokeColor: "#34d399",
          glow: "rgba(52,211,153,0.4)",
        },
        {
          status: "PENDING",
          count: pending,
          percentage: Math.max(15, Math.round((pending / total) * 100)),
          color: "text-cyan-400",
          strokeColor: "#22d3ee",
          glow: "rgba(34,211,238,0.4)",
        },
        {
          status: "REJECTED",
          count: rejected,
          percentage: Math.max(15, Math.round((rejected / total) * 100)),
          color: "text-rose-400",
          strokeColor: "#f43f5e",
          glow: "rgba(244,63,94,0.4)",
        },
      ];

      setData({
        activityData: finalActivityData,
        deptData: finalDeptData,
        statusData: finalStatusData,
        totalCount: leaves.length,
        approvalRate
      });

      setLogs(prev => [
        `[DB-READ] Loaded ${employees.length} employees & ${leaves.length} leaves.`,
        `[SYS-SYNC] Telemetry stream locked for ${userDept || "All"}.`,
        ...prev.slice(0, 2)
      ]);
      
      setIsSyncing(false);
    }, 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  // SVG Coordinates calculation for Area Chart
  const width = 600;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const counts = data.activityData.map(d => d.count);
  const maxVal = Math.max(counts.length > 0 ? Math.max(...counts) : 10, 1);

  const points = data.activityData.map((d, index) => {
    const denom = data.activityData.length > 1 ? data.activityData.length - 1 : 1;
    const x = paddingLeft + (index * chartWidth) / denom;
    const y = paddingTop + chartHeight - (d.count * chartHeight) / maxVal;
    return { x, y, ...d };
  });

  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Left panel: Activity and Department Telemetry (Colspan 2) */}
      <div className="lg:col-span-2 bg-[#0b1226]/80 border border-cyan-500/15 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        {/* Futuristic corner design grids */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br" />

        <div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-400">
                  System Diagnostics & Telemetry
                </h3>
              </div>
              <p className="text-slate-400 font-mono text-[10px] mt-1 uppercase tracking-wide">CORE METRIC SCANNER</p>
            </div>
            
            {/* Control Tabs */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 border border-slate-900 rounded-lg">
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-300 ${
                  activeTab === "activity"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                SPECTROGRAM
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-300 ${
                  activeTab === "departments"
                    ? "bg-purple-500/15 border border-purple-500/30 text-purple-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                SECTOR LOAD
              </button>
              
              <button 
                onClick={loadData}
                disabled={isSyncing}
                className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-950 rounded-md transition-all duration-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="relative min-h-[240px]">
            {activeTab === "activity" ? (
              // Tab 1: Area Spectrogram Chart
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    {/* Area fill gradient */}
                    <linearGradient id="areaGlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Laser stroke filter */}
                    <filter id="laserGlow" x="-25%" y="-25%" width="150%" height="150%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines with dynamic labels */}
                  {[0, Math.floor(maxVal * 0.25), Math.floor(maxVal * 0.5), Math.floor(maxVal * 0.75), maxVal].map((val, i) => {
                    const y = paddingTop + chartHeight - (val * chartHeight) / maxVal;
                    return (
                      <g key={i}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={width - paddingRight}
                          y2={y}
                          stroke="rgba(6, 182, 212, 0.08)"
                          strokeDasharray="4 4"
                          strokeWidth={1}
                        />
                        <text
                          x={paddingLeft - 8}
                          y={y + 3}
                          fill="rgba(6, 182, 212, 0.45)"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Laser Area fill path */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#areaGlowGrad)" className="transition-all duration-1000 ease-out" />
                  )}

                  {/* Glowing Laser Line path */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      filter="url(#laserGlow)"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}

                  {/* Snap crosshair coordinates lines on Hover */}
                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <g>
                      {/* Vertical line snap */}
                      <line
                        x1={points[hoveredIndex].x}
                        y1={paddingTop}
                        x2={points[hoveredIndex].x}
                        y2={paddingTop + chartHeight}
                        stroke="rgba(34, 211, 238, 0.3)"
                        strokeWidth={1.2}
                        strokeDasharray="2 2"
                      />
                      {/* Horizontal line snap */}
                      <line
                        x1={paddingLeft}
                        y1={points[hoveredIndex].y}
                        x2={width - paddingRight}
                        y2={points[hoveredIndex].y}
                        stroke="rgba(34, 211, 238, 0.3)"
                        strokeWidth={1.2}
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* Interactive Nodes */}
                  {points.map((p, i) => (
                    <g key={i}>
                      {/* Interactive target */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={12}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      
                      {/* Outer Ring node */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 6 : 4}
                        fill={hoveredIndex === i ? "#ffffff" : "#070b19"}
                        stroke={hoveredIndex === i ? "#22d3ee" : "#06b6d4"}
                        strokeWidth={2}
                        className="transition-all duration-200 pointer-events-none"
                      />

                      {/* X-axis days */}
                      <text
                        x={p.x}
                        y={height - 12}
                        fill="rgba(148, 163, 184, 0.6)"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {p.day}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Snapped Info Hover Tooltip */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <div
                    className="absolute bg-slate-950/95 border border-cyan-400/40 text-white font-mono text-[10px] px-3 py-2 rounded-lg pointer-events-none transition-all duration-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    style={{
                      left: `${((points[hoveredIndex].x - paddingLeft) / chartWidth) * 100}%`,
                      top: `${((points[hoveredIndex].y - 20) / height) * 100}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <div className="text-cyan-400 uppercase tracking-widest font-bold mb-0.5 flex items-center justify-between gap-4">
                      <span>{points[hoveredIndex].day} NODE</span>
                      <span className="text-[8px] text-slate-500">VAL: {points[hoveredIndex].count}</span>
                    </div>
                    <div className="text-slate-200 font-semibold">{points[hoveredIndex].label}</div>
                  </div>
                )}
              </div>
            ) : (
              // Tab 2: Department Load Grid Status
              <div className="space-y-6 py-4">
                {data.deptData.length > 0 ? (
                  data.deptData.map((dept, index) => (
                    <div key={index} className="space-y-2 relative group p-3 bg-black/20 border border-slate-950 hover:border-purple-500/20 hover:bg-purple-950/5 rounded-xl transition-all duration-300">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-cyan-400" : index === 1 ? "bg-purple-400" : index === 2 ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span className="text-slate-300 font-bold uppercase tracking-wider">{dept.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[10px]">{dept.count} REQUESTS</span>
                          <span className="text-purple-400 font-bold">{dept.percentage}% LOAD</span>
                        </div>
                      </div>
                      
                      {/* Glow Progress Track */}
                      <div className="h-2 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full bg-gradient-to-r ${dept.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${dept.percentage}%`,
                            boxShadow: `0 0 10px ${dept.glow}`
                          }}
                        />
                      </div>
                      
                      {/* Secondary visual metrics */}
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-1 text-[8px] font-mono text-purple-400">
                        <span>SYS DECTOR SECURED</span>
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex items-center justify-center font-mono text-xs text-slate-500 animate-pulse">
                    [WAIT] Compiling Sector Matrix...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Console logs output */}
        <div className="mt-4 p-3 bg-black/60 border border-slate-900/60 rounded-xl font-mono text-[10px] space-y-1 text-slate-400">
          <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5">
            <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" /> 
              Live Diagnostics Console
            </span>
            <span className="text-[8px] uppercase tracking-widest text-cyan-400/70 bg-cyan-950/30 px-2 py-0.5 border border-cyan-500/10 rounded">
              STATE: ONLINE
            </span>
          </div>
          <div className="space-y-0.5">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-cyan-500">{`>`}</span>
                <span className={index === 0 ? "text-slate-200" : "text-slate-500"}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Concentric Radar Clearance Telemetry (Colspan 1) */}
      <div className="bg-[#0b1226]/80 border border-cyan-500/15 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        {/* Futuristic corner design grids */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-400 rounded-br" />

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            Clearance Distribution
          </h3>
          <p className="text-slate-400 text-[10px] font-mono">RADAR STATUS METRICS</p>
        </div>

        {/* Concentric rings radar display */}
        <div className="relative flex justify-center items-center py-6">
          <svg
            viewBox="0 0 200 200"
            className="w-full max-w-[200px] h-auto overflow-visible select-none"
          >
            <defs>
              {/* Radar wedge sweep linear gradient */}
              <linearGradient id="radarWedgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </linearGradient>

              {/* Glow filter for rings */}
              <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Radar scanner sweep line (rotating) */}
            <g className="animate-[spin_8s_linear_infinite] origin-[100px_100px] pointer-events-none">
              <line x1="100" y1="100" x2="100" y2="15" stroke="rgba(192,132,252,0.12)" strokeWidth="1" />
              <polygon points="100,100 100,15 130,22 100,100" fill="url(#radarWedgeGrad)" />
            </g>

            {/* Radar layout coordinates / gridlines */}
            <circle cx="100" cy="100" r="85" fill="transparent" stroke="rgba(192,132,252,0.03)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="15" x2="100" y2="185" stroke="rgba(192,132,252,0.03)" strokeWidth="1" />
            <line x1="15" y1="100" x2="185" y2="100" stroke="rgba(192,132,252,0.03)" strokeWidth="1" />

            {/* Background concentric tracks */}
            <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="5" />
            <circle cx="100" cy="100" r="52" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="5" />
            <circle cx="100" cy="100" r="34" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="5" />

            {/* Outer Ring: APPROVED */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="transparent"
              stroke="#34d399"
              strokeWidth="5"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * (data.statusData[0]?.percentage || 0)) / 100}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              filter={radarHovered === 0 ? "url(#neonBlur)" : "none"}
              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[7px]"
              onMouseEnter={() => setRadarHovered(0)}
              onMouseLeave={() => setRadarHovered(null)}
            />

            {/* Middle Ring: PENDING */}
            <circle
              cx="100"
              cy="100"
              r="52"
              fill="transparent"
              stroke="#22d3ee"
              strokeWidth="5"
              strokeDasharray="327"
              strokeDashoffset={327 - (327 * (data.statusData[1]?.percentage || 0)) / 100}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              filter={radarHovered === 1 ? "url(#neonBlur)" : "none"}
              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[7px]"
              onMouseEnter={() => setRadarHovered(1)}
              onMouseLeave={() => setRadarHovered(null)}
            />

            {/* Inner Ring: REJECTED */}
            <circle
              cx="100"
              cy="100"
              r="34"
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="5"
              strokeDasharray="214"
              strokeDashoffset={214 - (214 * (data.statusData[2]?.percentage || 0)) / 100}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              filter={radarHovered === 2 ? "url(#neonBlur)" : "none"}
              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[7px]"
              onMouseEnter={() => setRadarHovered(2)}
              onMouseLeave={() => setRadarHovered(null)}
            />
          </svg>

          {/* Central digital telemetry readouts inside concentric rings */}
          <div className="absolute flex flex-col items-center justify-center font-mono pointer-events-none select-none">
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider">CLR-EFF</span>
            <span className="text-lg font-bold text-white tracking-tighter futuristic-glow-text mt-0.5">
              {data.approvalRate}%
            </span>
            <span className="text-[8px] text-emerald-400 font-semibold tracking-widest">OK</span>
          </div>
        </div>

        {/* Legend / Metrics List */}
        <div className="space-y-2.5 font-mono text-[10px]">
          {data.statusData.map((item, idx) => (
            <div 
              key={idx} 
              onMouseEnter={() => setRadarHovered(idx)}
              onMouseLeave={() => setRadarHovered(null)}
              className={`flex justify-between items-center p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                radarHovered === idx 
                  ? "bg-slate-950 border-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.1)]" 
                  : "bg-black/10 border-slate-950 hover:bg-black/25"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${
                  item.status === "APPROVED" 
                    ? "bg-emerald-400 animate-pulse" 
                    : item.status === "PENDING" 
                    ? "bg-cyan-400" 
                    : "bg-rose-400"
                }`} />
                <span className="text-slate-300 font-bold">{item.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{item.count} REQS</span>
                <span className={`font-bold ${
                  item.status === "APPROVED" 
                    ? "text-emerald-400" 
                    : item.status === "PENDING" 
                    ? "text-cyan-400" 
                    : "text-rose-400"
                }`}>{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const theme = {
  colors: {
    // Status badge colors — bg + text pairs
    status: {
      pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
      approved: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
      active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
      rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
      suspended: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
      placed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
      preparing: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
      completed: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
      delivered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
      paid: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
      failed: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
      available: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
      occupied: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
      awaiting_payment: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
      cash: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
      card: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
      inactive: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-300" },
    } as Record<string, { bg: string; text: string; dot: string }>,

    // Role badge colors
    role: {
      admin: { bg: "bg-slate-900", text: "text-white" },
      kitchen: { bg: "bg-orange-100", text: "text-orange-700" },
      waiter: { bg: "bg-blue-100", text: "text-blue-700" },
      cashier: { bg: "bg-purple-100", text: "text-purple-700" },
    } as Record<string, { bg: string; text: string }>,
  },

  // Reusable className strings
  card: "rounded-2xl border border-slate-100/80 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300",
  pageWrapper: "min-h-screen p-8",
  sectionGap: "space-y-8",
  formGap: "space-y-5",

  // Buttons
  btn: {
    brand: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-550 hover:to-orange-650 text-white font-semibold shadow-md shadow-orange-500/20 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.95] active:translate-y-0 transition-all duration-300 ease-out border border-orange-600/20 hover:shadow-xl rounded-xl h-11 px-6",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-550 hover:to-red-650 text-white font-semibold shadow-md shadow-red-500/20 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.95] active:translate-y-0 transition-all duration-300 ease-out border border-red-600/20 hover:shadow-xl rounded-xl h-11 px-6",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.95] active:translate-y-0 transition-all duration-300 ease-out hover:shadow-sm rounded-xl h-11 px-6 font-medium",
  },

  // Sidebar
  sidebar: {
    wrapper: "w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm",
    logo: "px-6 py-6",
    nav: "flex-1 px-4 py-2 space-y-6 overflow-y-auto",
    navGroup: "flex flex-col gap-1",
    navGroupLabel: "px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest",
    linkBase: "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200",
    linkActive: "bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-700",
    footer: "mt-auto p-4 border-t border-slate-100",
    footerProfile: "flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20",
  },

  // Topbar
  topbar: "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6",

  // Table
  tableHeader: "text-xs font-medium text-slate-500 uppercase tracking-wider",
  tableRow: "border-b border-slate-100 hover:bg-slate-50 transition-colors",
} as const

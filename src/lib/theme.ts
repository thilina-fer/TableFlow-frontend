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
  card: "rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 transition-all duration-300",
  pageWrapper: "min-h-screen p-6",
  sectionGap: "space-y-6",
  formGap: "space-y-4",

  // Buttons
  btn: {
    brand: "bg-brand hover:bg-brand-hover text-white font-medium shadow-md shadow-brand/25 active:scale-95 transition-all duration-200",
    danger: "bg-red-500 hover:bg-red-600 text-white font-medium shadow-md shadow-red-500/25 active:scale-95 transition-all duration-200",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-95 transition-all duration-200",
  },

  // Sidebar
  sidebar: {
    wrapper: "w-60 min-h-screen bg-white border-r border-slate-200 flex flex-col",
    logo: "px-6 py-5 border-b border-slate-200",
    nav: "flex-1 px-3 py-4 space-y-1",
    linkBase: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors",
    linkActive: "bg-slate-100 text-slate-900",
    footer: "px-3 py-4 border-t border-slate-200",
  },

  // Topbar
  topbar: "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6",

  // Table
  tableHeader: "text-xs font-medium text-slate-500 uppercase tracking-wider",
  tableRow: "border-b border-slate-100 hover:bg-slate-50 transition-colors",
} as const

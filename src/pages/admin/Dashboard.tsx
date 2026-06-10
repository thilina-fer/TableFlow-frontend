import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Activity, Users, Download } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8 p-4 sm:p-6 lg:p-8">
      {/* Top Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Welcome Card - Premium Glassmorphism */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-slate-900 text-white border-0 shadow-2xl rounded-2xl group">
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
          <div className="absolute -bottom-20 right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 delay-100"></div>

          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

          <CardContent className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center h-full">
            <div className="max-w-lg">
              <h2 className="text-3xl font-medium text-slate-300 mb-2 tracking-tight">Welcome back 👋</h2>
              <h3 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent tracking-tight">Admin Team</h3>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed font-light">
                Manage your restaurant's performance, track active users, and monitor real-time analytics all from one elegant command center.
              </p>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-6 rounded-xl text-lg shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] hover:-translate-y-1">
                View Reports
              </Button>
            </div>

            <div className="hidden sm:block mt-8 sm:mt-0 relative w-56 h-56 perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-3xl transform rotate-6 opacity-80 shadow-2xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-xl rounded-3xl transform -rotate-3 border border-slate-700/50 shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                <Activity className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured App Card */}
        <Card className="relative overflow-hidden bg-slate-900 text-white border-0 min-h-[300px] shadow-2xl rounded-2xl group cursor-pointer hover:-translate-y-2 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-emerald-900 opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

          <CardContent className="relative z-10 p-8 h-full flex flex-col justify-end">
            <div className="bg-white/10 backdrop-blur-md self-start px-3 py-1.5 rounded-full mb-4 border border-white/20">
              <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase">Featured Update</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-emerald-300 transition-colors">
              TableFlow Analytics v2.0
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed opacity-90">
              Experience the new real-time dashboard with advanced metric tracking and beautiful visualizations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Metric 1 */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
          <div className="h-1 w-full bg-emerald-500 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center text-sm font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +2.6%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Active Users</h3>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">18,765</div>
            </div>

            {/* Smooth Mock Chart */}
            <div className="flex items-end gap-1.5 h-12 w-full mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
              {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500 transition-colors" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
          <div className="h-1 w-full bg-blue-500 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex items-center text-sm font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +0.2%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Installed</h3>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">4,876</div>
            </div>

            {/* Smooth Mock Chart */}
            <div className="flex items-end gap-1.5 h-12 w-full mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
              {[50, 30, 70, 60, 90, 40, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
          <div className="h-1 w-full bg-orange-500 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center text-sm font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                -0.1%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Downloads</h3>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">678</div>
            </div>

            {/* Smooth Mock Chart */}
            <div className="flex items-end gap-1.5 h-12 w-full mt-6 opacity-80 group-hover:opacity-100 transition-opacity">
              {[80, 60, 40, 70, 30, 50, 20].map((h, i) => (
                <div key={i} className="flex-1 bg-orange-500/20 rounded-t-sm hover:bg-orange-500 transition-colors" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}

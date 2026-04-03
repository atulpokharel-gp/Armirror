"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingBag, Camera, Sparkles, TrendingUp, Shield } from "lucide-react";

const STATS = [
  { label: "Total Users", value: "52,419", icon: Users, change: "+12% this month" },
  { label: "Products", value: "3,847", icon: ShoppingBag, change: "+234 this week" },
  { label: "AR Sessions", value: "128,391", icon: Camera, change: "+8% this week" },
  { label: "AI Try-Ons", value: "89,204", icon: Sparkles, change: "+15% this month" },
];

const RECENT_USERS = [
  { name: "Emma S.", email: "emma@example.com", role: "user", joined: "2 hours ago" },
  { name: "James K.", email: "james@example.com", role: "user", joined: "5 hours ago" },
  { name: "Priya M.", email: "priya@example.com", role: "admin", joined: "1 day ago" },
  { name: "Liu W.", email: "liu@example.com", role: "user", joined: "2 days ago" },
];

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Badge variant="destructive" className="flex items-center gap-1"><Shield size={11} /> Admin Only</Badge>
          </div>
          <p className="text-white/50">System overview and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, change }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Icon size={18} className="text-purple-400" />
                </div>
                <TrendingUp size={14} className="text-green-400 ml-auto" />
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-white/50 mt-0.5">{label}</p>
              <p className="text-xs text-green-400 mt-1">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-purple-400" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_USERS.map(({ name, email, role, joined }) => (
                <div key={email} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-white/40 truncate">{email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={role === "admin" ? "default" : "secondary"} className="text-[10px]">{role}</Badge>
                    <p className="text-xs text-white/30 mt-1">{joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-green-400" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { service: "API Server", status: "operational", latency: "42ms" },
              { service: "AI Body Model", status: "operational", latency: "1.2s" },
              { service: "AR Engine", status: "operational", latency: "85ms" },
              { service: "Database", status: "operational", latency: "12ms" },
              { service: "AI Stylist (GPT-4o)", status: "operational", latency: "1.8s" },
              { service: "Image Generation", status: "degraded", latency: "4.2s" },
            ].map(({ service, status, latency }) => (
              <div key={service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === "operational" ? "bg-green-400" : "bg-yellow-400"}`} />
                  <span className="text-sm">{service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">{latency}</span>
                  <Badge variant={status === "operational" ? "secondary" : "gold"} className="text-[10px]">
                    {status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

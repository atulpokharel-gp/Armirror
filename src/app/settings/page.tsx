"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { User, Bell, Shield, Palette } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-white/50 mb-8">Manage your account and preferences</p>

        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account"><User size={14} className="mr-1" /> Account</TabsTrigger>
            <TabsTrigger value="notifications"><Bell size={14} className="mr-1" /> Notifications</TabsTrigger>
            <TabsTrigger value="privacy"><Shield size={14} className="mr-1" /> Privacy</TabsTrigger>
            <TabsTrigger value="appearance"><Palette size={14} className="mr-1" /> Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(session?.user?.name ?? "U")}
                  </div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={session?.user?.name ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue={session?.user?.email ?? ""} disabled />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Min 8 characters" />
                </div>
                <Button variant="outline">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New AI Recommendations", desc: "Get notified when new items match your profile" },
                  { label: "Price Drops", desc: "Alert when saved items go on sale" },
                  { label: "Style Tips", desc: "Weekly AI-curated fashion tips" },
                  { label: "Trend Updates", desc: "Monthly trending fashion updates" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-white/40">{desc}</p>
                    </div>
                    <button className="relative w-10 h-5 rounded-full bg-purple-600 transition-colors">
                      <span className="absolute top-0.5 translate-x-5 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Data & Privacy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/60 text-sm">
                  We take your privacy seriously. Your body measurements and photos are encrypted and never shared with third parties.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">Download My Data</Button>
                  <Button variant="destructive" className="w-full justify-start">Delete My Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Theme & Display</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">Color Theme</Label>
                  <div className="flex gap-3">
                    {[
                      { name: "Purple", from: "#9333ea", to: "#ec4899" },
                      { name: "Ocean", from: "#0ea5e9", to: "#6366f1" },
                      { name: "Gold", from: "#f59e0b", to: "#ef4444" },
                    ].map(({ name, from, to }) => (
                      <button
                        key={name}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-12 h-12 rounded-xl border-2 border-purple-500"
                          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        />
                        <span className="text-xs text-white/60">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

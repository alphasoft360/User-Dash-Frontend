'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, ShieldCheck, Globe, Bell, Zap } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic uppercase">SYSTEM <span className="text-primary not-italic">Settings</span></h1>
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Global Environment Control & System Optimization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-card border-border rounded-[2.5rem] shadow-xl border-t-4 border-t-primary/20 overflow-hidden group hover:border-primary/40 transition-all">
                    <CardHeader className="p-8 border-b border-border bg-secondary/10">
                        <CardTitle className="text-lg font-black tracking-tight text-foreground uppercase italic flex items-center">
                            <Globe className="mr-3 h-5 w-5 text-primary" />
                            General Parameters
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">
                            Regional and display configurations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <Zap className="h-10 w-10 text-primary opacity-20 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">System modules initializing...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-[2.5rem] shadow-xl border-t-4 border-t-secondary overflow-hidden group hover:border-secondary/40 transition-all">
                    <CardHeader className="p-8 border-b border-border bg-secondary/10">
                        <CardTitle className="text-lg font-black tracking-tight text-foreground uppercase italic flex items-center">
                            <Bell className="mr-3 h-5 w-5 text-secondary" />
                            Notifications Flow
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">
                            Critical alert & dispatch settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <Settings className="h-10 w-10 text-secondary opacity-20 animate-spin-slow" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Awaiting protocol deployment...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-10 bg-primary/5 rounded-[3rem] border border-primary/10 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-foreground italic">Access Management Note</h3>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider mt-1 max-w-md">
                            User role elevation and permission scrubbing has been relocated to the <span className="text-primary font-black">User Identity</span> directory for unified management.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

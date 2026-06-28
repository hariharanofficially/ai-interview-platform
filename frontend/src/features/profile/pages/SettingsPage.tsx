import { Card, Button, Input } from '@components/ui';
import { Settings, Shield, Bell, Moon, Sun, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Settings className="text-primary-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-lg">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-500/10 text-primary-400 font-medium text-sm text-left">
            <UserCircle size={18} /> Account
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover font-medium text-sm text-left transition-colors">
            <Shield size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover font-medium text-sm text-left transition-colors">
            <Bell size={18} /> Notifications
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="p-8 border-surface-border">
            <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-primary-500 bg-primary-500/10 p-4 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Moon className="text-primary-400" size={24} />
                <span className="text-sm font-medium text-primary-400">Dark</span>
              </div>
              <div className="border border-surface-border bg-dark-900 hover:border-slate-500 p-4 rounded-xl flex flex-col items-center justify-center gap-3 cursor-not-allowed opacity-50">
                <Sun className="text-slate-500" size={24} />
                <span className="text-sm font-medium text-slate-500">Light (Soon)</span>
              </div>
              <div className="border border-surface-border bg-dark-900 hover:border-slate-500 p-4 rounded-xl flex flex-col items-center justify-center gap-3 cursor-not-allowed opacity-50">
                <Smartphone className="text-slate-500" size={24} />
                <span className="text-sm font-medium text-slate-500">System</span>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-surface-border">
            <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
            <div className="space-y-4 max-w-sm">
              <Input type="password" label="Current Password" />
              <Input type="password" label="New Password" />
              <Input type="password" label="Confirm New Password" />
              <Button className="mt-4">Update Password</Button>
            </div>
          </Card>

          <Card className="p-8 border-danger-500/20 bg-danger-500/5">
            <h3 className="text-lg font-semibold text-danger-500 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="destructive">Delete Account</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Add UserCircle icon import that was missed
import { UserCircle } from 'lucide-react';

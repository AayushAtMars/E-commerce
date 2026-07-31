import React, { useState, useEffect } from 'react';
import { catalogApi } from '../api/client';
import { Save, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function Settings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minimumOrderValue, setMinimumOrderValue] = useState(0);
  const [storeContactEmail, setStoreContactEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await catalogApi.get('/settings');
      const settings = res.data.data.settings;
      setMaintenanceMode(settings.maintenanceMode);
      setMinimumOrderValue(settings.minimumOrderValue);
      setStoreContactEmail(settings.storeContactEmail);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await catalogApi.patch('/admin/settings', {
        maintenanceMode,
        minimumOrderValue,
        storeContactEmail
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      setMessage('Failed to save settings. Check console.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Global Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage store-wide configurations and maintenance mode.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Maintenance Mode */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="p-2 bg-red-50 rounded-lg h-10 w-10 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-lg">
                Enable this to temporarily block users on the app from accessing the store. Useful during major upgrades.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        {/* Minimum Order Value */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center">
              <ShieldCheck className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Minimum Order Value (₹)</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-lg">
                The minimum cart total required for a user to proceed to checkout.
              </p>
            </div>
          </div>
          <div className="w-32">
            <input 
              type="number" 
              min="0"
              value={minimumOrderValue}
              onChange={(e) => setMinimumOrderValue(Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Store Contact Email */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="p-2 bg-purple-50 rounded-lg h-10 w-10 flex items-center justify-center">
              <Mail className="text-purple-500" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Store Contact Email</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-lg">
                The support email displayed on the app and sent in automated receipts.
              </p>
            </div>
          </div>
          <div className="w-64">
            <input 
              type="email" 
              required
              value={storeContactEmail}
              onChange={(e) => setStoreContactEmail(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}

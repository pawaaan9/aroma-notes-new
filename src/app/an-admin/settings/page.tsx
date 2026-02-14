"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { subscribeToSettings, saveSettings } from "@/lib/settings";
import Image from "next/image";

type Tab = "general" | "account" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // General settings state
  const [storeName, setStoreName] = useState("Aroma Notes");
  const [storeUrl, setStoreUrl] = useState("aromanotes.lk");
  const [currency, setCurrency] = useState("LKR");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Delivery fee from Firestore
  const [deliveryFee, setDeliveryFee] = useState<number>(350);
  const [deliveryFeeLoaded, setDeliveryFeeLoaded] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Account settings state
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setDisplayName(firebaseUser.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to delivery fee from Firestore
  useEffect(() => {
    const unsub = subscribeToSettings((s) => {
      setDeliveryFee(s.deliveryFee);
      setDeliveryFeeLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleSaveDeliveryFee = async () => {
    setSavingDelivery(true);
    try {
      await saveSettings({ deliveryFee });
      showMessage("success", "Delivery fee updated successfully");
    } catch {
      showMessage("error", "Failed to update delivery fee");
    } finally {
      setSavingDelivery(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      showMessage("success", "Profile updated successfully");
    } catch {
      showMessage("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password changed successfully");
    } catch {
      showMessage("error", "Failed to change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "general",
      label: "General",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: "account",
      label: "Account",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-saira">Settings</h1>
              <p className="text-sm text-white/70 font-saira">Manage your store and account settings</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Message banner */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-saira ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-gray-800/60 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all font-saira ${
              activeTab === tab.key
                ? "bg-white/10 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white font-saira mb-6">Store Information</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Store URL</label>
                  <input
                    type="text"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira [&>option]:bg-gray-800"
                  >
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl font-saira">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Delivery Charges */}
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white font-saira">Delivery Charges</h2>
                  <p className="text-xs text-gray-400 font-saira">Set the delivery fee applied to customer orders</p>
                </div>
              </div>

              <div className="max-w-sm">
                <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">
                  Delivery Fee (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-saira">
                    LKR
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={deliveryFeeLoaded ? deliveryFee : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setDeliveryFee(raw === "" ? 0 : Number(raw));
                    }}
                    placeholder="350"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-14 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 font-saira">
                  This amount will be added to every order at checkout. Set to 0 for free delivery.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleSaveDeliveryFee}
                  disabled={savingDelivery}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-saira"
                >
                  {savingDelivery ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Delivery Fee"
                  )}
                </button>
                {deliveryFeeLoaded && (
                  <span className="text-xs text-gray-500 font-saira">
                    Current: {deliveryFee === 0 ? "Free delivery" : `LKR ${deliveryFee.toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>

            {/* Branding */}
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white font-saira mb-6">Branding</h2>
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5">
                  <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white font-saira">Store Logo</p>
                  <p className="mt-1 text-xs text-gray-400 font-saira">
                    PNG or JPG, max 2MB. Used across the store and admin panel.
                  </p>
                  <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload New
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile */}
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white font-saira mb-6">Profile</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-gray-500 outline-none font-saira cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl disabled:opacity-60 font-saira"
                >
                  {saving ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white font-saira mb-6">Change Password</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300 font-saira">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-saira"
                >
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <h2 className="text-lg font-semibold text-red-400 font-saira mb-2">Danger Zone</h2>
              <p className="text-sm text-gray-400 font-saira mb-4">
                Irreversible actions. Be careful.
              </p>
              <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 font-saira">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white font-saira mb-6">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { label: "New Orders", desc: "Get notified when a new order is placed", defaultOn: true },
                { label: "Order Status Updates", desc: "Get notified when order status changes", defaultOn: true },
                { label: "Low Stock Alerts", desc: "Get notified when product stock is low", defaultOn: true },
                { label: "Customer Sign-ups", desc: "Get notified when a new customer registers", defaultOn: false },
                { label: "Weekly Reports", desc: "Receive weekly sales and performance reports", defaultOn: false },
              ].map((item) => (
                <NotificationToggle
                  key={item.label}
                  label={item.label}
                  description={item.desc}
                  defaultOn={item.defaultOn}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl font-saira">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div>
        <p className="text-sm font-medium text-white font-saira">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400 font-saira">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
          enabled ? "bg-amber-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

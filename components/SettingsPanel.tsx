'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SettingsPanelProps {
  userId: string;
  currentMobile?: string;
  currentImage?: string | null;
}

export default function SettingsPanel({ userId, currentMobile = '', currentImage }: SettingsPanelProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [mobile, setMobile] = useState(currentMobile);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage ?? '/photos/placeholder.png');
  const [message, setMessage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingMobile, setIsSavingMobile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [, startTransition] = useTransition();

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setProfilePhoto(null);
      return;
    }

    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUploadPhoto() {
    setMessage(null);

    if (!profilePhoto) {
      setMessage('Please choose a photo before uploading.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', profilePhoto);

      const response = await fetch('/api/users/profile', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Unable to upload photo.');
        return;
      }

      setMessage('Photo uploaded successfully.');
      setProfilePhoto(null);
      if (result.updated?.image) {
        setPreviewUrl(result.updated.image);
        // Update the session with the new image
        await update({ image: result.updated.image });
      }
      startTransition(() => router.refresh());
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleSaveMobile() {
    setMessage(null);
    setIsSavingMobile(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile })
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Unable to save mobile number.');
        return;
      }

      setMessage('Mobile number saved successfully.');
      startTransition(() => router.refresh());
    } finally {
      setIsSavingMobile(false);
    }
  }

  async function handleChangePassword() {
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Unable to change password.');
        return;
      }

      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      startTransition(() => router.refresh());
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Settings</h1>
          <p className="mt-3 text-slate-400">Update your profile picture, mobile number, and password from a single place.</p>
        </div>
      </div>

      {message && <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-sm text-cyan-100">{message}</div>}

      <div className="mt-8 grid gap-6">
        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Profile photo</h2>
              <p className="text-sm text-slate-400">Choose and upload a new profile photo.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
              <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <label className="cursor-pointer rounded-3xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200">
                Choose photo
                <input name="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={isUploadingPhoto}
                className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingPhoto ? 'Uploading…' : 'Upload photo'}
              </button>
            </div>
          </div>
          {profilePhoto && <span className="text-sm text-slate-400">Selected file: {profilePhoto.name}</span>}
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Mobile number</h2>
              <p className="text-sm text-slate-400">Save your mobile number for contact details.</p>
            </div>
            <button
              type="button"
              onClick={handleSaveMobile}
              disabled={isSavingMobile}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingMobile ? 'Saving…' : 'Save mobile'}
            </button>
          </div>
          <input
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="Enter mobile number"
            className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          />
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Change password</h2>
              <p className="text-sm text-slate-400">Use your current password to set a new one.</p>
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChangingPassword ? 'Changing…' : 'Change password'}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            />
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          />
        </section>
      </div>
    </div>
  );
}

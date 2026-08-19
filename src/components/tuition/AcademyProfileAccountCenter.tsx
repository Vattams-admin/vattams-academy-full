import { useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  profileCompletion,
  sanitizeProfilePatch,
  type AcademyProfile,
} from '@/lib/academyProfiles';

const DEMO_PROFILE: AcademyProfile = {
  id: 'student-demo',
  role: 'student',
  displayName: 'VATTAMS Student',
  email: 'student@example.com',
  phone: '',
  city: '',
  bio: '',
  avatarUrl: '',
  active: true,
  updatedAt: new Date().toISOString(),
};

export default function AcademyProfileAccountCenter({
  initialProfile = DEMO_PROFILE,
}: {
  initialProfile?: AcademyProfile;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone || '');
  const [city, setCity] = useState(profile.city || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [message, setMessage] = useState('');

  const completion = useMemo(
    () => profileCompletion(profile),
    [profile],
  );

  const save = () => {
    try {
      const patch = sanitizeProfilePatch({
        displayName,
        phone,
        city,
        bio,
        avatarUrl,
      });

      setProfile((current) => ({
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      }));
      setMessage('Profile changes saved in this interface.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to save profile.',
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <UserRound size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Account
              </p>
              <h2 className="text-2xl font-black mt-1">
                Profile & Account Management
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Maintain your Academy profile information without changing your account role.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 text-indigo-700 px-4 py-2 text-sm font-black">
            {profile.role.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.8fr_1.4fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound size={40} />
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="font-black">{profile.displayName}</p>
            <p className="text-sm text-slate-500 mt-1">{profile.email}</p>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs font-black">
              <span>Profile completion</span>
              <span>{completion}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-600"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 flex gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            <p className="text-sm text-emerald-900">
              Your account role is controlled by the authorized backend.
              Profile editing does not grant additional permissions.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Display Name"
              value={displayName}
              onChange={setDisplayName}
              icon={<UserRound size={16} />}
            />
            <ReadOnlyField
              label="Email"
              value={profile.email}
              icon={<Mail size={16} />}
            />
            <Field
              label="Phone"
              value={phone}
              onChange={setPhone}
              icon={<Phone size={16} />}
            />
            <Field
              label="City"
              value={city}
              onChange={setCity}
              icon={<MapPin size={16} />}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-black">Profile Photo URL</label>
            <div className="relative mt-2">
              <Camera
                size={16}
                className="absolute left-3 top-3.5 text-slate-400"
              />
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full rounded-xl border pl-10 pr-3 py-3"
                placeholder="Optional secure image URL"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-black">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full rounded-xl border px-3 py-3 mt-2 resize-y"
              placeholder="Tell students a little about you..."
            />
          </div>

          <button
            type="button"
            onClick={save}
            className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
          >
            <Save size={16} /> Save Profile
          </button>

          {message && (
            <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Account security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Email, role, approval status, employee/student IDs and other
              authorization-sensitive fields are not editable through this profile form.
              Password, session and authentication changes must remain in the
              existing authenticated account flow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <div className="relative mt-2">
        <span className="absolute left-3 top-3.5 text-slate-400">{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border pl-10 pr-3 py-3"
        />
      </div>
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <div className="relative mt-2">
        <span className="absolute left-3 top-3.5 text-slate-400">{icon}</span>
        <input
          value={value}
          readOnly
          className="w-full rounded-xl border bg-slate-50 pl-10 pr-3 py-3 text-slate-500"
        />
      </div>
    </label>
  );
}

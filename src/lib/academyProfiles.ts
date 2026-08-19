export type AcademyAccountRole = 'student' | 'tutor' | 'admin';

export type AcademyProfile = {
  id: string;
  role: AcademyAccountRole;
  displayName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  active: boolean;
  updatedAt: string;
};

export function validateDisplayName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80;
}

export function validatePhone(value: string) {
  const phone = value.trim();
  return phone === '' || /^[0-9+\-\s()]{7,20}$/.test(phone);
}

export function sanitizeProfilePatch(
  patch: Partial<Pick<AcademyProfile, 'displayName' | 'phone' | 'city' | 'bio' | 'avatarUrl'>>,
) {
  const next = {
    displayName: patch.displayName?.trim(),
    phone: patch.phone?.trim(),
    city: patch.city?.trim(),
    bio: patch.bio?.trim(),
    avatarUrl: patch.avatarUrl?.trim(),
  };

  if (next.displayName !== undefined && !validateDisplayName(next.displayName)) {
    throw new Error('Display name must contain 2 to 80 characters.');
  }

  if (next.phone !== undefined && !validatePhone(next.phone)) {
    throw new Error('Enter a valid phone number.');
  }

  return next;
}

export function canEditProfile(
  currentUserId: string,
  profileId: string,
  role: AcademyAccountRole,
) {
  if (!currentUserId || !profileId) return false;
  if (currentUserId === profileId) return true;
  return role === 'admin';
}

export function profileCompletion(profile: AcademyProfile) {
  const fields = [
    profile.displayName,
    profile.email,
    profile.phone,
    profile.city,
    profile.bio,
    profile.avatarUrl,
  ];

  return Math.round(
    (fields.filter((value) => Boolean(value?.trim())).length / fields.length) * 100,
  );
}

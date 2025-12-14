'use client';

import { useAuth } from '@/context/AuthContext';
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import AuthGuard from '../../auth-guard';

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard
            name={user?.name || 'Admin User'}
            email={user?.email || 'admin@example.com'}
            avatar={user?.avatar || '/images/user/default-avatar.png'} // Using a default avatar image
          />
          <UserInfoCard
            name={user?.name || 'Admin User'}
            email={user?.email || 'admin@example.com'}
            role={user?.role || 'admin'}
          />
        </div>
      </div>
    </div>
  );
}

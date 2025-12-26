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
      <div className="rounded-4xl border border-white/20 bg-white/5 p-5 lg:p-6">
        <h3 className="mb-5 text-lg font-bold text-white/80 py-2 px-6 w-fit bg-white/5 border border-white/20 rounded-2xl lg:mb-4">
          Profile
        </h3>
        <div className="space-y-4">
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

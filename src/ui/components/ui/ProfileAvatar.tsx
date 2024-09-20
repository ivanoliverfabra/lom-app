import React from 'react';

export default function ProfileAvatar({ profile }: { profile: Profile }) {
  const image = profile.avatar ? (
    <img src={profile.avatar} alt={profile.name} className='w-16 h-16 rounded-full' />
  ) : (
    <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center'>
      <span className='text-gray-500 text-2xl'>{profile.name[0]}</span>
    </div>
  );

  return image;
}

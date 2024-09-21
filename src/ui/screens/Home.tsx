import React from 'react';

import { useDialogStore } from 'src/providers/dialogStoreProvider';
import { useIPCStore } from 'src/providers/ipcStoreProvider';
import { useProfileStore } from 'src/providers/profileStoreProvider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from 'src/ui/components/ui/ContextMenu';

import ProfileAvatar from '../components/ui/ProfileAvatar';

function Home() {
  const setState = useIPCStore((store) => store.set);
  const profiles = useProfileStore((store) => store.profiles);
  setState('selecting-profile');

  const deleteProfile = useProfileStore((store) => store.delete);
  const selectProfile = useProfileStore((store) => store.select);

  const openDialog = useDialogStore((store) => store.open);

  return (
    <div className='bg-gray-900 text-white h-[calc(100vh-2.5rem)] flex flex-col items-center justify-center gap-16 rounded-b-lg overflow-hidden relative'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-medium mb-2'>Welcome to Legend of Mushroom</h1>
        <p className='text-lg'>Choose a profile to start playing</p>
      </div>

      <div className='flex justify-center w-[90%] h-56 overflow-x-auto pb-4'>
        <div className='flex gap-6 min-w-full justify-start'>
          {profiles.map((profile) => (
            <ContextMenu key={`profile-${profile.id}`}>
              <ContextMenuTrigger asChild>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    selectProfile(profile.id);
                  }}
                  className='p-3 gap-y-4 flex flex-col items-center justify-center rounded-lg text-center border border-gray-600 min-w-[200px] hover:bg-gray-800 focus:bg-gray-800 cursor-pointer'
                >
                  <ProfileAvatar profile={profile} />
                  <p className='text-sm truncate max-w-full'>{profile.name}</p>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    openDialog('update-profile', profile);
                    setState('editing-profile', profile.id);
                  }}
                >
                  Edit Profile
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setState('deleting-profile', profile.id);
                    deleteProfile(profile.id).then(() => {
                      setState('selecting-profile');
                    });
                  }}
                >
                  Delete Profile
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          <button
            className='hover:bg-gray-800 focus:bg-gray-800 p-3 flex flex-col items-center justify-center rounded-lg text-center border border-gray-600 min-w-[200px]'
            type='button'
            onClick={() => {
              openDialog('create-profile');
              setState('creating-profile');
            }}
          >
            <div className='w-16 h-16 rounded-full bg-gray-600 mx-auto mb-4 flex items-center justify-center'>
              <svg width='20' height='20' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M5.9883 9.1325e-05C5.79 0.00319121 5.60103 0.0848426 5.46286 0.227126C5.32469 0.36941 5.24862 0.560701 5.25133 0.759015V5.25114H0.75933C0.660122 5.24974 0.561626 5.26807 0.469563 5.30507C0.377501 5.34206 0.293709 5.39698 0.223057 5.46665C0.152406 5.53631 0.0963039 5.61932 0.0580112 5.71085C0.0197186 5.80238 0 5.90061 0 5.99983C0 6.09905 0.0197186 6.19728 0.0580112 6.28882C0.0963039 6.38035 0.152406 6.46336 0.223057 6.53302C0.293709 6.60268 0.377501 6.6576 0.469563 6.6946C0.561626 6.73159 0.660122 6.74992 0.75933 6.74852H5.25133V11.2406C5.24993 11.3399 5.26826 11.4384 5.30525 11.5304C5.34225 11.6225 5.39717 11.7063 5.46683 11.7769C5.53649 11.8476 5.61949 11.9037 5.71102 11.942C5.80255 11.9803 5.90078 12 6 12C6.09922 12 6.19744 11.9803 6.28897 11.942C6.3805 11.9037 6.46351 11.8476 6.53317 11.7769C6.60283 11.7063 6.65775 11.6225 6.69475 11.5304C6.73174 11.4384 6.75007 11.3399 6.74867 11.2406V6.74852H11.2407C11.3399 6.74992 11.4384 6.73159 11.5304 6.6946C11.6225 6.6576 11.7063 6.60268 11.7769 6.53302C11.8476 6.46336 11.9037 6.38035 11.942 6.28882C11.9803 6.19728 12 6.09905 12 5.99983C12 5.90061 11.9803 5.80238 11.942 5.71085C11.9037 5.61932 11.8476 5.53631 11.7769 5.46665C11.7063 5.39698 11.6225 5.34206 11.5304 5.30507C11.4384 5.26807 11.3399 5.24974 11.2407 5.25114H6.74867V0.759015C6.75004 0.658849 6.7313 0.559426 6.69355 0.466633C6.65581 0.373841 6.59983 0.289565 6.52892 0.218798C6.45802 0.148031 6.37364 0.0922112 6.28078 0.0546441C6.18792 0.017077 6.08846 -0.00147314 5.9883 9.1325e-05Z'
                  fill='white'
                />
              </svg>
            </div>
            <h3 className='text-sm'>New Account</h3>
          </button>
        </div>
      </div>

      <button
        className='absolute bottom-4 left-4 text-blue-400 focus:outline-none bg-gray-800 px-4 py-2 rounded-lg focus:bg-gray-700 hover:bg-gray-700'
        onClick={() => selectProfile('guest')}
      >
        Guest mode
      </button>
    </div>
  );
}

export default Home;

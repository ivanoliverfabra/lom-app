/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import { useDialogStore } from 'src/providers/dialogStoreProvider';
import { useProfileStore } from 'src/providers/profileStoreProvider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'src/ui/components/ui/Dialog';

import { Button } from './ui/Button';
import Input from './ui/Input';

function CreateProfileDialog() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<File>(null);
  const [error, setError] = useState('');

  const createProfile = useProfileStore((state) => state.create);
  const isOpen = useDialogStore((state) => state.isOpen);
  const close = useDialogStore((state) => state.close);

  return (
    <Dialog open={isOpen === 'create-profile'} onOpenChange={() => close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new profile</DialogTitle>
          <DialogDescription>Profiles are used to store your accounts and data separately.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            try {
              e.preventDefault();
              createProfile(name, image?.path).then((r) => {
                if (typeof r === 'string') {
                  setError(r);
                } else {
                  close();
                  setName('');
                }
              });
            } catch (err) {
              console.error(err);
              if (err instanceof Error) {
                setError(err.message);
              }

              setError('An error occurred while creating the profile.');
            }
          }}
        >
          {error && <span className='text-sm text-red-500'>{error}</span>}
          <Input
            id='profile-name'
            label='Profile name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {image ? (
            <div className='w-full flex items-center justify-center gap-2 mt-2'>
              <img src={URL.createObjectURL(image)} alt='Profile avatar' className='w-24 h-24 rounded-full' />
              <Button variant='danger' onClick={() => setImage(null)}>
                Remove
              </Button>
            </div>
          ) : (
            <Input
              id='profile-avatar'
              label='Profile avatar'
              type='file'
              required={false}
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImage(file);
              }}
            />
          )}
          <div className='w-full flex justify-end mt-3 gap-1.5'>
            <Button variant='secondary' onClick={() => close()}>
              Cancel
            </Button>
            <Button type='submit'>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditProfileDialog() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const updateProfile = useProfileStore((state) => state.update);
  const isOpen = useDialogStore((state) => state.isOpen);
  const close = useDialogStore((state) => state.close);
  const data = useDialogStore((state) => state.data);

  if (!data?.name || !('id' in data)) return null;

  return (
    <Dialog open={isOpen === 'update-profile'} onOpenChange={() => close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile {data?.name}</DialogTitle>
          <DialogDescription>
            Profiles are used to store your accounts and data separately. You can change the name of the profile here.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            if (!('id' in data)) return;
            e.preventDefault();
            updateProfile(data.id, { name }).then((r) => {
              if (r) {
                close();
                setName('');
              }
            });
          }}
        >
          {error && <span className='text-sm text-red-500'>{error}</span>}
          <Input
            id='profile-name'
            label='Profile name'
            defaultValue={data.name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <div className='w-full flex justify-end mt-3 gap-1.5'>
            <Button variant='secondary' onClick={() => close()}>
              Cancel
            </Button>
            <Button type='submit'>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dialogs() {
  return (
    <>
      <CreateProfileDialog />
      <EditProfileDialog />
    </>
  );
}

import { createStore } from 'zustand/vanilla';

import { ProfileChannels } from 'src/channels/profileChannels';

export type ProfileState = {
  profiles: Profile[];
};

export type ProfileActions = {
  create: (name: string, avatar?: string) => Promise<Profile | string>;
  delete: (id: number) => Promise<boolean>;
  update: (id: number, data: Profile<['name']>, avatar?: string) => Promise<boolean>;
  select: (id: number | 'guest') => void;
};

export type ProfileStore = ProfileState & ProfileActions;

export const defaultInitState: ProfileState = {
  profiles: [],
};

export const createProfileStore = (initState: ProfileState = defaultInitState) => {
  const store = createStore<ProfileStore>()(() => ({
    ...initState,
    create: (name, avatar) => {
      return new Promise((resolve) => {
        electron.ipcRenderer
          .invoke<Profile | null>(ProfileChannels.CREATE_PROFILE, { name }, avatar)
          .then((profile) => {
            if (!profile) {
              resolve('The profile could not be created.');
              return;
            }
            store.setState((state) => ({ profiles: [...state.profiles, profile] }));
            resolve(profile);
          });
      });
    },
    delete: (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this profile?');
      if (!confirmed) return Promise.resolve(false);

      return new Promise((resolve) => {
        electron.ipcRenderer.invoke<boolean>(ProfileChannels.DELETE_PROFILE, id).then((success: boolean) => {
          if (success) {
            store.setState((state) => ({ profiles: state.profiles.filter((profile) => profile.id !== id) }));
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    },
    update: (id, data, avatar) => {
      if (!data.name) return Promise.resolve(false);
      if (data.name.length === 0) return Promise.resolve(false);
      if (data.name.length < 3) return Promise.resolve(false);
      if (data.name.length > 32) return Promise.resolve(false);

      return new Promise((resolve) => {
        electron.ipcRenderer
          .invoke<boolean>(ProfileChannels.UPDATE_PROFILE, { id, ...data }, avatar)
          .then((success) => {
            if (success) {
              store.setState((state) => ({
                profiles: state.profiles.map((profile) => (profile.id === id ? { ...profile, ...data } : profile)),
              }));
              resolve(true);
            } else {
              resolve(false);
            }
          });
      });
    },
    select: (id) => {
      if (id === 'guest') {
        electron.ipcRenderer.invoke(ProfileChannels.SELECT_GUEST_PROFILE);
        return;
      }
      electron.ipcRenderer.invoke<boolean>(ProfileChannels.SELECT_PROFILE, id).then((success) => {
        if (success) {
          store.setState((state) => {
            return {
              profiles: [
                state.profiles.find((profile) => profile.id === id),
                ...state.profiles.filter((profile) => profile.id !== id),
              ].filter((profile) => profile),
            };
          });
        }
      });
    },
  }));

  electron.ipcRenderer.invoke<Profile[]>(ProfileChannels.GET_PROFILES).then((profiles) => {
    store.setState({ profiles });
  });

  return store;
};

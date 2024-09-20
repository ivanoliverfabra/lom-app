import { app, BrowserWindow, ipcMain, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import { createAppWindow } from 'src/appWindow';
import { ProfileChannels } from 'src/channels/profileChannels';
import { db } from 'src/main';

export const getPath = (name: string) => path.join(app.getPath('userData'), name);

async function saveAvatar(avatarPath: string, userId: number) {
  if (!fs.existsSync(avatarPath)) {
    return false;
  }

  const avatarsPath = getPath('images/avatars');
  if (!fs.existsSync(avatarsPath)) {
    fs.mkdirSync(avatarsPath, {
      recursive: true,
    });
  }

  const ext = avatarPath.split('.').pop();

  const newPath = getPath(`images/avatars/${userId}.${ext}`);
  fs.copyFileSync(avatarPath, newPath);
  return `atom://images/avatars/${userId}.${ext}`;
}

async function deleteAvatar(avatarPath: string) {
  if (!avatarPath) {
    return;
  }

  fs.unlinkSync(getPath(avatarPath.replace('atom://', '')));
}

export function registerProfileIPC(_window: BrowserWindow) {
  ipcMain.handle(ProfileChannels.GET_PROFILES, async () => {
    return new Promise((resolve, reject) => {
      db.all<Profile>('SELECT * FROM profiles ORDER BY last_used DESC', (err, docs) => {
        if (err) {
          reject([]);
        } else {
          resolve(docs);
        }
      });
    });
  });

  ipcMain.handle(ProfileChannels.CREATE_PROFILE, async (_, profile: Profile<['name']>, avatar?: string) => {
    console.info('Creating profile', profile);
    if (!profile.name) return null;
    if (profile.name.length < 3) return null;
    if (profile.name.length > 32) return null;

    return new Promise((resolve) => {
      db.run('INSERT INTO profiles (name) VALUES (?)', [profile.name], (err) => {
        if (err) {
          resolve(null);
        }

        db.get<Profile>('SELECT * FROM profiles WHERE id = last_insert_rowid()', (err, doc) => {
          if (err) {
            resolve(null);
          } else {
            if (avatar) {
              saveAvatar(avatar, doc.id).then((path) => {
                if (path) {
                  db.run('UPDATE profiles SET avatar = ? WHERE id = ?', [path, doc.id]);

                  resolve({ ...doc, avatar: path });
                } else {
                  resolve(doc);
                }
              });
            } else {
              resolve(doc);
            }
          }
        });
      });
    });
  });

  ipcMain.handle(ProfileChannels.DELETE_PROFILE, async (_, id: number) => {
    return new Promise((resolve) => {
      db.get<Profile>('SELECT * FROM profiles WHERE id = ?', [id], (err, doc) => {
        if (err) {
          resolve(false);
        }

        db.run('DELETE FROM profiles WHERE id = ?', [id], (err) => {
          if (err) {
            resolve(false);
          }

          deleteAvatar(doc.avatar);

          const sessionPartition = `persist:${id}`;
          session.fromPartition(sessionPartition).clearStorageData();

          resolve(true);
        });
      });
    });
  });

  ipcMain.handle(ProfileChannels.UPDATE_PROFILE, async (_, profile: Profile<['name', 'id']>, avatar: string) => {
    return new Promise((resolve) => {
      if (!profile.name) {
        resolve(false);
      }

      db.run('UPDATE profiles SET name = ? WHERE id = ?', [profile.name, profile.id], (err) => {
        if (err) {
          resolve(false);
        }

        if (avatar) {
          saveAvatar(avatar, profile.id).then((path) => {
            if (path) {
              db.run('UPDATE profiles SET avatar = ? WHERE id = ?', [path, profile.id]);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        }
      });
    });
  });

  ipcMain.handle(ProfileChannels.SELECT_PROFILE, async (_, id: number) => {
    return new Promise((resolve) => {
      db.get<Profile>('SELECT * FROM profiles WHERE id = ?', [id], (err) => {
        if (err) {
          resolve(false);
        }

        db.run('UPDATE profiles SET last_used = ? WHERE id = ?', [Date.now(), id], (err) => {
          if (err) {
            resolve(false);
          }

          createAppWindow('new-instance', id);
          resolve(true);
        });
      });
    });
  });

  ipcMain.handle(ProfileChannels.SELECT_GUEST_PROFILE, async (_) => {
    createAppWindow('guest-instance');
    return true;
  });
}

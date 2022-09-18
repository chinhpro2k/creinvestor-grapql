import { get } from 'lodash';
import { parseJwt } from './common';
export type UserCB = (user: User | null, error: any) => void;

const userEmail = `admin@example.com`;
const userPassword = 'admin123';

export type User = {
  name: string;
  token: string;
};

export class Auth {
  user: User | null;

  error: { message: string } | null;

  cb: UserCB;

  constructor() {
    this.user = null;
    this.error = null;
  }

  onAuthStateChanged(cb: UserCB) {
    this.cb = cb;
    return this;
  }

  protected onUserChange(user: User | null, error?: { message: string }) {
    this.cb && this.cb(user, error);
  }

  signIn(accessToken: string) {
    return new Promise(async (resolve, reject) => {
      this.user = null;
      if (typeof window !== 'undefined' && accessToken) {
        const tokenData = parseJwt(accessToken);
        const lastName = get(tokenData, 'last_name', '');
        const name =
          get(tokenData, 'first_name', '') + (lastName ? ' ' + lastName : '');
        this.user = {
          name,
          token: accessToken,
        };
        window.localStorage.setItem('user', JSON.stringify(this.user));
        resolve(this.user);
      }
      // this.onUserChange(this.user)
      reject(null);
    });
  }

  signOut() {
    window.localStorage.removeItem('user');
    this.user = null;
    this.onUserChange(this.user);
  }

  resolveUser() {
    if (typeof window !== 'undefined') {
      const signedInUser = window.localStorage.getItem('user');
      if (signedInUser) {
        this.user = JSON.parse(signedInUser);
      }
    } else {
      this.user = null;
    }
    this.onUserChange(this.user);
    return this;
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const signedInUser = window.localStorage.getItem('user');
      if (signedInUser) {
        return JSON.parse(signedInUser);
      }
    }
    return null;
  }
}

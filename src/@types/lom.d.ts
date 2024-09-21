type BaseDataCFRequest = {
  osid: string;
  os: string;
  osver: string;
  did: string;
  gameid: string;
  pt: string;
  appver: string;
  sdkver: string;
  dev: string;
  devtype: string;
  screen: string;
  cid: string;
  oid: string;
  aid: string;
  rid: string;
  sdkbuild: string;
  rectime: string;
  mno?: string;
  nm?: string;
  brand?: string;
  ip?: string;
  rawlog2?: string;
  rawlog10?: string;
  rawlog12?: string;
  mediaSource?: string;
  from?: string;
};

type Nullable<T extends string | number | boolean, U extends boolean> = U extends true ? T | undefined : T;

type UserRoleData<U extends boolean = false> = {
  uid: string;
  username: string;
  roleid: Nullable<string, U>;
  rolename: Nullable<string, U>;
  rolelevel: Nullable<string, U>;
  server: Nullable<string, U>;
  servername: Nullable<string, U>;
};

type EventBase = {
  event: string;
  eventname: string;
  eventvalue: string;
};

type EnterGameEvent = EventBase & {
  eventname: 'Enter_Game';
  eventvalue: string;
} & UserRoleData;

type LoginEvent = EventBase & {
  eventname: 'Login';
  eventvalue: string;
};

type ServerEvent = EventBase & {
  eventname: 'Server';
  eventvalue: string;
} & UserRoleData<true>;

type InitJsEvent = EventBase & {
  eventname: 'init_js_start' | 'load_js_start' | 'load_js_succ' | 'init_succ';
};

type SpecificEvent = EnterGameEvent | LoginEvent | ServerEvent | InitJsEvent;

type DataCFRequest = BaseDataCFRequest & SpecificEvent;

type Instance = {
  window: BrowserWindow | null;
  profile: Profile | null;
  user: UserRoleData | null;
};

type IPCState = 'creating-profile' | 'editing-profile' | 'deleting-profile' | 'selecting-profile' | 'loading-profiles';

type BaseProfile = {
  id: number;
  name: string;
  avatar: string;
  created_at: string;
  last_used: string;
};

type Profile<Include extends keyof BaseProfile | Array<keyof BaseProfile> | undefined = undefined> =
  Include extends undefined
    ? BaseProfile
    : Include extends Array<keyof BaseProfile>
      ? Pick<BaseProfile, Include[number]>
      : Include extends keyof BaseProfile
        ? Pick<BaseProfile, Include>
        : BaseProfile;

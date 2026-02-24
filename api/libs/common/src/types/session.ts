export type Audience = 'Identity';

export type AuthUser = {
  id: string;
  aud: Audience;
  email: string;
  session: string;
};

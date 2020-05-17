type Whitelist = {
  address: string;
  comment?: string;
  state: string;
};
type RACM = 'GET' | 'POST' | 'DELETE' | 'PATCH';

type Conduit = {
  id: number;
  suriApiKey: string;
  suriType: string;
  suri: string;
  whitelist: Array<Whitelist> | [];
  racm: Array<RACM>;
  status: string;
  description?: string;
};

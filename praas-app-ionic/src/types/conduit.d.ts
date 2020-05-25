type Whitelist = {
  address: string;
  comment?: string;
  state: string;
};
type RequestAccessMethods = 'GET' | 'POST' | 'DELETE' | 'PATCH';

type Conduit = {
  id: number;
  suriApiKey: string;
  suriType: string;
  suri: string;
  whitelist: Array<Whitelist> | [];
  racm: Array<RequestAccessMethods>;
  status: string;
  description?: string;
};

type Allowlist = {
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
  curi: string;
  allowlist: Array<Allowlist> | [];
  racm: Array<RequestAccessMethods>;
  status: string;
  description?: string;
};

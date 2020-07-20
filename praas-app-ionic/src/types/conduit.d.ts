type RequestAccessMethods = 'GET' | 'POST' | 'DELETE' | 'PATCH';

type Conduit = {
  id: number;
  suriApiKey: string;
  suriType: string;
  suri: string;
  curi: string;
  racm: Array<RequestAccessMethods>;
  status: string;
  description?: string;
};

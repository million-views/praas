import { ConduitBaseData, ConduitGetResponse, Validity } from '../App';

const API = {
  create: async (data: ConduitBaseData, conduitURI: string) => {
    const response = await fetch(`http://${conduitURI}:5000`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: data,
          },
        ],
      }),
    });
    return response;
  },
  update: async (
    id: string,
    data: { valid: keyof typeof Validity },
    conduitURI: string
  ) => {
    const response = await fetch(`http://${conduitURI}:5000`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id,
            fields: data,
          },
        ],
      }),
    });
    const responseJSON = await response.json();
    return responseJSON.records;
  },
  get: async (conduitURI: string) => {
    const response = await fetch(`http://${conduitURI}:5000`, {
      method: 'GET',
    });
    const responseJSON: ConduitGetResponse = await response.json();
    return responseJSON.records;
  },
  getAll: () => {},
};

export default API;

import axios from 'axios';

export const signup = async (user: any) => {
  try {
    const response = await axios.post(
      'http://localhost:4000/users',
      { user },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {}
};

export default {};

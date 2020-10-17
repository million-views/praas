import { Validity } from '../App';

const markValidOrInvalid = () => {
  if (Boolean(Math.floor(Math.random() * 100) % 2)) {
    return Validity.INVALID;
  }
  return Validity.VALID;
};

export { markValidOrInvalid };

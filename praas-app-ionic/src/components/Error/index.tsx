import React from 'react';

type Props = {
  message?: string | React.ReactElement;
};
const Error: React.FC<Props> = ({ message }) => {
  return <div className="error">{message}</div>;
};

export default Error;

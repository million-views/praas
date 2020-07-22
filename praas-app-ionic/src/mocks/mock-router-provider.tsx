import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MemoryRouterProps } from 'react-router';

export const MockRouterProvider: React.FC<MemoryRouterProps> = ({
  children,
  ...restProps
}) => {
  return <MemoryRouter {...restProps}>{children}</MemoryRouter>;
};

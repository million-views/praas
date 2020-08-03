import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export function MockRouterProvider({ children, ...restProps }) {
  return <MemoryRouter {...restProps}> {children} </MemoryRouter>;
};

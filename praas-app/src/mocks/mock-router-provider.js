import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export function MockRouterProvider({ children }) {
  return <MemoryRouter> {children} </MemoryRouter>;
};

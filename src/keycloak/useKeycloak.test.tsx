import { renderHook } from '@testing-library/react';
import useKeycloak from './useKeycloak';
import React from 'react';

describe('The useKeycloak hook should', () => {
  it('initializes when context given', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => ({}));
    renderHook(useKeycloak);
  });

  it('fails when context is not defined', () => {
    jest.spyOn(React, 'useContext').mockReturnValue(undefined);
    expect(() => renderHook(useKeycloak)).toThrow(Error);
  });
});

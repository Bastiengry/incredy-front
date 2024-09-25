import '@testing-library/jest-dom';

const originalConsoleError = console.error;
console.error = function (...data: any[]) {
  if (
    typeof data[0]?.toString === 'function' &&
    data[0].toString().includes('Error: Could not parse CSS stylesheet')
  )
    return;
  if (data) {
    originalConsoleError(...data);
  }
};

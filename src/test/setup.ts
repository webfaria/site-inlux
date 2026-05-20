import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create mock functions with proper typing
const mockGetItem = vi.fn((key: string) => null);
const mockSetItem = vi.fn((key: string, value: string) => {});
const mockRemoveItem = vi.fn((key: string) => {});
const mockClear = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: mockGetItem,
  setItem: mockSetItem,
  removeItem: mockRemoveItem,
  clear: mockClear,
  get length() { return 0; },
  key: vi.fn(),
} as unknown as Storage;

vi.stubGlobal('localStorage', localStorageMock);

// Mock window.location
const locationMock = {
  assign: vi.fn(),
  reload: vi.fn(),
};
vi.stubGlobal('location', locationMock);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

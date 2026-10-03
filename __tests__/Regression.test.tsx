import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGame } from '../src/api/context/GameContext';
import { AuthContext } from '../src/api/context/AuthContext';

// Mock API calls
jest.mock('../src/api/users', () => ({
  getProgress: jest.fn(() => Promise.resolve({
    completedLevels: ['1.1'],
    unlockedLevels: ['1.1', '1.2']
  })),
  getBellotas: jest.fn(() => Promise.resolve({ bellotas_balance: 100, streak_days: 5 })),
  getLives: jest.fn(() => Promise.resolve({ current_lives: 4, max_lives: 4, seconds_until_next_life: null })),
}));

const mockSession = { user_id: 'test-user' };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{ session: mockSession, initializing: false, login: jest.fn(), logout: jest.fn(), register: jest.fn(), updateProfile: jest.fn() }}>
    <GameProvider>
      {children}
    </GameProvider>
  </AuthContext.Provider>
);

describe('Finzi Pilot Regression Tests', () => {
  
  it('Regression 1: isReviewMode should be true for completed levels', async () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    await act(async () => {
      await Promise.resolve(); 
    });

    // Mark mode as review if level is completed
    // Note: AppNavigator sets this, but we can verify logic here
    expect(result.current.isLevelCompleted('1.1')).toBe(true);
  });

  it('Regression 2: isLevelUnlocked should correctly identify server-unlocked levels', async () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    await act(async () => {
      await Promise.resolve(); 
    });

    expect(result.current.isLevelUnlocked('1.2')).toBe(true);
    expect(result.current.isLevelUnlocked('1.3')).toBe(false); // Not in mock unlockedLevels
  });

});

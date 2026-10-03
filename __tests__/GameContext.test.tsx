import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGame } from '../src/api/context/GameContext';
import { AuthContext } from '../src/api/context/AuthContext';

// Mock getProgress to return specific data
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

describe('GameContext Regression Tests', () => {
  it('should identify a level as unlocked if it is in the unlockedLevelIds from server', async () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    // Wait for initial load
    await act(async () => {
      await Promise.resolve(); 
    });

    // Check if 1.2 is unlocked (assuming mock worked)
    // Note: In real test we'd need to ensure refreshProgress was called
    expect(result.current.isLevelUnlocked('1.2')).toBe(true);
  });
});

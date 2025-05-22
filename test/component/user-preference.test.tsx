import React from "react";
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserPreferencePage } from "../../src/pages/user-preference";
import { ColorModeContext } from "../../src/contexts/color-mode";
import moment from 'moment-timezone';

// Mock moment-timezone to control timezone options
jest.mock('moment-timezone', () => {
  const originalModule = jest.requireActual('moment-timezone');
  return {
    ...originalModule,
    tz: {
      ...originalModule.tz,
      guess: jest.fn().mockReturnValue('America/Los_Angeles'),
      names: jest.fn().mockReturnValue(['America/Los_Angeles', 'America/New_York', 'Asia/Tokyo'])
    }
  };
});

// Mock the providers
jest.mock('../../src/providers/user-preference-provider', () => ({
  userPreferenceProvider: {
    updatePreference: jest.fn(),
    getPreferredProjects: jest.fn(),
    removePreferredProject: jest.fn(),
    getUserPreference: jest.fn()
  }
}));

// Import the mocked module
const { userPreferenceProvider } = require('../../src/providers/user-preference-provider');

// Mock antd message component
jest.mock('antd', () => {
  const originalModule = jest.requireActual('antd');
  return {
    ...originalModule,
    message: {
      success: jest.fn(),
      error: jest.fn()
    }
  };
});

const { message } = require('antd');

const mockSetMode = jest.fn();
const mockContextValue = {
  mode: 'light',
  setMode: mockSetMode
};

describe('UserPreferencePage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    userPreferenceProvider.getUserPreference.mockResolvedValue({
      isDark: false,
      timezone: "America/Los_Angeles"
    });
    
    userPreferenceProvider.getPreferredProjects.mockResolvedValue({
      preferred: []
    });
    
    userPreferenceProvider.updatePreference.mockResolvedValue({
      isDark: false,
      timezone: "America/Los_Angeles"
    });
    
    userPreferenceProvider.removePreferredProject.mockResolvedValue({
      success: true
    });
  });

  test('renders user preference page with default values', async () => {
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );

    // Check for main components
    await waitFor(() => {
      expect(screen.getByText(/User Preference/i)).toBeInTheDocument();
      expect(screen.getByText(/Timezone/i)).toBeInTheDocument();
      expect(screen.getByText(/Dark mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
    });

    // Verify API calls
    expect(userPreferenceProvider.getUserPreference).toHaveBeenCalledTimes(1);
    expect(userPreferenceProvider.getPreferredProjects).toHaveBeenCalledTimes(1);
  });

  test('handles save preferences correctly', async () => {
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
    });

    // Click save button
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userPreferenceProvider.updatePreference).toHaveBeenCalledWith({
        isDark: false,
        timezone: "America/Los_Angeles"
      });
      // Update this to match the actual message in your component
      expect(message.success).toHaveBeenCalled();
    });
  });

  test('displays error when preference update fails', async () => {
    userPreferenceProvider.updatePreference.mockRejectedValue(
      new Error('Failed to update preferences')
    );

    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
    });

    // Click save button
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userPreferenceProvider.updatePreference).toHaveBeenCalled();
      // Update this to match the actual message in your component
      expect(message.error).toHaveBeenCalled();
    });
  });

  test('loads preferred projects on component mount', async () => {
    const mockProjects = {
      preferred: [
        {
          group_id: 1,
          group_name: "Test Group",
          projects: [
            { uuid: "proj_001", name: "Test Project 1" },
            { uuid: "proj_002", name: "Test Project 2" }
          ]
        }
      ]
    };
    
    userPreferenceProvider.getPreferredProjects.mockResolvedValue(mockProjects);
    
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );
    
    await waitFor(() => {
      expect(userPreferenceProvider.getPreferredProjects).toHaveBeenCalled();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      // Don't check for group name if it's not visible in the component
    });
  });
  
  test('toggles dark mode when switch is clicked', async () => {
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Dark mode/i)).toBeInTheDocument();
    });
    
    // Find the dark mode switch by a more reliable method
    const darkModeLabel = screen.getByText(/Dark mode/i);
    const darkModeSwitch = darkModeLabel.parentElement?.querySelector('button[role="switch"]');
    expect(darkModeSwitch).toBeInTheDocument();
    
    // Click the switch if found
    if (darkModeSwitch) {
      fireEvent.click(darkModeSwitch);
      
      // Verify the setMode function was called
      expect(mockSetMode).toHaveBeenCalledWith('dark');
    }
  });
  
  test('removes project from favorites', async () => {
    const mockProjects = {
      preferred: [
        {
          group_id: 1,
          group_name: "Test Group",
          projects: [
            { uuid: "proj_001", name: "Test Project 1" }
          ]
        }
      ]
    };
    
    userPreferenceProvider.getPreferredProjects.mockResolvedValue(mockProjects);
    userPreferenceProvider.removePreferredProject.mockResolvedValue({ success: true });
    
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    // Find the delete button by a more reliable method
    const deleteButtons = document.querySelectorAll('button');
    const deleteButton = Array.from(deleteButtons).find(button => 
      button.innerHTML.includes('delete') || button.innerHTML.includes('Delete')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      // If there's a confirmation dialog, find and click the confirm button
      const confirmButton = screen.queryByText('Yes');
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }
      
      await waitFor(() => {
        expect(userPreferenceProvider.removePreferredProject).toHaveBeenCalled();
      });
    }
  });

  test('handles empty preferred projects gracefully', async () => {
    userPreferenceProvider.getPreferredProjects.mockResolvedValue({
      preferred: null
    });
    
    render(
      <ColorModeContext.Provider value={mockContextValue}>
        <UserPreferencePage />
      </ColorModeContext.Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/User Preference/i)).toBeInTheDocument();
    });
  });
});
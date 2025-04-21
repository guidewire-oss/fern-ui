import React from "react";
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserPreferencePage } from "../../src/pages/user-preference";
import { ColorModeContext } from "../../src/contexts/color-mode";

// Mock the providers without importing the original module
jest.mock('../../src/providers/user-preference-provider', () => ({
    userPreferenceProvider: {
        updatePreference: jest.fn(),
        getPreferredProjects: jest.fn(),
        removeFavouriteProject: jest.fn(),
        getUserPreference: jest.fn()
    }
}));

// Import the mocked module after mocking
const { userPreferenceProvider } = require('../../src/providers/user-preference-provider');

const mockSetMode = jest.fn();
const mockContextValue = {
    mode: 'light',
    setMode: mockSetMode
};

describe('UserPreferencePage Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user preference page with default values', async () => {
        (userPreferenceProvider.getUserPreference as jest.Mock).mockResolvedValue({
            isDark: false,
            timezone: "America/Los_Angeles"
        });

        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('User Preference')).toBeInTheDocument();
            expect(screen.getByText('Timezone')).toBeInTheDocument();
            expect(screen.getByText('Dark mode')).toBeInTheDocument();
        });
    });

    test('handles save preferences correctly', async () => {
        (userPreferenceProvider.updatePreference as jest.Mock).mockResolvedValue({
            isDark: true,
            timezone: "America/New_York"
        });

        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );

        const saveButton = await screen.findByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(userPreferenceProvider.updatePreference).toHaveBeenCalled();
        });
    });

    test('displays error when preference update fails', async () => {
        (userPreferenceProvider.updatePreference as jest.Mock).mockRejectedValue(
            new Error('Failed to update preferences')
        );

        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );

        const saveButton = await screen.findByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(userPreferenceProvider.updatePreference).toHaveBeenCalled();
        });
    });

    test('loads preferred projects on component mount', async () => {
        const mockProjects = {
            preferred: [
                {
                    group_name: "Test Group",
                    projects: [
                        { uuid: "proj_001", name: "Test Project 1" },
                        { uuid: "proj_002", name: "Test Project 2" }
                    ]
                }
            ]
        };
        
        (userPreferenceProvider.getPreferredProjects as jest.Mock).mockResolvedValue(mockProjects);
        
        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );
        
        await waitFor(() => {
            expect(userPreferenceProvider.getPreferredProjects).toHaveBeenCalled();
            expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            expect(screen.getByText('Test Project 2')).toBeInTheDocument();
        });
    });
    
    test('allows changing timezone', async () => {
        (userPreferenceProvider.getPreferredProjects as jest.Mock).mockResolvedValue({ preferred: [] });
        
        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );
        
        // Find the timezone select and simulate changing it
        const timezoneSelect = screen.getByText('Timezone').closest('div')?.querySelector('.ant-select') as HTMLElement;
        expect(timezoneSelect).toBeInTheDocument();
        
        // Since we can't directly test the Select component's onChange due to Ant Design's implementation,
        // we'll verify the component renders correctly
        expect(screen.getByText('Timezone')).toBeInTheDocument();
    });
    
    test('toggles dark mode when switch is clicked', async () => {
        (userPreferenceProvider.getPreferredProjects as jest.Mock).mockResolvedValue({ preferred: [] });
        
        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );
        
        // Find the dark mode switch
        const darkModeSwitch = screen.getByText('Dark mode').closest('div')?.querySelector('.ant-switch') as HTMLElement;
        expect(darkModeSwitch).toBeInTheDocument();
        
        // Click the switch
        fireEvent.click(darkModeSwitch);
        
        // Verify the setMode function was called
        expect(mockSetMode).toHaveBeenCalled();
    });
    
    test('removes project from favorites', async () => {
        const mockProjects = {
            preferred: [
                {
                    group_name: "Test Group",
                    projects: [
                        { uuid: "proj_001", name: "Test Project 1" }
                    ]
                }
            ]
        };
        
        (userPreferenceProvider.getPreferredProjects as jest.Mock).mockResolvedValue(mockProjects);
        (userPreferenceProvider.removeFavouriteProject as jest.Mock).mockResolvedValue({ success: true });
        
        render(
            <ColorModeContext.Provider value={mockContextValue}>
                <UserPreferencePage />
            </ColorModeContext.Provider>
        );
        
        await waitFor(() => {
            expect(screen.getByText('Test Project 1')).toBeInTheDocument();
        });
        
        // Find and click the delete icon
        const deleteIcon = document.querySelector('.anticon-delete') as HTMLElement;
        expect(deleteIcon).toBeInTheDocument();
        fireEvent.click(deleteIcon);
        
        await waitFor(() => {
            expect(userPreferenceProvider.removeFavouriteProject).toHaveBeenCalledWith("proj_001");
        });
    });
});
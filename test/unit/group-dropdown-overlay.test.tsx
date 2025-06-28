import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import {GroupDropdownOverlay} from "../../src/pages/test-summaries/dropdown/GroupDropdownOverlay";

jest.mock('../../src/providers/user-prreferred-provider', () => ({
    fetchPreferredProjects: jest.fn(),
    savePreferredProjects: jest.fn(),
}));

jest.mock('antd', () => {
    const actualAntd = jest.requireActual('antd');
    return {
        ...actualAntd,
        message: {
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
        }
    };
});

describe('GroupDropdownOverlay', () => {
    const mockProject = { id: '1', name: 'Proj1', uuid: 'uuid-1' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows warning when saving with no group', () => {
        render(
            <GroupDropdownOverlay
                groups={[]}
                loading={false}
                selectedProject={mockProject}
                onClose={jest.fn()}
            />
        );

        fireEvent.click(screen.getByText('Save'));

        expect(message.warning).toHaveBeenCalledWith('Please select or enter a group name');
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();
        render(
            <GroupDropdownOverlay
                groups={[]}
                loading={false}
                selectedProject={mockProject}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByLabelText('Project 1 close menu'));
        expect(onClose).toHaveBeenCalled();
    });
});

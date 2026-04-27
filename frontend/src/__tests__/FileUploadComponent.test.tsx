// White Box Unit Test — FileUploadComponent
// Mocks global.fetch to exercise every branch in handleSubmit().
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FileUploadComponent from '../FileUploadComponent';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FileUploadComponent', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the upload form with all required input elements', () => {
    render(<FileUploadComponent onSuccess={mockOnSuccess} />);

    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.queryByTestId('selected-filename')).not.toBeInTheDocument();
  });

  it('displays the selected filename after the user picks a file', async () => {
    render(<FileUploadComponent onSuccess={mockOnSuccess} />);
    const fileInput = screen.getByTestId('file-input');
    const fakeFile = new File(['(fake image bytes)'], 'vacation.jpg', { type: 'image/jpeg' });

    await userEvent.upload(fileInput, fakeFile);

    expect(screen.getByTestId('selected-filename')).toHaveTextContent('vacation.jpg');
  });

  it('displays the backend error message when the upload is rejected', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "File extension '.exe' is not allowed" }),
    } as unknown as Response);

    render(<FileUploadComponent onSuccess={mockOnSuccess} />);
    await userEvent.type(screen.getByTestId('title-input'),       'Bad Deal');
    await userEvent.type(screen.getByTestId('description-input'), 'Contains malware');

    // Act & Assert
    fireEvent.submit(screen.getByTestId('upload-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(".exe' is not allowed");
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('clears form fields and calls onSuccess after a successful upload', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 42, title: 'My Deal' }),
    } as unknown as Response);

    render(<FileUploadComponent onSuccess={mockOnSuccess} />);
    await userEvent.type(screen.getByTestId('title-input'),       'Great Deal');
    await userEvent.type(screen.getByTestId('description-input'), '50% off everything');

    // Act & Assert
    fireEvent.submit(screen.getByTestId('upload-form'));
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId('title-input')).toHaveValue('');
    expect(screen.getByTestId('description-input')).toHaveValue('');
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('shows a connection error message when the network request fails', async () => {
    // Arrange
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<FileUploadComponent onSuccess={mockOnSuccess} />);
    await userEvent.type(screen.getByTestId('title-input'),       'Any Deal');
    await userEvent.type(screen.getByTestId('description-input'), 'Any description');

    // Act & Assert
    fireEvent.submit(screen.getByTestId('upload-form'));
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Server connection lost');
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('disables the submit button while the upload is in progress', async () => {
    // Arrange — never-resolving promise simulates a slow server
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<FileUploadComponent onSuccess={mockOnSuccess} />);
    await userEvent.type(screen.getByTestId('title-input'),       'Pending Deal');
    await userEvent.type(screen.getByTestId('description-input'), 'Waiting...');

    // Act & Assert
    fireEvent.submit(screen.getByTestId('upload-form'));
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Processing...');
    });
  });
});

import { useState } from 'react';

function getCsrfToken(): string {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/,
    '$1'
  );
}

interface FileUploadComponentProps {
  onSuccess: () => void;
}

/**
 * Standalone file-upload form extracted from Dashboard.
 * Kept minimal so it can be unit-tested independently via React
 * Testing Library. data-testid attributes are used as stable
 * selectors that don't break when styling changes.
 */
const FileUploadComponent = ({ onSuccess }: FileUploadComponentProps) => {
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/deals/create', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        onSuccess();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.error || 'An unexpected error occurred.');
      }
    } catch {
      setErrorMessage('Server connection lost. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="upload-form">
      <input
        placeholder="Deal Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        data-testid="title-input"
      />
      <input
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        data-testid="description-input"
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
        data-testid="file-input"
      />
      {selectedFile && (
        <span data-testid="selected-filename">{selectedFile.name}</span>
      )}
      {errorMessage && (
        <p role="alert" data-testid="error-message">{errorMessage}</p>
      )}
      <button type="submit" disabled={isSubmitting} data-testid="submit-button">
        {isSubmitting ? 'Processing...' : 'Publish Secure Deal'}
      </button>
    </form>
  );
};

export default FileUploadComponent;

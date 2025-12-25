import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  fullScreen = false,
  message,
}) => {
  const content = (
    <div className={`loader-wrapper ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <div className={`spinner spinner-${size}`}>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader-overlay">{content}</div>;
  }

  return content;
};

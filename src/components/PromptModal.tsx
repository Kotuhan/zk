import React, { useState, useEffect, useRef } from 'react';

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  defaultValue = '',
  placeholder = '',
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <input
              ref={inputRef}
              type="text"
              className="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btnSecondary" onClick={onCancel}>
              Скасувати
            </button>
            <button
              type="submit"
              className="btnPrimary"
              disabled={!value.trim()}
            >
              Підтвердити
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

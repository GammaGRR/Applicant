import { useState, useRef, useEffect } from 'react';
import { CircleCheck, CircleX, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface DocumentItem {
  name: string;
  status: 'done' | 'missing';
}

interface Props {
  applicantId: string;
  documents: DocumentItem[];
}


export const ApplicantDocuments = ({ documents }: Props) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const doneCount = documents.filter((d) => d.status === 'done').length;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const popupWidth = 224;
    const popupHeight = 288;
    const margin = 8;

    let left = rect.left;
    let top = rect.bottom + 5;

    if (left + popupWidth > window.innerWidth - margin) {
      left = window.innerWidth - popupWidth - margin;
    }

    if (left < margin) {
      left = margin;
    }

    if (top + popupHeight > window.innerHeight - margin) {
      top = rect.top - popupHeight - 5;
    }

    if (top < margin) {
      top = margin;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md w-fit">
          {doneCount} / {documents.length}
        </span>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center gap-1 text-blue-600 text-xs hover:underline"
        >
          <ChevronDown size={14} />
          Подробнее
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{ top: position.top, left: position.left }}
          >
            <div
              ref={menuRef}
              className={`bg-white w-56 max-h-72 overflow-y-auto border border-gray-200 rounded-xl shadow-lg p-3 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'
                }`}
            >
              <p className="text-xs font-medium text-gray-500 mb-2">
                Документы ({doneCount}/{documents.length})
              </p>
              <div className="flex flex-col gap-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {doc.status === 'done' ? (
                      <CircleCheck size={14} className="text-green-500 shrink-0" />
                    ) : (
                      <CircleX size={14} className="text-red-500 shrink-0" />
                    )}
                    <span className={`text-xs ${doc.status === 'done' ? 'text-green-600' : 'text-gray-700'}`}>
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
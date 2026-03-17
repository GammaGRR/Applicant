import { useState, useRef, useEffect } from 'react';
import { EllipsisVertical, SquarePen, Trash, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';

export const ModalButton = () => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (rect) {
      setPosition({
        top: rect.bottom + 5,
        left: rect.left - 150,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
    }
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
      <button
        type='button'
        ref={buttonRef}
        onClick={handleToggle}
        className="hover:bg-gray-200 p-2 rounded-full"
      >
        <EllipsisVertical size={24} />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div
              ref={menuRef}
              className={`bg-white w-40 border border-gray-300 rounded-xl shadow-lg overflow-hidden ${
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
              }`}
            >
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <Eye size={20} />
                  <p className="text-sm">Посмотреть</p>
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <SquarePen size={20} />
                  <p className="text-sm">Изменить</p>
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                <div className="flex items-center gap-4">
                  <Trash size={20} />
                  <p className="text-sm">Удалить</p>
                </div>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
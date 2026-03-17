import { useState } from 'react';
import { CircleCheck, CircleX, ChevronDown, X } from 'lucide-react';

export interface DocumentItem {
  name: string;
  status: 'done' | 'missing';
}

interface Props {
  applicantId: number;
  documents: DocumentItem[];
}

export const ApplicantDocuments = ({ documents }: Props) => {
  const [open, setOpen] = useState(false);

  const doneCount = documents.filter((d) => d.status === 'done').length;

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md w-fit">
          {doneCount} / {documents.length}
        </span>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-blue-600 text-xs hover:underline"
        >
          <ChevronDown size={14} />
          Подробнее
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white w-[400px] max-h-[80vh] overflow-y-auto rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">
                Документы ({doneCount}/{documents.length})
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2">
                  {doc.status === 'done' ? (
                    <CircleCheck size={16} className="text-green-500" />
                  ) : (
                    <CircleX size={16} className="text-red-500" />
                  )}
                  <span
                    className={
                      doc.status === 'done' ? 'text-green-600' : 'text-gray-700'
                    }
                  >
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

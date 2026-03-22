import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { FormBuilder } from '../components/FormBuilder';

export const FormsSectionPage = () => {
    const [forms, setForms] = useState<any[]>([]);
    const [editingForm, setEditingForm] = useState<any | null>(null);

    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    const fetchForms = async () => {
        const res = await fetch('http://localhost:3000/forms', { headers });
        const data = await res.json();
        setForms(data);
    };

    const handleActivate = async (id: number) => {
        await fetch(`http://localhost:3000/forms/${id}/activate`, {
            method: 'PATCH',
            headers,
        });
        fetchForms();
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleCreate = async () => {
        const res = await fetch('http://localhost:3000/forms', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'Новая форма' }),
        });
        const form = await res.json();
        setEditingForm(form);
        fetchForms();
    };

    const handleDelete = async (id: number) => {
        await fetch(`http://localhost:3000/forms/${id}`, {
            method: 'DELETE',
            headers,
        });
        fetchForms();
    };

    if (editingForm) {
        return (
            <FormBuilder
                form={editingForm}
                onBack={() => {
                    setEditingForm(null);
                    fetchForms();
                }}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Конструктор форм</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Создать форму
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map((form) => (
                    <div key={form.id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{form.name}</h3>
                            {form.isActive && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                    Активная
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            {form.fields?.length ?? 0} полей
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingForm(form)}
                                className="flex-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 transition"
                            >
                                Редактировать
                            </button>
                            {!form.isActive && (
                                <button
                                    onClick={() => handleActivate(form.id)}
                                    className="flex-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs hover:bg-green-100 transition"
                                >
                                    Активировать
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(form.id)}
                                className="text-red-400 hover:text-red-600 px-2 transition"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
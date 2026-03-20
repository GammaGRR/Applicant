import { Trash2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";


export const BenefitsSectionPage = () => {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });

  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchBenefits = async () => {
    const res = await fetch('http://localhost:3000/benefits', { headers });
    const data = await res.json();
    setBenefits(data);
  };

  useEffect(() => { fetchBenefits(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await fetch('http://localhost:3000/benefits', {
      method: 'POST',
      headers,
      body: JSON.stringify(form),
    });
    setForm({ name: '' });
    setShowForm(false);
    fetchBenefits();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/benefits/${id}`, { method: 'DELETE', headers });
    fetchBenefits();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Льготы</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Новая льгота</h3>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <input
            placeholder="Название льготы"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreate}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Создать
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {benefits.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
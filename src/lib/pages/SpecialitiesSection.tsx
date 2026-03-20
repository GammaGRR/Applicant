import { useState, useEffect } from "react";
import { Trash2, Plus, X } from "lucide-react";

export const SpecialitiesSectionPage = () => {
  const [specialities, setSpecialities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', budgetPlaces: 0, paidPlaces: 0 });

  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchSpecialities = async () => {
    const res = await fetch('http://localhost:3000/specialities', { headers });
    const data = await res.json();
    setSpecialities(data);
  };

  useEffect(() => { fetchSpecialities(); }, []);

  const handleCreate = async () => {
    await fetch('http://localhost:3000/specialities', {
      method: 'POST',
      headers,
      body: JSON.stringify(form),
    });
    setForm({ name: '', code: '', budgetPlaces: 0, paidPlaces: 0 });
    setShowForm(false);
    fetchSpecialities();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/specialities/${id}`, { method: 'DELETE', headers });
    fetchSpecialities();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Специальности</h2>
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
            <h3 className="font-medium">Новая специальность</h3>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Название"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Код специальности"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Бюджетных мест"
              type="number"
              value={form.budgetPlaces}
              onChange={(e) => setForm({ ...form, budgetPlaces: +e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Платных мест"
              type="number"
              value={form.paidPlaces}
              onChange={(e) => setForm({ ...form, paidPlaces: +e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              <th className="px-4 py-3 font-medium">Код</th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Бюджет</th>
              <th className="px-4 py-3 font-medium">Платно</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {specialities.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-gray-500">{s.code}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.budgetPlaces}</td>
                <td className="px-4 py-3">{s.paidPlaces}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
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
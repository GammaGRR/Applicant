import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash } from 'lucide-react';

type Step = 'idle' | 'confirm' | 'password';

const usePersistentCountdown = (key: string) => {
  const getRemaining = () => {
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const endsAt = parseInt(stored, 10);
    const remaining = Math.ceil((endsAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [seconds, setSeconds] = useState(() => getRemaining());
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const remaining = getRemaining();
    if (remaining > 0) setSeconds(remaining);
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      localStorage.removeItem(key);
      return;
    }
    ref.current = setInterval(() => {
      const remaining = getRemaining();
      if (remaining <= 0) {
        clearInterval(ref.current!);
        setSeconds(0);
        localStorage.removeItem(key);
      } else {
        setSeconds(remaining);
      }
    }, 500);
    return () => clearInterval(ref.current!);
  }, [seconds > 0]);

  const start = (s: number) => {
    const endsAt = Date.now() + s * 1000;
    localStorage.setItem(key, String(endsAt));
    setSeconds(s);
  };

  return { seconds, start, active: seconds > 0 };
};

export const ClearDatabaseButton = ({ onCleared }: { onCleared?: () => void }) => {
  const [step, setStep] = useState<Step>('idle');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mainCooldown = usePersistentCountdown('clear_db_main_cooldown');
  const passwordCooldown = usePersistentCountdown('clear_db_password_cooldown');
  const token = localStorage.getItem('access_token');
  const handleFirstConfirmYes = () => {
    setStep('password');
    setPassword('');
    setError(null);
  };

  const handleFirstConfirmNo = () => {
    setStep('idle');
    mainCooldown.start(30);
  };

  const handleSecondCancel = () => {
    setStep('idle');
    setPassword('');
    setError(null);
    mainCooldown.start(30);
  };

  const handleClear = async () => {
    if (passwordCooldown.active) return;
    if (!password) { setError('Введите пароль'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/applicants', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (res.status === 403) {
        setError('Неверный пароль. Подождите 60 секунд.');
        passwordCooldown.start(60);
        return;
      }
      if (!res.ok) throw new Error();

      setStep('idle');
      setPassword('');
      onCleared?.();
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => !mainCooldown.active && setStep('confirm')}
        disabled={mainCooldown.active}
        className={`transition-all duration-300 p-2 rounded-xl border text-sm flex items-center gap-2
          ${mainCooldown.active
            ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 border-red-600 text-white hover:bg-white hover:text-red-600'
          }`}
      >
        <Trash size={16} />
        {mainCooldown.active ? `Удалить (${mainCooldown.seconds}с)` : 'Удалить'}
      </button>
      {step === 'confirm' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Очистить базу данных?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Все записи абитуриентов будут удалены без возможности восстановления.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleFirstConfirmNo}
                  className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleFirstConfirmYes}
                  className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Да, удалить
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {step === 'password' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Подтвердите действие
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Введите пароль вашего аккаунта для подтверждения удаления.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && !passwordCooldown.active && handleClear()}
                placeholder="Пароль"
                autoFocus
                disabled={passwordCooldown.active}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 mb-2 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
              {passwordCooldown.active && (
                <p className="text-xs text-gray-400 mb-3">
                  Повторная попытка через {passwordCooldown.seconds} сек.
                </p>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSecondCancel}
                  className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading || passwordCooldown.active}
                  className={`flex-1 py-2 text-sm rounded-lg transition text-white
                    ${passwordCooldown.active
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                    }`}
                >
                  {loading
                    ? 'Удаление...'
                    : passwordCooldown.active
                      ? `Подтвердить (${passwordCooldown.seconds}с)`
                      : 'Подтвердить'
                  }
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
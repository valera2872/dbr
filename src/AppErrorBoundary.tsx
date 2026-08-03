import React from 'react';
import { CASE_ID } from './build';

type Props = { children: React.ReactNode };
type State = { failed: boolean };

const ERROR_KEY = `dbr:${CASE_ID}:premium:last-error`;

function clearCaseStorage(): void {
  const prefix = `dbr:${CASE_ID}`;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    try {
      localStorage.setItem(ERROR_KEY, JSON.stringify({
        message: error.message,
        componentStack: info.componentStack,
        capturedAt: new Date().toISOString()
      }));
    } catch {
      // Recovery screen must remain available even when storage is unavailable.
    }
    console.error('DBR application error', error, info);
  }

  private reload = (): void => {
    window.location.reload();
  };

  private restart = (): void => {
    if (!window.confirm('Удалить сохранённый прогресс этого дела и начать расследование заново?')) return;
    clearCaseStorage();
    window.location.assign(`${window.location.pathname}?fresh=1`);
  };

  render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="commercial-error-screen" role="alert">
        <section>
          <div className="commercial-error-logo"><span>Д</span><span>Б</span><span>Р</span></div>
          <p>ВОССТАНОВЛЕНИЕ СЕАНСА</p>
          <h1>Расследование временно остановлено</h1>
          <div className="commercial-error-rule" />
          <p className="commercial-error-copy">
            Последний сохранённый шаг не удалён. Обычно достаточно перезагрузить приложение.
          </p>
          <div className="commercial-error-actions">
            <button type="button" onClick={this.reload}>Перезагрузить</button>
            <button type="button" className="secondary" onClick={this.restart}>Начать дело заново</button>
          </div>
        </section>
      </main>
    );
  }
}

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

const TOOL_TO_SCREEN = {
  salary: 'salary-screen',
  tax: 'tax-screen',
  vat: 'vat-screen',
  realestate: 'real-estate-screen',
  acquisition: 'acquisition-tax-screen',
  loan: 'loan-screen',
  retirement: 'retirement-screen',
  savings: 'savings-screen',
  car: 'car-acq-screen',
  lotto: 'lotto-screen',
};

export default function LegacyTool() {
  const { toolId } = useParams();
  const screen = TOOL_TO_SCREEN[toolId];

  const iframeSrc = useMemo(() => {
    const base = `${import.meta.env.BASE_URL}legacy.html`;
    if (!screen) return base;
    const q = new URLSearchParams();
    q.set('screen', screen);
    q.set('qSchema', '1');
    return `${base}?${q.toString()}`;
  }, [screen]);

  if (!screen) {
    return (
      <div className="legacy-wrap">
        <p>알 수 없는 도구입니다.</p>
        <Link to="/">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="legacy-wrap">
      <div className="legacy-toolbar">
        <Link to="/">← 시나리오 홈</Link>
        <span className="muted">기존 계산기 UI (iframe)</span>
      </div>
      <iframe title="계산기" className="legacy-iframe" src={iframeSrc} />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { SHARE_QUERY_SCHEMA_VERSION } from '@salary-cal/calc-core/schemas';

const SCENARIOS = [
  {
    title: '연봉·실수령액',
    desc: '연봉 협상, 이직 전후 비교에 맞춘 계산기입니다.',
    to: '/tool/salary',
    time: '약 1분',
  },
  {
    title: '대출·상환',
    desc: '금융·주택 대출 상환액과 비교 모드를 사용합니다.',
    to: '/tool/loan',
    time: '약 2분',
  },
  {
    title: '세금·부동산',
    desc: '상속·증여, 부동산 관련 세금을 한곳에서 다룹니다.',
    to: '/tool/tax',
    time: '약 1분',
  },
];

const ALL_TOOLS = [
  { id: 'salary', label: '월급/연봉' },
  { id: 'tax', label: '세금' },
  { id: 'vat', label: '부가세' },
  { id: 'realestate', label: '부동산' },
  { id: 'acquisition', label: '취등록세' },
  { id: 'loan', label: '대출' },
  { id: 'retirement', label: '퇴직금' },
  { id: 'savings', label: '적금/예금' },
  { id: 'car', label: '자동차 취득세' },
  { id: 'lotto', label: '로또' },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero hero-main">
        <p className="hero-kicker">금융 계산기 · 시나리오 허브</p>
        <h1 className="hero-title">필요한 계산만 골라서</h1>
        <p className="hero-lead muted">
          아래 카드는 기존 계산 화면을 그대로 불러옵니다. 공유 URL 스키마는{' '}
          <code className="inline-code">qSchema={String(SHARE_QUERY_SCHEMA_VERSION)}</code> 입니다.
        </p>
        <div className="hero-actions">
          <a className="btn-primary-link" href="/">
            기존 홈(뉴스 포함)
          </a>
        </div>
      </section>

      <section className="section">
        <h2 className="section-heading">시나리오</h2>
        <div className="card-grid">
          {SCENARIOS.map((s) => (
            <Link key={s.to} to={s.to} className="card card-link">
              <span className="card-time">{s.time}</span>
              <h2>{s.title}</h2>
              <p>{s.desc}</p>
              <span className="card-cta">열기 →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-heading">전체 계산기</h2>
        <ul className="tool-list">
          {ALL_TOOLS.map((t) => (
            <li key={t.id}>
              <Link to={`/tool/${t.id}`}>{t.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section muted-box">
        <h2 className="section-heading">전체 레거시 UI</h2>
        <p className="muted">
          기존 단일 페이지와 동일한 레이아웃이 필요하면{' '}
          <a href="/legacy.html" target="_blank" rel="noreferrer">
            legacy.html 새 탭
          </a>
        </p>
      </section>
    </div>
  );
}

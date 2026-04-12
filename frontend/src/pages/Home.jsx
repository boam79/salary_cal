import React from 'react';
import { Link } from 'react-router-dom';
import { SHARE_QUERY_SCHEMA_VERSION } from '@salary-cal/calc-core/schemas';

const SCENARIOS = [
  {
    title: '연봉·실수령액',
    desc: '연봉 협상, 이직 전후 비교에 맞춘 계산기입니다.',
    to: '/tool/salary',
  },
  {
    title: '대출·상환',
    desc: '금융·주택 대출 상환액과 비교 모드를 사용합니다.',
    to: '/tool/loan',
  },
  {
    title: '세금·부동산',
    desc: '상속·증여, 부동산 관련 세금을 한곳에서 다룹니다.',
    to: '/tool/tax',
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
      <section className="hero">
        <h1>시나리오로 바로 가기</h1>
        <p className="muted">
          아래는 새 정보 구조의 시작점입니다. 각 카드는 기존 계산기 화면을 그대로 불러옵니다(점진 이관). 공유 URL
          스키마: qSchema={SHARE_QUERY_SCHEMA_VERSION}
        </p>
        <div className="card-grid">
          {SCENARIOS.map((s) => (
            <Link key={s.to} to={s.to} className="card card-link">
              <h2>{s.title}</h2>
              <p>{s.desc}</p>
              <span className="card-cta">열기 →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>전체 계산기</h2>
        <ul className="tool-list">
          {ALL_TOOLS.map((t) => (
            <li key={t.id}>
              <Link to={`/tool/${t.id}`}>{t.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section muted-box">
        <h2>레거시 전체 화면</h2>
        <p>
          기존 단일 페이지와 동일한 UI가 필요하면{' '}
          <a href="/legacy.html" target="_blank" rel="noreferrer">
            legacy.html을 새 탭에서 열기
          </a>
          를 사용하세요.
        </p>
      </section>
    </div>
  );
}

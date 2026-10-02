import type { Distribution, Trend } from '@/lib/kpis';
import { money, number } from '@/lib/format';
import { toneOf } from '@/lib/status';
import type { Config } from '@/lib/types';

// Two charts, drawn on the server as SVG with no library: series colours are
// tokens through classes, series are told apart by marker shape and label as
// well as colour, axes are labelled and a bar starts at zero. Each chart has
// its text twin: a summary sentence and the data as a table one action away.
// Nothing animates: the operational signature draws, it does not perform.

export function TrendChart({ config, trend }: { config: Config; trend: Trend }) {
  const strings = config.charts.trend!;
  const width = 640;
  const height = 240;
  const left = 104;
  const bottom = 32;
  const top = 12;
  const max = Math.max(1, ...trend.weeks.flatMap((week) => [week.income, week.expense]));
  const x = (index: number) => left + (index * (width - left - 16)) / (trend.weeks.length - 1);
  const y = (value: number) => top + (height - top - bottom) * (1 - value / max);
  const line = (key: 'income' | 'expense') =>
    trend.weeks.map((week, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(week[key]).toFixed(1)}`).join(' ');
  const ticks = [0, 0.5, 1].map((ratio) => Math.round(max * ratio));
  const empty = trend.weeks.every((week) => week.income === 0 && week.expense === 0);

  return (
    <figure className="chart" aria-labelledby="trend-title">
      <h2 id="trend-title">{strings.title}</h2>
      <p className="chart__summary" id="trend-summary">
        {empty ? config.ui.states!.noData : trend.summary}
      </p>
      {empty ? null : (
        <>
          <ul className="legend">
            <li>
              <svg width="14" height="14" aria-hidden="true">
                <circle cx="7" cy="7" r="5" className="series series--1" />
              </svg>
              {strings.income}
            </li>
            <li>
              <svg width="14" height="14" aria-hidden="true">
                <rect x="2" y="2" width="10" height="10" className="series series--2" />
              </svg>
              {strings.expense}
            </li>
          </ul>
          <svg className="chart__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="trend-title trend-summary">
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={left} x2={width - 8} y1={y(tick)} y2={y(tick)} className="grid" />
                <text x={left - 8} y={y(tick) + 4} textAnchor="end" className="axis">
                  {money(config, tick)}
                </text>
              </g>
            ))}
            {trend.weeks.map((week, index) => (
              <text key={week.start} x={x(index)} y={height - 10} textAnchor="middle" className="axis">
                {week.label}
              </text>
            ))}
            <path d={line('income')} className="line line--1" />
            <path d={line('expense')} className="line line--2" />
            {trend.weeks.map((week, index) => (
              <g key={`m-${week.start}`}>
                <circle cx={x(index)} cy={y(week.income)} r="4" className="series series--1" />
                <rect x={x(index) - 4} y={y(week.expense) - 4} width="8" height="8" className="series series--2" />
              </g>
            ))}
          </svg>
          <p className="chart__axis-note">{strings.axis}</p>
        </>
      )}
      <details className="chart__data">
        <summary>{strings.showData}</summary>
        <table className="table table--compact">
          <caption>{strings.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{strings.weekColumn}</th>
              <th scope="col" className="col--money">
                {strings.income}
              </th>
              <th scope="col" className="col--money">
                {strings.expense}
              </th>
            </tr>
          </thead>
          <tbody>
            {trend.weeks.map((week) => (
              <tr key={week.start}>
                <th scope="row">{week.label}</th>
                <td className="col--money">{money(config, week.income)}</td>
                <td className="col--money">{money(config, week.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export function DistributionChart({ config, data }: { config: Config; data: Distribution }) {
  const strings = config.charts.distribution!;
  const max = Math.max(1, ...data.counts.map((item) => item.count));
  const empty = data.counts.every((item) => item.count === 0);
  return (
    <figure className="chart" aria-labelledby="distribution-title">
      <h2 id="distribution-title">{strings.title}</h2>
      <p className="chart__summary" id="distribution-summary">
        {empty ? config.ui.states!.noData : data.summary}
      </p>
      {empty ? null : (
        <ul className="bars" aria-hidden="true">
          {data.counts.map((item) => (
            <li key={item.status} className="bars__row">
              <span className="bars__label">{item.label}</span>
              <span className="bars__track">
                <span
                  className={`bars__bar bar--${toneOf('rooms', item.status)}`}
                  style={{ inlineSize: `${Math.max(2, (item.count / max) * 100)}%` }}
                >
                  <span className="bars__count">{number(config, item.count)}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <details className="chart__data">
        <summary>{strings.showData}</summary>
        <table className="table table--compact">
          <caption>{strings.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{strings.statusColumn}</th>
              <th scope="col" className="col--number">
                {strings.countColumn}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.counts.map((item) => (
              <tr key={item.status}>
                <th scope="row">{item.label}</th>
                <td className="col--number">{number(config, item.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

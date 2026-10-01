import { getConfig } from '@/lib/config';
import type { ModuleKey } from '@/lib/matrix';
import { definition } from '@/lib/modules';

// The loading state: a skeleton of the layout, rows matching the columns, and
// aria-busy on the region. Not a spinner over a blank page.
export function ListSkeleton({ module }: { module: ModuleKey }) {
  const config = getConfig();
  const def = definition(module);
  const strings = config.modules[module];
  const columns = def ? def.columns.length + 1 : 3;
  return (
    <section aria-busy="true" aria-label={strings.title} data-state="loading">
      <div className="page-header">
        <div className="page-header__text">
          <h1>{strings.title}</h1>
          <p className="muted" role="status">
            {config.ui.states!.loading}
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table table--skeleton" aria-hidden="true">
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index}>
                  <span className="skeleton" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }, (_, row) => (
              <tr key={row}>
                {Array.from({ length: columns }, (_, index) => (
                  <td key={index}>
                    <span className="skeleton" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

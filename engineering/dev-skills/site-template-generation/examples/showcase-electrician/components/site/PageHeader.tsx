export default function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="page-header">
      <div className="page">
        <h1 className="page-header__title">{title}</h1>
        {intro ? <p className="page-header__intro">{intro}</p> : null}
      </div>
    </div>
  );
}

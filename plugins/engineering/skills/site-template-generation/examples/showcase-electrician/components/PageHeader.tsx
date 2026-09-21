type Props = { title: string; intro?: string };

export default function PageHeader({ title, intro }: Props) {
  return (
    <div className="page-header">
      <div className="container">
        <h1 className="page-header__title">{title}</h1>
        {intro ? <p className="page-header__intro">{intro}</p> : null}
      </div>
    </div>
  );
}

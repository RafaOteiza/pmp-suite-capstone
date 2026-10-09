function Block({ height }: { height: number }) {
  return <div className="skeleton" style={{ height }} aria-hidden="true" />;
}

export default function DashboardSkeleton() {
  return (
    <div className="page dashboard-page" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando métricas del dashboard</span>
      <div style={{ maxWidth: 420 }}><Block height={72} /></div>
      <div className="dashboard-command-grid">
        <Block height={218} />
        <Block height={218} />
      </div>
      <div className="dashboard-priority-grid">
        {Array.from({ length: 4 }, (_, index) => <Block key={index} height={106} />)}
      </div>
      <div className="chart-grid">
        <Block height={334} />
        <Block height={334} />
      </div>
    </div>
  );
}

export function PromiseCardSkeleton() {
  return <article className="skeleton-card" aria-hidden="true"><div className="skeleton-row"><i/><i/></div><i className="skeleton-kicker"/><i className="skeleton-title"/><i className="skeleton-title short"/><i className="skeleton-copy"/><i className="skeleton-copy short"/><div className="skeleton-spacer"/><div className="skeleton-row bottom"><i/><i/></div><i className="skeleton-progress"/></article>;
}

export function RouteSkeleton({ cards = 2 }: { cards?: number }) {
  return <main className="site-shell route-shell skeleton-page"><div className="skeleton-route-hero"><i className="skeleton-kicker shimmer"/><i className="skeleton-heading shimmer"/><i className="skeleton-heading short shimmer"/><i className="skeleton-copy shimmer"/></div><section className="skeleton-grid">{Array.from({length:cards},(_,index)=><PromiseCardSkeleton key={index}/>)}</section></main>;
}

import styles from './InvestmentsTab.module.css'

export default function InvestmentsTab() {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        <div className={styles.badge}>Próximamente</div>

        <h2 className={styles.title}>Tracker de Inversiones</h2>

        <p className={styles.desc}>
          Registra y analiza tu cartera de inversiones: acciones, ETFs, fondos, criptomonedas y más.
          Visualiza el rendimiento histórico y proyecta tu patrimonio a futuro.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📈</span>
            <div>
              <div className={styles.featureTitle}>Cartera en tiempo real</div>
              <div className={styles.featureDesc}>Conecta tus brokers y ve todo en un solo lugar</div>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🧮</span>
            <div>
              <div className={styles.featureTitle}>Análisis de rentabilidad</div>
              <div className={styles.featureDesc}>CAGR, drawdown, ratio Sharpe y más métricas</div>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎯</span>
            <div>
              <div className={styles.featureTitle}>Objetivos de ahorro</div>
              <div className={styles.featureDesc}>Define metas y visualiza el camino para alcanzarlas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.logo}>A<span>mort</span></div>
        <div className={styles.navLinks}>
          <a href="https://github.com/GuilleBarrena/Amort" target="_blank" rel="noopener noreferrer" className={styles.githubLink} aria-label="GitHub">
            <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <Link href="/auth/login" className={styles.navLink}>Entrar</Link>
          <Link href="/auth/register" className={styles.ctaSmall}>Empezar gratis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>Finanzas personales · sin complicaciones</div>
        <h1 className={styles.heroTitle}>
          ¿Cuánto te cuesta<br />
          <span className={styles.heroAccent}>realmente</span> lo que tienes?
        </h1>
        <p className={styles.heroSub}>
          Amort convierte tus compras grandes en un coste mensual real,
          y agrupa todas tus suscripciones para que veas de un vistazo
          cuánto sale de tu bolsillo cada mes.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/auth/register" className={styles.ctaPrimary}>Crear cuenta gratis</Link>
          <Link href="/auth/login" className={styles.ctaSecondary}>Ya tengo cuenta →</Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚙</div>
          <div className={styles.featureTitle}>Amortización de compras</div>
          <div className={styles.featureText}>
            Fija un coste mensual objetivo para cada compra grande. Amort te dice cuánto llevas amortizado, cuándo lo habrás cubierto y a qué precio deberías venderlo hoy.
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>◉</div>
          <div className={styles.featureTitle}>Control de suscripciones</div>
          <div className={styles.featureText}>
            Netflix, Spotify, móvil, gym… todo en un solo lugar. Ve el total mensual real y detecta qué puedes cancelar.
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>◻</div>
          <div className={styles.featureTitle}>Dashboard unificado</div>
          <div className={styles.featureText}>
            Un solo número: lo que te cuesta todo lo que tienes cada mes. Compras en amortización más suscripciones activas.
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🏦</div>
          <div className={styles.featureTitle}>Banca conectada</div>
          <div className={styles.featureText}>
            Exporta el CSV de tu banco e impórtalo en segundos. Amort detecta las columnas automáticamente, elimina duplicados y te deja categorizar cada movimiento a mano.
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className={styles.bottomCta}>
        <div className={styles.bottomCtaInner}>
          <div className={styles.bottomCtaTitle}>Gratis. Sin límites. Sin anuncios.</div>
          <Link href="/auth/register" className={styles.ctaPrimary}>Empezar ahora</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2025 Amort</span>
        <span>Hecho con JetBrains Mono y demasiado café</span>
      </footer>
    </main>
  )
}

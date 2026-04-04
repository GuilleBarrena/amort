import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.logo}>A<span>mort</span></div>
        <div className={styles.navLinks}>
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

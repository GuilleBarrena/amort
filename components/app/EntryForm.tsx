'use client'
import { useState } from 'react'
import * as Label from '@radix-ui/react-label'
import * as Select from '@radix-ui/react-select'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { Entry } from '@/lib/types'
import styles from './DashboardClient.module.css'

const ICONS = ['📱','💻','🖥️','📷','🎮','🎧','📺','🎵','🏋️','📚','☁️','🔒','✉️','🏠','🚗','🌍','💊','🎨','📡','⚡','🍿','🎬','🛡️','🔧']
const INCOME_ICONS = ['💰','💵','🏦','💼','📈','🧾','🎯','💎','🏆','⭐','🌟','✨','💫','🎁','🤑','🏅','🪙','💳','🏷️','📊','🧮','💹','🤝','🌱']
const CAT_LABELS: Record<string, string> = { entretenimiento:'Entretenimiento', telefonia:'Telefonía', musica:'Música', software:'Software', nube:'Nube', salud:'Salud', educacion:'Educación', seguros:'Seguros', otros:'Otros' }

interface Props {
  entry: Entry | null
  onBack: () => void
  onSave: (body: object) => Promise<void>
  onRequestClose: (entry: Entry) => void
  loading: boolean
  showToast: (msg: string) => void
}

export function EntryForm({ entry, onBack, onSave, onRequestClose, loading, showToast }: Props) {
  const isEditing = !!entry
  const [formType, setFormType] = useState<'amort' | 'sub' | 'income'>(entry?.type ?? 'amort')

  const [fName, setFName] = useState(entry?.type === 'amort' ? entry.name : '')
  const [fPrice, setFPrice] = useState(entry?.type === 'amort' ? String(entry.price) : '')
  const [fMonthly, setFMonthly] = useState(entry?.type === 'amort' ? String(entry.monthly) : '')
  const [fDate, setFDate] = useState(entry?.type === 'amort' ? entry.date_str! : new Date().toISOString().split('T')[0])

  const [sName, setSName] = useState(entry?.type === 'sub' ? entry.name : '')
  const [sPrice, setSPrice] = useState(entry?.type === 'sub' ? String(entry.price) : '')
  const [sPeriod, setSPeriod] = useState<'monthly' | 'yearly'>(entry?.type === 'sub' ? entry.period! : 'monthly')
  const [sCategory, setSCategory] = useState(entry?.type === 'sub' ? entry.category! : 'entretenimiento')
  const [selectedIcon, setSelectedIcon] = useState(entry?.type === 'sub' ? entry.icon! : ICONS[0])

  const [iName, setIName] = useState(entry?.type === 'income' ? entry.name : '')
  const [iPrice, setIPrice] = useState(entry?.type === 'income' ? String(entry.price) : '')
  const [iPeriod, setIPeriod] = useState<'monthly' | 'yearly'>(entry?.type === 'income' ? entry.period! : 'monthly')
  const [incomeIcon, setIncomeIcon] = useState(entry?.type === 'income' ? entry.icon! : INCOME_ICONS[0])

  async function handleSave() {
    if (formType === 'amort') {
      if (!fName || !fPrice || !fMonthly || !fDate) { showToast('Rellena todos los campos'); return }
      await onSave({ type: 'amort', name: fName, price: parseFloat(fPrice), monthly: parseFloat(fMonthly), date_str: fDate })
    } else if (formType === 'income') {
      if (!iName || !iPrice) { showToast('Rellena nombre e importe'); return }
      const since = entry?.type === 'income' ? entry.since : new Date().toISOString().split('T')[0]
      await onSave({ type: 'income', name: iName, icon: incomeIcon, price: parseFloat(iPrice), period: iPeriod, since })
    } else {
      if (!sName || !sPrice) { showToast('Rellena nombre e importe'); return }
      const since = entry?.type === 'sub' ? entry.since : new Date().toISOString().split('T')[0]
      await onSave({ type: 'sub', name: sName, icon: selectedIcon, price: parseFloat(sPrice), period: sPeriod, category: sCategory, since })
    }
  }

  const isAmort = formType === 'amort'
  const isIncome = formType === 'income'

  return (
    <div>
      <div className={styles.detailHeader}>
        <button className={styles.back} onClick={onBack}>←</button>
        <div className={styles.detailTitle}>{isEditing ? 'Editar' : 'Nuevo'}</div>
      </div>

      <ToggleGroup.Root
        type="single"
        value={formType}
        onValueChange={(v) => { if (v) setFormType(v as 'amort' | 'sub' | 'income') }}
        className={`${styles.typeToggle} ${styles.typeToggleThree}`}
      >
        <ToggleGroup.Item value="amort" className={`${styles.typeBtn} ${isAmort ? styles.typeBtnAmort : ''}`}>
          ⚙ Compra
        </ToggleGroup.Item>
        <ToggleGroup.Item value="sub" className={`${styles.typeBtn} ${formType === 'sub' ? styles.typeBtnSub : ''}`}>
          ◉ Suscripción
        </ToggleGroup.Item>
        <ToggleGroup.Item value="income" className={`${styles.typeBtn} ${isIncome ? styles.typeBtnIncome : ''}`}>
          ↑ Ingreso
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      {isAmort ? (
        <div className={styles.form}>
          <div className={styles.field}>
            <Label.Root htmlFor="f-name" className={styles.label}>Nombre</Label.Root>
            <input id="f-name" className={styles.input} value={fName} onChange={e => setFName(e.target.value)} placeholder="MacBook, cámara…" />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label.Root htmlFor="f-price" className={styles.label}>Precio (€)</Label.Root>
              <input id="f-price" className={styles.input} type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="1200" />
            </div>
            <div className={styles.field}>
              <Label.Root htmlFor="f-monthly" className={styles.label}>Objetivo / mes (€)</Label.Root>
              <input id="f-monthly" className={styles.input} type="number" value={fMonthly} onChange={e => setFMonthly(e.target.value)} placeholder="50" />
            </div>
          </div>
          <div className={styles.field}>
            <Label.Root htmlFor="f-date" className={styles.label}>Fecha de compra</Label.Root>
            <input id="f-date" className={styles.input} type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
          </div>
          <button className={styles.btn} onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar compra'}</button>
          {isEditing && entry && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onRequestClose(entry)} disabled={loading}>Cerrar entrada</button>}
        </div>
      ) : isIncome ? (
        <div className={styles.form}>
          <div className={styles.field}>
            <Label.Root htmlFor="i-name" className={styles.label}>Nombre</Label.Root>
            <input id="i-name" className={styles.input} value={iName} onChange={e => setIName(e.target.value)} placeholder="Nómina, freelance, alquiler…" />
          </div>
          <div className={styles.field}>
            <Label.Root className={styles.label}>Icono</Label.Root>
            <div className={styles.iconPicker}>
              {INCOME_ICONS.map(ic => (
                <div key={ic} className={`${styles.iconOpt} ${ic === incomeIcon ? styles.iconSelectedIncome : ''}`} onClick={() => setIncomeIcon(ic)}>{ic}</div>
              ))}
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label.Root htmlFor="i-price" className={styles.label}>Importe (€)</Label.Root>
              <input id="i-price" className={styles.input} type="number" value={iPrice} onChange={e => setIPrice(e.target.value)} placeholder="2000" />
            </div>
            <div className={styles.field}>
              <Label.Root htmlFor="i-period" className={styles.label}>Periodo</Label.Root>
              <Select.Root value={iPeriod} onValueChange={(v) => setIPeriod(v as 'monthly' | 'yearly')}>
                <Select.Trigger id="i-period" className={styles.selectTrigger}>
                  <Select.Value />
                  <Select.Icon className={styles.selectIcon}>▾</Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={styles.selectContent} position="popper" sideOffset={4}>
                    <Select.Viewport className={styles.selectViewport}>
                      <Select.Item value="monthly" className={styles.selectItem}>
                        <Select.ItemText>Mensual</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="yearly" className={styles.selectItem}>
                        <Select.ItemText>Anual</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <button className={`${styles.btn} ${styles.btnGreen}`} onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar ingreso'}</button>
          {isEditing && entry && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onRequestClose(entry)} disabled={loading}>Cerrar entrada</button>}
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.field}>
            <Label.Root htmlFor="s-name" className={styles.label}>Nombre</Label.Root>
            <input id="s-name" className={styles.input} value={sName} onChange={e => setSName(e.target.value)} placeholder="Netflix, Spotify, móvil…" />
          </div>
          <div className={styles.field}>
            <Label.Root className={styles.label}>Icono</Label.Root>
            <div className={styles.iconPicker}>
              {ICONS.map(ic => (
                <div key={ic} className={`${styles.iconOpt} ${ic === selectedIcon ? styles.iconSelected : ''}`} onClick={() => setSelectedIcon(ic)}>{ic}</div>
              ))}
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <Label.Root htmlFor="s-price" className={styles.label}>Importe (€)</Label.Root>
              <input id="s-price" className={styles.input} type="number" value={sPrice} onChange={e => setSPrice(e.target.value)} placeholder="15.99" />
            </div>
            <div className={styles.field}>
              <Label.Root htmlFor="s-period" className={styles.label}>Periodo</Label.Root>
              <Select.Root value={sPeriod} onValueChange={(v) => setSPeriod(v as 'monthly' | 'yearly')}>
                <Select.Trigger id="s-period" className={styles.selectTrigger}>
                  <Select.Value />
                  <Select.Icon className={styles.selectIcon}>▾</Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={styles.selectContent} position="popper" sideOffset={4}>
                    <Select.Viewport className={styles.selectViewport}>
                      <Select.Item value="monthly" className={styles.selectItem}>
                        <Select.ItemText>Mensual</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="yearly" className={styles.selectItem}>
                        <Select.ItemText>Anual</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <div className={styles.field}>
            <Label.Root htmlFor="s-cat" className={styles.label}>Categoría</Label.Root>
            <Select.Root value={sCategory} onValueChange={setSCategory}>
              <Select.Trigger id="s-cat" className={styles.selectTrigger}>
                <Select.Value />
                <Select.Icon className={styles.selectIcon}>▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className={styles.selectContent} position="popper" sideOffset={4}>
                  <Select.Viewport className={styles.selectViewport}>
                    {Object.entries(CAT_LABELS).map(([k, v]) => (
                      <Select.Item key={k} value={k} className={styles.selectItem}>
                        <Select.ItemText>{v}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          <button className={`${styles.btn} ${styles.btnPurple}`} onClick={handleSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar suscripción'}</button>
          {isEditing && entry && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onRequestClose(entry)} disabled={loading}>Cerrar entrada</button>}
        </div>
      )}
    </div>
  )
}

import styles from "./BarChart.module.css";

// Barras por departamento (dashboard, referencia visual contractual):
// CSS puro sobre agregaciones reales (conteos por currentDepartment ya
// calculados en pages/index.js) -- sin librería de gráficas.
// `bars`: [{ label, value }]. La altura de cada barra es relativa al
// valor máximo real del propio conjunto, nunca a un tope inventado.
export default function BarChart({ bars }) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className={styles.chart}>
      {bars.map((b) => (
        <div key={b.label} className={styles.col}>
          <span className={styles.value}>{b.value}</span>
          <div className={styles.track}>
            <div className={styles.bar} style={{ height: `${(b.value / max) * 100}%` }} />
          </div>
          <span className={styles.label}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

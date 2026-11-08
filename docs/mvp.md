# GastoQR — Documento de MVP

> Nombre provisional. Este documento define qué es la versión 1 y en qué orden se construye.

## 1. Problema

En Bolivia pagar por QR es lo normal, y es mucho más fácil gastar de más con QR que con efectivo: no "ves" salir el dinero. Además, cada banco tiene su propia app, así que no hay un lugar único donde ver cuánto gastas en total ni en qué.

## 2. Usuario objetivo

Estudiantes y jóvenes profesionales en Bolivia que pagan casi todo por QR, usan **una o más apps bancarias** y quieren saber en qué se les va la plata sin anotar todo a mano.

## 3. Propuesta de valor

**Registrar un gasto debe tomar menos de 5 segundos.** La app lee los comprobantes QR de cualquier banco y los registra casi sola.

## 4. Plataformas y bancos

- **Android primero**, con código compatible con iPhone (React Native + Expo).
- Bancos con plantilla específica en la v1: **BCP, BNB, Banco Mercantil Santa Cruz (BMSC)**.
- Cualquier otro banco: lector genérico + corrección manual.

## 5. Formas de registrar un gasto

| Método | Android | iPhone | Fase |
|---|---|---|---|
| Registro manual rápido (3 toques) | ✅ | ✅ | 1 |
| Elegir captura/imagen del comprobante desde la galería | ✅ | ✅ | 2 |
| "Compartir" el comprobante desde la app del banco | ✅ | ✅ | 3 |
| Detectar la notificación del banco automáticamente | ✅ | ❌ (iOS no lo permite) | 4 |

Siempre se muestra una **pantalla de confirmación** antes de guardar un gasto leído automáticamente (monto, fecha, destinatario, categoría editables).

## 6. Alcance de la v1

### Entra
- Registro manual, por imagen y por compartir
- Lectura OCR de comprobantes (en el celular, sin internet)
- Parsers para BCP, BNB, BMSC + parser genérico
- Categorías (con categorías por defecto: Comida, Transporte, Gym, Servicios, Suscripciones, Ocio, Otros)
- **Categorización automática por destinatario**: si ya clasificaste "Pensión X" como Comida, el próximo pago a "Pensión X" se clasifica solo
- Lista de gastos con filtros (mes, categoría, banco)
- Resumen mensual: total, por categoría, por banco
- Presupuesto mensual por categoría + aviso al pasar el 80% y el 100%
- Detección de duplicados (el mismo pago registrado dos veces)
- Exportar a CSV
- Todo local en el celular (SQLite), sin cuenta ni servidor

### No entra (v2 o después)
- Cuentas de usuario y sincronización en la nube (Supabase)
- Versión web
- Gastos compartidos entre amigos
- Ingresos y saldo
- Publicación en App Store

## 7. Modelo de datos (SQLite)

Regla clave: **el dinero se guarda en centavos como entero** (`2550` = Bs 25,50). Nunca usar decimales para montos.

### `categories`
| Campo | Tipo | Nota |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | "Comida" |
| icon | TEXT | nombre del ícono |
| color | TEXT | hex |
| monthly_budget_cents | INTEGER NULL | presupuesto opcional |
| created_at | TEXT (ISO) | |

### `expenses`
| Campo | Tipo | Nota |
|---|---|---|
| id | INTEGER PK | |
| amount_cents | INTEGER | siempre positivo |
| currency | TEXT | "BOB" por defecto |
| paid_at | TEXT (ISO) | fecha y hora del pago |
| recipient | TEXT NULL | destinatario tal como aparece |
| recipient_normalized | TEXT NULL | en minúsculas, sin tildes ni espacios extra (para reglas) |
| category_id | INTEGER FK NULL | |
| bank | TEXT | `BCP`, `BNB`, `BMSC`, `OTHER`, `CASH` |
| source | TEXT | `manual`, `image`, `share`, `notification` |
| transaction_ref | TEXT NULL | nro. de transacción si el comprobante lo trae |
| note | TEXT NULL | |
| raw_text | TEXT NULL | texto OCR original (para depurar parsers) |
| dedup_key | TEXT | ver sección 9 |
| created_at | TEXT (ISO) | |

### `recipient_rules`
| Campo | Tipo | Nota |
|---|---|---|
| id | INTEGER PK | |
| recipient_normalized | TEXT UNIQUE | |
| category_id | INTEGER FK | |
| times_used | INTEGER | para priorizar |

## 8. Lectura de comprobantes (OCR + parsers)

Flujo:

```
imagen → OCR (ML Kit, en el celular) → texto plano
       → detectar banco → parser del banco (o genérico)
       → { monto, fecha, destinatario, ref, banco, confianza }
       → pantalla de confirmación → guardar
```

- **Detección de banco**: palabras clave en el texto (nombre del banco, formato del comprobante).
- **Parser genérico**: busca patrones de monto (`Bs`, `BOB`, `Bs.` seguido de número con `,` o `.`), fechas (`dd/mm/aaaa`, nombres de mes en español) y campos tipo "Destinatario", "Para", "Beneficiario".
- **Parsers específicos (BCP, BNB, BMSC)**: se escriben a partir de **comprobantes reales**.
- Cada parser es una **función pura** `(texto: string) => ResultadoParseo` → fácil de testear.
- Si la confianza es baja, se marcan los campos dudosos en la pantalla de confirmación.

### Muestras necesarias
Juntar varios comprobantes de cada banco (tuyos y de amigos), **tapando datos personales**. Sus textos OCR se guardan en `src/parsers/__fixtures__/` y se usan como tests. Cada vez que un comprobante falle, se agrega como nuevo test.

## 9. Duplicados

Un mismo pago puede llegar dos veces (notificación + comprobante, o compartir dos veces).

- Si hay `transaction_ref`: `dedup_key = banco + ref`.
- Si no: `dedup_key = banco + monto + destinatario_normalizado + fecha redondeada a 10 minutos`.
- Si ya existe, se avisa: "Este gasto parece estar registrado, ¿guardar igual?".

## 10. Pantallas

1. **Inicio**: total del mes, barra de presupuesto, top categorías, últimos gastos, botón "+".
2. **Nuevo gasto**: manual / desde imagen.
3. **Confirmación**: datos leídos, editables, con la imagen al lado.
4. **Lista de gastos**: filtros por mes, categoría, banco.
5. **Resumen**: gráfico por categoría y por banco, comparación con el mes anterior.
6. **Categorías y presupuestos**.
7. **Ajustes**: exportar CSV, permisos (notificaciones en Android), acerca de.

## 11. Fases de construcción

| Fase | Objetivo | Resultado comprobable |
|---|---|---|
| 0 | Instalación, repo y proyecto Expo vacío | La app abre en tu celular con Expo Go |
| 1 | Base de datos + registro manual + lista + categorías + resumen | Ya puedes usarla tú a diario (manual) |
| 2 | OCR desde imagen + parser genérico + BCP/BNB/BMSC + confirmación | Eliges una captura y se llena sola |
| 3 | Recibir imágenes desde "Compartir" | Compartes el comprobante desde la app del banco |
| 4 | Notificaciones en Android | El gasto aparece sin hacer nada |
| 5 | Presupuestos, alertas, reglas automáticas, CSV, duplicados | App completa v1 |
| 6 | Pulido de portafolio | README con GIF, CI, tests, APK en GitHub Releases |

Desde la fase 2 se necesita un **development build** (Expo Go no soporta módulos nativos como el OCR).

## 12. Criterios de éxito de la v1

- Registrar un gasto por comprobante en menos de 5 segundos
- Los parsers aciertan monto y fecha en al menos el 90% de los comprobantes de prueba de BCP, BNB y BMSC
- Tú la usas durante un mes completo y al menos 5 amigos la prueban
- Tests de parsers y CI pasando en GitHub

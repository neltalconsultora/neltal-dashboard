'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import { 
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  Building,
  TrendingDown,
  Lightbulb,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Download,
  FileText,
  Target,
  Activity,
  Eye,
  Trash2,
  X,
  Settings,
  Bot,
  Zap,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Shield,
  AlertOctagon,
  Star,
  Menu,
  Save,
  RefreshCw,
  Info,
  BookOpen,
  Database,
  User,
  Briefcase,
  Heart,
  MessageSquare,
  Clock,
  Play
} from 'lucide-react'

// ============================================
// CONSTANTES
// ============================================
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MESES_AÑO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Modelos disponibles REALMENTE (Grok y Ollama)
const MODELOS_DISPONIBLES = [
  { id: 'grok-beta', nombre: 'Grok Beta', proveedor: 'X.AI' },
  { id: 'grok-2', nombre: 'Grok 2', proveedor: 'X.AI' },
  { id: 'llama3.2', nombre: 'Llama 3.2', proveedor: 'Ollama' },
  { id: 'deepseek-coder', nombre: 'DeepSeek Coder', proveedor: 'Ollama' },
  { id: 'mistral', nombre: 'Mistral', proveedor: 'Ollama' },
  { id: 'qwen2.5', nombre: 'Qwen 2.5', proveedor: 'Ollama' },
]

// URL de JARVIS - Configurable desde localStorage o variable de entorno
const getJarvisUrl = () => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('neltal_jarvis_url')
    if (savedUrl) return savedUrl
  }
  return process.env.NEXT_PUBLIC_JARVIS_URL || ''
}

// ============================================
// PREGUNTAS NELTAL - 43 PREGUNTAS OFICIALES DEL PDF
// ============================================
const preguntasEntrevista = [
  {
    bloque: 1,
    titulo: "Conociendo al Emprendedor",
    icono: User,
    color: "bg-blue-500",
    objetivo: "Establecer confianza y conocer el perfil del emprendedor antes de entrar a temas del negocio.",
    recomendaciones: [
      "Pregunta 100% personal que genera confianza",
      "El cliente se presenta como persona, no como 'dueño de negocio'",
      "Establece que la conversación es humana antes de entrar a temas técnicos"
    ],
    preguntas: [
      { 
        id: 'p1', 
        texto: "Para comenzar, me gustaría conocerte un poco. ¿Podrías platicarme sobre ti y qué te motiva día a día?", 
        tipo: 'texto_largo', 
        ayuda: "Permite capturar edad de forma natural durante la conversación." 
      },
      { 
        id: 'p2', 
        texto: "¿Cómo surgió la idea de este negocio? ¿Fue algo que planeaste o se fue presentando la oportunidad?", 
        tipo: 'texto_largo', 
        ayuda: "Detecta motivación: oportunidad de mercado (bajo riesgo), tradición familiar (medio), necesidad/desempleo (alto riesgo). Peso 2% en IVE." 
      },
      { 
        id: 'p3', 
        texto: "Cuando piensas en tu negocio, ¿qué es lo que más te gusta de lo que haces?", 
        tipo: 'texto_largo', 
        ayuda: "Pregunta positiva que enfoca la conversación en aspectos favorables." 
      },
      { 
        id: 'p4', 
        texto: "¿Y qué es lo que te preocupa más del negocio? ¿Hay algo que te genere inquietud?", 
        tipo: 'texto_largo', 
        ayuda: "Abre la puerta a problemas reales de forma conversacional." 
      },
      { 
        id: 'p5', 
        texto: "En tu familia, ¿quienes dependen económicamente de ti o del negocio?", 
        tipo: 'texto_largo', 
        ayuda: "Para calcular Ratio de Dependientes Económicos. Peso 3% en IVE." 
      },
      { 
        id: 'p6', 
        texto: "De esas personas que mencionas, ¿hay alguien que requiera cuidados especiales? Me refiero a alguien con una condición de salud, discapacidad, o un adulto mayor que necesite atención.", 
        tipo: 'texto_largo', 
        ayuda: "Vulnerabilidad social. Dependientes con necesidades especiales = mayor presión financiera y de tiempo." 
      },
      { 
        id: 'p7', 
        texto: "¿Cómo está tu salud? ¿Tienes alguna condición que debas cuidar o atender regularmente?", 
        tipo: 'texto_largo', 
        ayuda: "Salud del emprendedor. Enfermedad crónica = riesgo directo al negocio." 
      },
      { 
        id: 'p8', 
        texto: "¿Cuentas con algún seguro médico, ya sea privado o a través del IMSS?", 
        tipo: 'opcion', 
        opciones: ['Sí, seguro privado', 'Sí, IMSS', 'No tengo seguro', 'Estoy tramitando uno'], 
        ayuda: "Evalúa colchón financiero ante emergencias de salud." 
      },
      { 
        id: 'p9', 
        texto: "¿Qué estudios tienes? ¿Sientes que lo que aprendiste te ha servido en el negocio?", 
        tipo: 'texto_largo', 
        ayuda: "Escolaridad correlaciona con habilidades administrativas. Peso 3% en IVE." 
      },
      { 
        id: 'p10', 
        texto: "Además del negocio, ¿tienes otras fuentes de ingresos, o de aquí proviene todo el sustento de tu hogar?", 
        tipo: 'opcion', 
        opciones: ['Solo del negocio', 'Tengo otra fuente de ingresos', 'Mi pareja aporta', 'Tengo inversiones'], 
        ayuda: "Diversificación de ingresos = colchón financiero." 
      },
      { 
        id: 'p11', 
        texto: "¿Existe alguna causa social o comunitaria a la que te gustaría apoyar o ya apoyas con tu negocio?", 
        tipo: 'texto_largo', 
        ayuda: "El negocio puede estar financiando causas sociales. Información relevante." 
      },
    ]
  },
  {
    bloque: 2,
    titulo: "Tu Negocio",
    icono: Briefcase,
    color: "bg-emerald-500",
    objetivo: "Conocer la identificación, formalización y contexto operativo del negocio.",
    recomendaciones: [
      "Ubicación geográfica determina acceso a mercados y nivel de competencia local",
      "El sector determina benchmarks de márgenes específicos",
      "Antigüedad es predictor directo de supervivencia"
    ],
    preguntas: [
      { 
        id: 'p12', 
        texto: "¿Cuál es el nombre de tu negocio? ¿Tiene razón social registrada?", 
        tipo: 'texto', 
        ayuda: "Para identificar la unidad económica en el DENUE de INEGI." 
      },
      { 
        id: 'p13', 
        texto: "¿En qué dirección se encuentra ubicado?", 
        tipo: 'texto', 
        ayuda: "Ubicación geográfica determina: acceso a mercados, competencia local, riesgos de seguridad por zona." 
      },
      { 
        id: 'p14', 
        texto: "¿Me podrías compartir el código postal de la zona?", 
        tipo: 'texto', 
        ayuda: "Variable proxy para nivel socioeconómico del área, datos de penetración bancaria por CP." 
      },
      { 
        id: 'p15', 
        texto: "¿A qué se dedica exactamente el negocio? ¿Qué productos o servicios ofrece?", 
        tipo: 'texto_largo', 
        ayuda: "El sector determina benchmarks de márgenes: comercio 25-35%, servicios 50-70%, manufactura 30-45%." 
      },
      { 
        id: 'p16', 
        texto: "¿Cuánto tiempo tiene el negocio funcionando?", 
        tipo: 'texto', 
        ayuda: "Antigüedad es predictor directo de supervivencia: 75% de PyMEs cierran antes de 2 años. Peso 2% en IVE." 
      },
      { 
        id: 'p17', 
        texto: "¿El negocio está registrado formalmente? Me refiero a si tiene RFC, acta constitutiva, o si opera como persona física.", 
        tipo: 'opcion', 
        opciones: ['No registrado', 'Persona física con RFC', 'Persona moral (empresa)', 'En trámite'], 
        ayuda: "Determina Gap de Formalización (peso 8% en IVE)." 
      },
      { 
        id: 'p18', 
        texto: "¿Qué documentación oficial tienes del negocio? Por ejemplo: RFC, registro patronal en IMSS, licencia municipal, situación fiscal al corriente.", 
        tipo: 'multiple', 
        opciones: ['RFC activo', 'Registro patronal IMSS', 'Licencia municipal', 'Situación fiscal al corriente', 'Acta constitutiva', 'Ninguna'], 
        ayuda: "Cada requisito suma puntos al índice de formalización." 
      },
      { 
        id: 'p19', 
        texto: "¿El negocio cuenta con algún tipo de seguro? Por ejemplo, contra robo, incendio o responsabilidad civil.", 
        tipo: 'opcion', 
        opciones: ['No tiene seguro', 'Seguro contra robo', 'Seguro contra incendio', 'Responsabilidad civil', 'Varios seguros'], 
        ayuda: "Seguros = transferencia de riesgo. Indica nivel de gestión de riesgos." 
      },
    ]
  },
  {
    bloque: 3,
    titulo: "Situación Financiera",
    icono: DollarSign,
    color: "bg-violet-500",
    objetivo: "Obtener datos para calcular ratios financieros, punto de equilibrio y variabilidad de ingresos.",
    recomendaciones: [
      "Sea específico con números. Ayude al cliente a calcular.",
      "Pregunte '¿aproximadamente?' si duda",
      "Los datos son confidenciales"
    ],
    preguntas: [
      { 
        id: 'p20', 
        texto: "Ahora, me gustaría entender la situación financiera del negocio, siempre con total confidencialidad. ¿Cuáles fueron las ventas del último mes?", 
        tipo: 'numero', 
        ayuda: "Dato base para calcular ventas diarias promedio, margen de utilidad, punto de equilibrio." 
      },
      { 
        id: 'p21', 
        texto: "¿Podrías decirme las ventas de los últimos 12 meses? Esto me ayuda a entender si ha habido variaciones importantes a lo largo del año.", 
        tipo: 'texto_largo', 
        ayuda: "FUNDAMENTAL para calcular Coeficiente de Variación de Ingresos (CV), peso 15% en IVE." 
      },
      { 
        id: 'p22', 
        texto: "De lo que vendes, ¿qué porcentaje se destina al costo de los productos o insumos que necesitas para operar?", 
        tipo: 'numero', 
        ayuda: "Para calcular Margen Bruto. Benchmarks: comercio 25-35% margen bruto, servicios 50-70%." 
      },
      { 
        id: 'p23', 
        texto: "¿Cuáles son tus gastos fijos mensuales? Es decir, lo que tienes que pagar independientemente de cuánto vendas: renta, servicios, nómina.", 
        tipo: 'numero', 
        ayuda: "Esencial para calcular Punto de Equilibrio. Peso 10% en IVE." 
      },
      { 
        id: 'p24', 
        texto: "¿Tienes gastos variables también? Aquellos que cambian según la operación, como comisiones, publicidad, logística.", 
        tipo: 'numero', 
        ayuda: "Junto con gastos fijos permite calcular estructura de costos total." 
      },
      { 
        id: 'p25', 
        texto: "Al final del mes, después de todos los gastos, ¿cuánto queda como utilidad?", 
        tipo: 'numero', 
        ayuda: "Para calcular Margen Neto (peso 12% en IVE). Margen neto <2% = crítico, >15% = excelente." 
      },
      { 
        id: 'p26', 
        texto: "¿El negocio tiene deudas actualmente? ¿De qué tipo serían?", 
        tipo: 'texto_largo', 
        ayuda: "Identifica estructura de financiamiento. Peso 5% en IVE." 
      },
      { 
        id: 'p27', 
        texto: "¿Cuál es el monto total de las deudas y cuánto se destina mensualmente a pagarlas?", 
        tipo: 'texto', 
        ayuda: "Para calcular Endeudamiento total y Capacidad de pago." 
      },
    ]
  },
  {
    bloque: 4,
    titulo: "Operación del Negocio",
    icono: Settings,
    color: "bg-orange-500",
    objetivo: "Calcular el Ciclo de Conversión de Efectivo (CCC) y evaluar el flujo operativo.",
    recomendaciones: [
      "CCC = DIO + DSO - DPO",
      "Inventario excesivo = capital inmovilizado",
      "DSO alto = problemas de cobranza"
    ],
    preguntas: [
      { 
        id: 'p28', 
        texto: "¿Qué valor de inventario o mercancía tienes en este momento?", 
        tipo: 'numero', 
        ayuda: "Para calcular DIO (Days Inventory Outstanding)." 
      },
      { 
        id: 'p29', 
        texto: "¿Cuánto tiempo tardas en rotar ese inventario? ¿Cada cuánto necesitas reabastecer?", 
        tipo: 'texto', 
        ayuda: "Benchmarks: comercios 30-60 días, perecederos 5-15 días, manufactura 45-90 días." 
      },
      { 
        id: 'p30', 
        texto: "¿Tienes clientes con saldo pendiente? ¿Cuánto te deben y desde hace cuánto tiempo?", 
        tipo: 'texto_largo', 
        ayuda: "Para calcular DSO (Days Sales Outstanding). DSO >90 días = alerta roja." 
      },
      { 
        id: 'p31', 
        texto: "¿A tus clientes les das crédito? ¿En qué condiciones?", 
        tipo: 'texto_largo', 
        ayuda: "Define política de crédito. Vender a crédito aumenta ventas pero inmoviliza capital." 
      },
      { 
        id: 'p32', 
        texto: "¿Y tus proveedores? ¿Te permiten pagar a crédito o es de contado?", 
        tipo: 'texto_largo', 
        ayuda: "Crédito de proveedores = financiamiento sin interés." 
      },
      { 
        id: 'p33', 
        texto: "¿Cuánto debes actualmente a proveedores?", 
        tipo: 'numero', 
        ayuda: "Para calcular DPO (Days Payable Outstanding)." 
      },
      { 
        id: 'p34', 
        texto: "¿Trabajas con proveedores del extranjero o que facturen en dólares?", 
        tipo: 'opcion', 
        opciones: ['No', 'Sí, algunos', 'Sí, la mayoría', 'Todos son del extranjero'], 
        ayuda: "Para calcular Exposición Cambiaria. Peso 5% en IVE. Exposición >30% = crítico sin cobertura." 
      },
    ]
  },
  {
    bloque: 5,
    titulo: "Tu Relación con el Negocio",
    icono: Heart,
    color: "bg-amber-500",
    objetivo: "Calcular el Índice de Dependencia del Dueño (IDD) y evaluar riesgos operativos.",
    recomendaciones: [
      "La dependencia del dueño es el mayor riesgo invisible",
      "Un negocio que no funciona sin el dueño no es escalable",
      "Identifique qué pasaría si el dueño se enferma 2 semanas"
    ],
    preguntas: [
      { 
        id: 'p35', 
        texto: "En un día típico, ¿cuántas horas estás presente en el negocio?", 
        tipo: 'numero', 
        ayuda: "Variable V1 del IDD. Negocio que requiere presencia constante es menos escalable. Peso 8% en IVE." 
      },
      { 
        id: 'p36', 
        texto: "¿Tu equipo puede tomar decisiones operativas sin consultarte, o la mayoría de las decisiones pasan por ti?", 
        tipo: 'opcion', 
        opciones: ['Todo pasa por mí', 'Algunas decisiones solos', 'La mayoría solos', 'Son totalmente autónomos'], 
        ayuda: "Variable V2 del IDD. Autonomía del personal = sistemas funcionando." 
      },
      { 
        id: 'p37', 
        texto: "¿Tienes clientes que prefieran tratar exclusivamente contigo?", 
        tipo: 'opcion', 
        opciones: ['Sí, muchos', 'Sí, algunos', 'Muy pocos', 'No, tratan con cualquiera'], 
        ayuda: "Variable V3 del IDD. Concentración de relación personal = riesgo." 
      },
      { 
        id: 'p38', 
        texto: "¿Los procesos del negocio están documentados? Es decir, si tú no estuvieras un día, ¿tu equipo sabe exactamente qué hacer?", 
        tipo: 'opcion', 
        opciones: ['No hay nada documentado', 'Algo está documentado', 'La mayoría documentado', 'Todo documentado'], 
        ayuda: "Variable V4 del IDD. Documentación = transferibilidad, escalabilidad." 
      },
      { 
        id: 'p39', 
        texto: "¿Quienes son tus clientes principales? ¿Hay uno que represente una parte importante de tus ventas?", 
        tipo: 'texto_largo', 
        ayuda: "Para calcular Concentración Top 3. Peso 10% en IVE. Concentración >70% = crítico." 
      },
      { 
        id: 'p40', 
        texto: "¿Si tu cliente más importante dejara de comprar, qué impacto tendría en el negocio?", 
        tipo: 'texto_largo', 
        ayuda: "Validación cualitativa de la concentración de clientes." 
      },
      { 
        id: 'p41', 
        texto: "¿Algún familiar trabaja contigo en el negocio?", 
        tipo: 'texto_largo', 
        ayuda: "Participación familiar. Familiar trabajando = compromiso mayor, pero posible confusión entre gastos personales y del negocio." 
      },
      { 
        id: 'p42', 
        texto: "¿Tienes personal con alguna condición especial o que requiera adaptaciones en su trabajo?", 
        tipo: 'texto_largo', 
        ayuda: "Puede ser decisión personal del dueño. Afecta estructura de nómina." 
      },
    ]
  },
  {
    bloque: 6,
    titulo: "Cierre",
    icono: MessageSquare,
    color: "bg-rose-500",
    objetivo: "Permitir al cliente mencionar factores no cubiertos y generar cierre positivo.",
    recomendaciones: [
      "Permite al cliente mencionar factores no cubiertos",
      "Genera cierre positivo y demuestra interés genuino",
      "Puede revelar información valiosa no capturada"
    ],
    preguntas: [
      { 
        id: 'p43', 
        texto: "¿Hay algo más que consideres importante compartir sobre tu negocio o situación personal que no hayamos platicado?", 
        tipo: 'texto_largo', 
        ayuda: "Espacio para información adicional relevante." 
      },
    ]
  }
]

// ============================================
// CONFIGURACIÓN DE AGENTES (inicializar desde localStorage)
// ============================================
const getInitialAgentes = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('neltal_agentes_config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Si hay error, usar defaults
      }
    }
  }
  return [
    { id: 'jarvis', nombre: 'JARVIS', rol: 'Orquestador', activo: true, modelo: 'grok-beta', temperatura: 0.7 },
    { id: 'entrevistador', nombre: 'Entrevistador', rol: 'Recolección de Datos', activo: true, modelo: 'grok-beta', temperatura: 0.8 },
    { id: 'analista', nombre: 'Analista Financiero', rol: 'Cálculo de IVE', activo: true, modelo: 'llama3.2', temperatura: 0.5 },
    { id: 'recomendador', nombre: 'Recomendador', rol: 'Planes de Acción', activo: true, modelo: 'grok-beta', temperatura: 0.6 },
  ]
}

// ============================================
// FUNCIONES DE CÁLCULO DE MÉTRICAS
// ============================================
function calcularMetricas(respuestas: Record<string, any>) {
  const metricas: Record<string, any> = {}
  
  // Ventas
  const ventasMes = Number(respuestas.p20) || 0
  metricas.ventas_mes_promedio = ventasMes
  
  // Gastos
  const gastosFijos = Number(respuestas.p23) || 0
  const gastosVariables = Number(respuestas.p24) || 0
  const utilidad = Number(respuestas.p25) || 0
  
  metricas.gastos_fijos = gastosFijos
  metricas.gastos_variables = gastosVariables
  metricas.utilidad_estimada = utilidad
  
  // Margen
  if (ventasMes > 0) {
    metricas.margen_utilidad = ((utilidad / ventasMes) * 100).toFixed(1)
  }
  
  // CCC (Ciclo de Conversión de Efectivo)
  const inventarioDias = Number(respuestas.p29) ? parseInt(respuestas.p29) : 0
  metricas.inventario_dias = inventarioDias
  metricas.ccc_dias = inventarioDias // Simplificado
  metricas.ccc_nivel = inventarioDias > 60 ? 'CRÍTICO' : 
                       inventarioDias > 45 ? 'ALTO' : 
                       inventarioDias > 30 ? 'MEDIO' : 'BUENO'
  
  // IDD (Índice de Dependencia del Dueño)
  let iddScore = 0
  const horasPresencia = Number(respuestas.p35) || 0
  const decisiones = respuestas.p36 || ''
  const clientesExclusivos = respuestas.p37 || ''
  const documentacion = respuestas.p38 || ''
  
  if (horasPresencia >= 10) iddScore += 25
  else if (horasPresencia >= 8) iddScore += 15
  else if (horasPresencia >= 6) iddScore += 5
  
  if (decisiones.includes('Todo pasa')) iddScore += 30
  else if (decisiones.includes('Algunas')) iddScore += 15
  
  if (clientesExclusivos.includes('muchos')) iddScore += 25
  else if (clientesExclusivos.includes('algunos')) iddScore += 15
  
  if (documentacion.includes('No hay')) iddScore += 20
  else if (documentacion.includes('Algo')) iddScore += 10
  
  metricas.idd = Math.min(iddScore, 100)
  metricas.idd_nivel = iddScore >= 70 ? 'CRÍTICO' : iddScore >= 50 ? 'ALTO' : iddScore >= 30 ? 'MEDIO' : 'BAJO'
  
  // Formalización
  const formalidad = respuestas.p17 || ''
  const documentos = respuestas.p18 || []
  let gfActual = 0
  
  if (formalidad.includes('Persona moral')) gfActual += 40
  else if (formalidad.includes('Persona física')) gfActual += 25
  else if (formalidad.includes('trámite')) gfActual += 10
  
  if (Array.isArray(documentos)) {
    if (documentos.includes('RFC activo')) gfActual += 15
    if (documentos.includes('Registro patronal IMSS')) gfActual += 15
    if (documentos.includes('Licencia municipal')) gfActual += 10
    if (documentos.includes('Situación fiscal al corriente')) gfActual += 20
    if (documentos.includes('Acta constitutiva')) gfActual += 15
  }
  
  metricas.gf_actual = gfActual
  metricas.gf_gap = 100 - gfActual
  metricas.gf_nivel = gfActual >= 80 ? 'FORMAL' : gfActual >= 50 ? 'SEMI-FORMAL' : gfActual >= 25 ? 'INFORMAL BAJO' : 'INFORMAL CRÍTICO'
  
  // Exposición Cambiaria
  const proveedoresExt = respuestas.p34 || ''
  if (proveedoresExt.includes('Todos')) metricas.exposicion_cambiaria = 'CRÍTICA'
  else if (proveedoresExt.includes('mayoría')) metricas.exposicion_cambiaria = 'ALTA'
  else if (proveedoresExt.includes('algunos')) metricas.exposicion_cambiaria = 'MEDIA'
  else metricas.exposicion_cambiaria = 'BAJA'
  
  // IVE (Índice de Vulnerabilidad Económica)
  let iveScore = 0
  
  // Variabilidad (simplificado, necesitaría p21 detallado)
  iveScore += 8 // Base media
  
  if (metricas.ccc_nivel === 'CRÍTICO') iveScore += 12
  else if (metricas.ccc_nivel === 'ALTO') iveScore += 8
  else if (metricas.ccc_nivel === 'MEDIO') iveScore += 4
  
  if (metricas.idd_nivel === 'CRÍTICO') iveScore += 20
  else if (metricas.idd_nivel === 'ALTO') iveScore += 12
  else if (metricas.idd_nivel === 'MEDIO') iveScore += 6
  
  if (metricas.gf_nivel === 'INFORMAL CRÍTICO') iveScore += 10
  else if (metricas.gf_nivel === 'INFORMAL BAJO') iveScore += 6
  else if (metricas.gf_nivel === 'SEMI-FORMAL') iveScore += 3
  
  if (utilidad < 0) iveScore += 20
  else if (Number(metricas.margen_utilidad) < 10) iveScore += 10
  
  if (metricas.exposicion_cambiaria === 'CRÍTICA') iveScore += 10
  else if (metricas.exposicion_cambiaria === 'ALTA') iveScore += 5
  
  metricas.ive = Math.min(iveScore, 100)
  metricas.ive_nivel = iveScore >= 70 ? 'CRÍTICO' : iveScore >= 50 ? 'ALTO' : iveScore >= 30 ? 'MEDIO' : 'BAJO'
  
  return metricas
}

function generarAnalisis(respuestas: Record<string, any>, metricas: Record<string, any>) {
  const alertas: string[] = []
  const fortalezas: string[] = []
  const recomendaciones: string[] = []
  const oportunidades: string[] = []
  
  // IDD
  if (metricas.idd_nivel === 'CRÍTICO') {
    alertas.push(`IDD ${metricas.idd}% - Negocio depende totalmente del dueño`)
    recomendaciones.push('Documentar procesos y capacitar personal urgentemente')
  } else if (metricas.idd_nivel === 'BAJO') {
    fortalezas.push('Negocio puede operar sin el dueño')
  }
  
  // Formalización
  if (metricas.gf_nivel === 'INFORMAL CRÍTICO') {
    alertas.push('Negocio 100% informal - Sin acceso a crédito formal')
    recomendaciones.push('Obtener RFC y comenzar a facturar')
  } else if (metricas.gf_nivel === 'FORMAL') {
    fortalezas.push('Negocio formalizado - Acceso a servicios financieros')
  }
  
  // Utilidad
  if (metricas.utilidad_estimada < 0) {
    alertas.push(`Pérdida mensual estimada: $${Math.abs(metricas.utilidad_estimada).toLocaleString()}`)
    recomendaciones.push('Revisar estructura de costos urgentemente')
  } else if (metricas.utilidad_estimada > 0) {
    fortalezas.push(`Utilidad mensual: $${metricas.utilidad_estimada.toLocaleString()}`)
  }
  
  // CCC
  if (metricas.ccc_nivel === 'CRÍTICO') {
    alertas.push(`Inventario de ${metricas.inventario_dias} días - Capital atrapado`)
    recomendaciones.push('Reducir días de inventario o negociar crédito con proveedores')
  } else if (metricas.ccc_nivel === 'BUENO') {
    fortalezas.push('Rotación de inventario eficiente')
  }
  
  // Exposición cambiaria
  if (metricas.exposicion_cambiaria === 'CRÍTICA' || metricas.exposicion_cambiaria === 'ALTA') {
    alertas.push(`Exposición cambiaria ${metricas.exposicion_cambiaria}`)
    recomendaciones.push('Considerar cobertura cambiaria o buscar proveedores locales')
  }
  
  // IVE
  if (metricas.ive_nivel === 'CRÍTICO') {
    alertas.push(`IVE ${metricas.ive}/100 - Vulnerabilidad CRÍTICA`)
  } else if (metricas.ive_nivel === 'BAJO') {
    fortalezas.push(`IVE ${metricas.ive}/100 - Buena salud financiera`)
  }
  
  // Oportunidades
  if (metricas.gf_actual < 50) oportunidades.push('Proceso de formalización')
  
  return { alertas, fortalezas, recomendaciones, oportunidades }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Home() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [nuevoClienteOpen, setNuevoClienteOpen] = useState(false)
  const [entrevistaOpen, setEntrevistaOpen] = useState(false)
  const [reporteOpen, setReporteOpen] = useState(false)
  const [bloqueActual, setBloqueActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, any>>({})
  const [clienteActual, setClienteActual] = useState<Record<string, any>>({})
  const [clientes, setClientes] = useState<any[]>([])
  const [diagnosticos, setDiagnosticos] = useState<any[]>([])
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<any>(null)
  const [descargandoPdf, setDescargandoPdf] = useState(false)
  const [agentes, setAgentes] = useState(getInitialAgentes)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guardandoAgentes, setGuardandoAgentes] = useState(false)
  const [respuestaJarvis, setRespuestaJarvis] = useState<string | null>(null)
  const [enviandoAJarvis, setEnviandoAJarvis] = useState(false)
  const [jarvisUrl, setJarvisUrl] = useState(getJarvisUrl)
  const [jarvisStatus, setJarvisStatus] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const [probandoJarvis, setProbandoJarvis] = useState(false)
  const [guardadoAutomatico, setGuardadoAutomatico] = useState(false)
  const [haySesionGuardada, setHaySesionGuardada] = useState<{nombreNegocio: string, timestamp: string} | null>(null)
  
  // Ref para scroll automático
  const entrevistaRef = useRef<HTMLDivElement>(null)
  
  const [clienteForm, setClienteForm] = useState({
    nombre: '', nombreNegocio: '', giro: '', telefono: '', ubicacion: ''
  })

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    fetchData()
    verificarSesionGuardada()
  }, [])

  // Guardar configuración de agentes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('neltal_agentes_config', JSON.stringify(agentes))
    }
  }, [agentes])

  // ============================================
  // PERSISTENCIA AUTOMÁTICA
  // ============================================
  
  // Guardar respuestas automáticamente
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(respuestas).length > 0 && clienteActual?.id) {
      const sesionData = {
        respuestas,
        bloqueActual,
        clienteActual,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('neltal_sesion_activa', JSON.stringify(sesionData))
      
      setGuardadoAutomatico(true)
      setTimeout(() => setGuardadoAutomatico(false), 1500)
    }
  }, [respuestas, bloqueActual, clienteActual])

  const verificarSesionGuardada = () => {
    if (typeof window !== 'undefined') {
      const sesionGuardada = localStorage.getItem('neltal_sesion_activa')
      if (sesionGuardada) {
        try {
          const sesion = JSON.parse(sesionGuardada)
          const horasDiferencia = (new Date().getTime() - new Date(sesion.timestamp).getTime()) / (1000 * 60 * 60)
          
          if (horasDiferencia < 24 && sesion.clienteActual?.id) {
            setHaySesionGuardada({
              nombreNegocio: sesion.clienteActual.nombreNegocio,
              timestamp: sesion.timestamp
            })
          }
        } catch (e) {
          console.log('Error verificando sesión:', e)
        }
      }
    }
  }

  const recuperarSesion = () => {
    if (typeof window !== 'undefined') {
      const sesionGuardada = localStorage.getItem('neltal_sesion_activa')
      if (sesionGuardada) {
        try {
          const sesion = JSON.parse(sesionGuardada)
          setRespuestas(sesion.respuestas || {})
          setBloqueActual(sesion.bloqueActual || 0)
          setClienteActual(sesion.clienteActual)
          setEntrevistaOpen(true)
          setHaySesionGuardada(null)
        } catch (e) {
          console.log('Error recuperando sesión:', e)
        }
      }
    }
  }

  const limpiarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neltal_sesion_activa')
    }
  }

  // Continuar entrevista de un cliente existente
  const continuarEntrevista = (cliente: any) => {
    // Buscar si hay una sesión guardada para este cliente específico
    const sesionGuardada = localStorage.getItem('neltal_sesion_activa')
    if (sesionGuardada) {
      try {
        const sesion = JSON.parse(sesionGuardada)
        if (sesion.clienteActual?.id === cliente.id) {
          // Recuperar sesión existente
          setRespuestas(sesion.respuestas || {})
          setBloqueActual(sesion.bloqueActual || 0)
          setClienteActual(cliente)
          setEntrevistaOpen(true)
          setHaySesionGuardada(null)
          return
        }
      } catch (e) {
        console.log('Error recuperando sesión:', e)
      }
    }
    
    // Si no hay sesión guardada para este cliente, empezar nueva
    setClienteActual(cliente)
    setBloqueActual(0)
    setRespuestas({})
    setEntrevistaOpen(true)
    limpiarSesion()
  }

  const fetchData = async () => {
    try {
      const [clientesRes, diagRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/diagnosticos')
      ])
      const clientesData = await clientesRes.json()
      const diagData = await diagRes.json()
      
      setClientes(Array.isArray(clientesData) ? clientesData : [])
      setDiagnosticos(Array.isArray(diagData) ? diagData : [])
    } catch (error) {
      console.error('Error:', error)
      setClientes([])
      setDiagnosticos([])
    } finally {
      setLoading(false)
    }
  }

  const crearCliente = async () => {
    if (!clienteForm.nombre || !clienteForm.nombreNegocio) {
      alert('Por favor complete el nombre y nombre del negocio')
      return
    }
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      })
      const nuevo = await res.json()
      setClienteActual(nuevo)
      setClientes([nuevo, ...clientes])
      setNuevoClienteOpen(false)
      setEntrevistaOpen(true)
      setBloqueActual(0)
      setRespuestas({})
      limpiarSesion()
      
      // Scroll automático al inicio de la entrevista
      setTimeout(() => {
        entrevistaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear cliente')
    }
  }

  const totalPreguntas = preguntasEntrevista.reduce((sum, b) => sum + b.preguntas.length, 0)
  const respondidas = Object.keys(respuestas).filter(k => {
    const val = respuestas[k]
    if (val === undefined || val === '' || val === null) return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  }).length
  const progreso = (respondidas / totalPreguntas) * 100
  
  const bloqueActualData = preguntasEntrevista[bloqueActual]
  const metricas = calcularMetricas(respuestas)
  const analisis = generarAnalisis(respuestas, metricas)

  const guardarDiagnostico = async () => {
    if (progreso < 50) {
      alert('Complete al menos 50% de la entrevista para guardar')
      return
    }
    
    setEnviandoAJarvis(true)
    setRespuestaJarvis(null)
    
    try {
      // 1. Guardar en base de datos local
      const res = await fetch('/api/diagnosticos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteActual.id,
          respuestas,
          metricas,
          analisis,
          estado: 'completado'
        })
      })
      const diagnosticoGuardado = await res.json()
      
      // 2. Enviar a JARVIS (solo si hay URL configurada)
      if (jarvisUrl) {
        try {
          const jarvisRes = await fetch(`${jarvisUrl}/api/diagnostico/completo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cliente_id: clienteActual.id,
              nombre_cliente: clienteActual.nombre,
              nombre_negocio: clienteActual.nombreNegocio,
              respuestas,
              metricas,
              analisis,
              fecha: new Date().toISOString()
            })
          })
          
          if (jarvisRes.ok) {
            const jarvisData = await jarvisRes.json()
            setRespuestaJarvis(jarvisData.analisis_jarvis || jarvisData.mensaje)
            setJarvisStatus('online')
            console.log('✅ JARVIS recibió el diagnóstico:', jarvisData.status)
          } else {
            console.warn('⚠️ JARVIS respondió con error')
            setJarvisStatus('offline')
            setRespuestaJarvis('Diagnóstico guardado localmente. JARVIS respondió con error.')
          }
        } catch (jarvisError) {
          console.warn('⚠️ Error conectando con JARVIS:', jarvisError)
          setJarvisStatus('offline')
          setRespuestaJarvis('Diagnóstico guardado localmente. No se pudo conectar con JARVIS.')
        }
      } else {
        setRespuestaJarvis('Diagnóstico guardado localmente. Configura la URL de JARVIS en la pestaña Agentes.')
      }
      
      setDiagnosticoSeleccionado(diagnosticoGuardado)
      setEntrevistaOpen(false)
      limpiarSesion()
      setReporteOpen(true)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar diagnóstico')
    } finally {
      setEnviandoAJarvis(false)
    }
  }

  const verReporte = (diagnostico: any) => {
    const metricasDiag = {
      ventas_mes_promedio: diagnostico.ventasMesPromedio,
      gastos_fijos: diagnostico.gastosFijos,
      utilidad_estimada: diagnostico.utilidadEstimada,
      margen_utilidad: diagnostico.margenUtilidad,
      ccc_dias: diagnostico.cccDias,
      ccc_nivel: diagnostico.cccNivel,
      idd: diagnostico.idd,
      idd_nivel: diagnostico.iddNivel,
      gf_actual: diagnostico.gfActual,
      gf_nivel: diagnostico.gfNivel,
      ive: diagnostico.ive,
      ive_nivel: diagnostico.iveNivel,
    }
    const analisisDiag = {
      alertas: diagnostico.alertas ? JSON.parse(diagnostico.alertas) : [],
      fortalezas: diagnostico.fortalezas ? JSON.parse(diagnostico.fortalezas) : [],
      recomendaciones: diagnostico.recomendaciones ? JSON.parse(diagnostico.recomendaciones) : [],
      oportunidades: diagnostico.oportunidades ? JSON.parse(diagnostico.oportunidades) : [],
    }
    const respuestasDiag = diagnostico.respuestas ? JSON.parse(diagnostico.respuestas) : {}
    
    setDiagnosticoSeleccionado({
      ...diagnostico,
      metricasCalculadas: metricasDiag,
      analisisCalculado: analisisDiag,
      respuestasParseadas: respuestasDiag
    })
    setReporteOpen(true)
  }

  const descargarPDF = async (diagnosticoId: string) => {
    setDescargandoPdf(true)
    try {
      const response = await fetch(`/api/pdf?id=${diagnosticoId}`)
      if (!response.ok) throw new Error('Error al generar PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagnostico_NELTAL_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar PDF')
    } finally {
      setDescargandoPdf(false)
    }
  }

  // Exportar datos a CSV (FUNCIONAL)
  const exportarCSV = () => {
    if (diagnosticos.length === 0) {
      alert('No hay datos para exportar')
      return
    }
    
    const headers = ['Negocio', 'Dueño', 'IVE', 'IDD %', 'GF %', 'Ventas/Mes', 'Utilidad', 'Fecha']
    const rows = diagnosticos.map(d => [
      d.cliente?.nombreNegocio || 'N/A',
      d.cliente?.nombre || 'N/A',
      d.ive || 0,
      d.idd || 0,
      d.gfActual || 0,
      d.ventasMesPromedio || 0,
      d.utilidadEstimada || 0,
      new Date(d.createdAt).toLocaleDateString('es-MX')
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neltal_diagnosticos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const eliminarDiagnostico = async (id: string) => {
    if (!confirm('¿Eliminar este diagnóstico?')) return
    try {
      await fetch(`/api/diagnosticos?id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleMultiple = (preguntaId: string, opcion: string) => {
    setRespuestas(prev => {
      const actual = prev[preguntaId] || []
      if (actual.includes(opcion)) {
        return { ...prev, [preguntaId]: actual.filter((o: string) => o !== opcion) }
      }
      return { ...prev, [preguntaId]: [...actual, opcion] }
    })
  }

  // Guardar configuración de agentes
  const guardarConfigAgentes = () => {
    setGuardandoAgentes(true)
    localStorage.setItem('neltal_agentes_config', JSON.stringify(agentes))
    setTimeout(() => {
      setGuardandoAgentes(false)
      alert('Configuración guardada')
    }, 500)
  }

  // Probar conexión con JARVIS
  const probarConexionJarvis = async () => {
    if (!jarvisUrl) {
      alert('Ingresa la URL de JARVIS primero')
      return
    }
    
    setProbandoJarvis(true)
    setJarvisStatus('unknown')
    
    try {
      const res = await fetch(`${jarvisUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (res.ok) {
        setJarvisStatus('online')
        localStorage.setItem('neltal_jarvis_url', jarvisUrl)
      } else {
        setJarvisStatus('offline')
      }
    } catch {
      setJarvisStatus('offline')
    } finally {
      setProbandoJarvis(false)
    }
  }

  // Guardar URL de JARVIS
  const guardarUrlJarvis = () => {
    localStorage.setItem('neltal_jarvis_url', jarvisUrl)
    alert('URL de JARVIS guardada')
  }

  // Ir a siguiente bloque
  const siguienteBloque = () => {
    if (bloqueActual < preguntasEntrevista.length - 1) {
      setBloqueActual(bloqueActual + 1)
      entrevistaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Ir a bloque anterior
  const bloqueAnterior = () => {
    if (bloqueActual > 0) {
      setBloqueActual(bloqueActual - 1)
      entrevistaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Verificar si un cliente tiene diagnóstico completado
  const clienteTieneDiagnostico = (clienteId: string) => {
    return diagnosticos.some(d => d.clienteId === clienteId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="h-12 w-12 animate-pulse text-blue-600" />
      </div>
    )
  }

  const metricasReporte = diagnosticoSeleccionado?.metricasCalculadas || metricas
  const analisisReporte = diagnosticoSeleccionado?.analisisCalculado || analisis
  const clienteReporte = diagnosticoSeleccionado?.cliente || clienteActual

  const statsDashboard = {
    totalClientes: clientes.length,
    totalDiagnosticos: diagnosticos.length,
    criticos: diagnosticos.filter(d => d.iveNivel === 'CRÍTICO' || d.iveNivel === 'ALTO').length,
    formales: diagnosticos.filter(d => d.gfNivel === 'FORMAL').length,
    promedioIVE: diagnosticos.length > 0 
      ? Math.round(diagnosticos.reduce((sum, d) => sum + (d.ive || 0), 0) / diagnosticos.length)
      : 0,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">NELTAL</h1>
                <p className="text-xs text-slate-500">Diagnóstico Financiero</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <BarChart3 className="h-5 w-5" /> Dashboard
              </button>
              <button onClick={() => setActiveTab('agentes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'agentes' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Bot className="h-5 w-5" /> Agentes
              </button>
            </div>
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>{agentes.filter(a => a.activo).length} agentes activos</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'agentes' && 'Configuración de Agentes'}
              </h2>
            </div>
            <Button onClick={() => setNuevoClienteOpen(true)} className="bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Nueva Entrevista
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Aviso de sesión guardada */}
              {haySesionGuardada && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-800">Tienes una entrevista sin terminar</p>
                          <p className="text-sm text-amber-700">
                            <strong>{haySesionGuardada.nombreNegocio}</strong> - Guardada hace {Math.round((new Date().getTime() - new Date(haySesionGuardada.timestamp).getTime()) / 60000)} minutos
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={recuperarSesion} className="bg-amber-600 hover:bg-amber-700">
                          <Play className="h-4 w-4 mr-2" /> Continuar
                        </Button>
                        <Button onClick={() => { limpiarSesion(); setHaySesionGuardada(null); }} variant="outline">
                          Descartar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{statsDashboard.totalClientes}</p>
                        <p className="text-xs text-slate-500">Clientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold">{statsDashboard.totalDiagnosticos}</p>
                        <p className="text-xs text-slate-500">Diagnósticos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">{statsDashboard.criticos}</p>
                        <p className="text-xs text-slate-500">Críticos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{statsDashboard.formales}</p>
                        <p className="text-xs text-slate-500">Formales</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-rose-600" />
                      <div>
                        <p className="text-2xl font-bold">{statsDashboard.promedioIVE}</p>
                        <p className="text-xs text-slate-500">IVE Promedio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Clientes
                  </CardTitle>
                  <CardDescription>Click en un cliente para continuar su entrevista o crear un nuevo diagnóstico</CardDescription>
                </CardHeader>
                <CardContent>
                  {clientes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No hay clientes registrados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Negocio</TableHead>
                          <TableHead>Dueño</TableHead>
                          <TableHead>Giro</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientes.map((c) => {
                          const tieneDiagnostico = clienteTieneDiagnostico(c.id)
                          return (
                            <TableRow 
                              key={c.id} 
                              className="cursor-pointer hover:bg-slate-50" 
                              onClick={() => continuarEntrevista(c)}
                            >
                              <TableCell className="font-medium">{c.nombreNegocio}</TableCell>
                              <TableCell>{c.nombre}</TableCell>
                              <TableCell>{c.giro || '-'}</TableCell>
                              <TableCell>{c.ubicacion || '-'}</TableCell>
                              <TableCell>
                                {tieneDiagnostico ? (
                                  <Badge variant="default" className="bg-green-600">Diagnosticado</Badge>
                                ) : (
                                  <Badge variant="outline">Pendiente</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    continuarEntrevista(c); 
                                  }}
                                  title="Nueva entrevista"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Acciones y tabla de diagnósticos */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={exportarCSV} disabled={diagnosticos.length === 0}>
                  <Download className="h-4 w-4 mr-2" /> Exportar CSV
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Diagnósticos
                  </CardTitle>
                  <CardDescription>Click en una fila para ver el reporte completo</CardDescription>
                </CardHeader>
                <CardContent>
                  {diagnosticos.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No hay diagnósticos</p>
                      <Button onClick={() => setNuevoClienteOpen(true)} className="mt-4 bg-blue-600">
                        <Plus className="h-4 w-4 mr-2" /> Nueva Entrevista
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Negocio</TableHead>
                          <TableHead>Dueño</TableHead>
                          <TableHead>IVE</TableHead>
                          <TableHead>IDD</TableHead>
                          <TableHead>Formalidad</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diagnosticos.map((d) => (
                          <TableRow key={d.id} className="cursor-pointer hover:bg-slate-50" onClick={() => verReporte(d)}>
                            <TableCell className="font-medium">{d.cliente?.nombreNegocio || 'N/A'}</TableCell>
                            <TableCell>{d.cliente?.nombre || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={d.iveNivel === 'CRÍTICO' ? 'destructive' : d.iveNivel === 'ALTO' ? 'default' : 'secondary'}>
                                {d.ive} - {d.iveNivel}
                              </Badge>
                            </TableCell>
                            <TableCell>{d.idd}%</TableCell>
                            <TableCell>
                              <Badge variant={d.gfNivel === 'FORMAL' ? 'default' : 'outline'}>
                                {d.gfNivel}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(d.createdAt).toLocaleDateString('es-MX')}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); descargarPDF(d.id); }}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); eliminarDiagnostico(d.id); }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Configuración de Agentes */}
          {activeTab === 'agentes' && (
            <div className="space-y-6">
              {/* Configuración de JARVIS */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Conexión con JARVIS
                      </CardTitle>
                      <CardDescription>
                        JARVIS es el orquestador que recibe los diagnósticos y los procesa con IA
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {jarvisStatus === 'online' && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> En línea
                        </Badge>
                      )}
                      {jarvisStatus === 'offline' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" /> Sin conexión
                        </Badge>
                      )}
                      {jarvisStatus === 'unknown' && (
                        <Badge variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Sin configurar
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>URL de JARVIS</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={jarvisUrl} 
                          onChange={(e) => setJarvisUrl(e.target.value)}
                          placeholder="https://tu-jarvis.onrender.com"
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={probarConexionJarvis}
                          disabled={probandoJarvis || !jarvisUrl}
                        >
                          {probandoJarvis ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          <span className="ml-2">Probar</span>
                        </Button>
                        <Button onClick={guardarUrlJarvis} disabled={!jarvisUrl}>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Ejemplo: https://neltal-jarvis.onrender.com (sin slash al final)
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">¿Cómo funciona?</h4>
                      <ol className="text-sm text-slate-600 space-y-1">
                        <li>1. Cuando termines una entrevista, el diagnóstico se guarda localmente</li>
                        <li>2. Si JARVIS está configurado, también se envía automáticamente</li>
                        <li>3. JARVIS procesa con IA y genera análisis adicional</li>
                        <li>4. Los datos se guardan en Supabase para memoria persistente</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Agentes NELTAL</CardTitle>
                  <CardDescription>Configura los agentes que procesan las entrevistas y diagnósticos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentes.map((agente, index) => (
                      <Card key={agente.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Bot className="h-8 w-8 text-blue-600" />
                              <div>
                                <h3 className="font-semibold">{agente.nombre}</h3>
                                <p className="text-sm text-slate-500">{agente.rol}</p>
                              </div>
                            </div>
                            <Switch
                              checked={agente.activo}
                              onCheckedChange={(checked) => {
                                const nuevos = [...agentes]
                                nuevos[index].activo = checked
                                setAgentes(nuevos)
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-slate-500">Modelo</Label>
                              <Select
                                value={agente.modelo}
                                onValueChange={(value) => {
                                  const nuevos = [...agentes]
                                  nuevos[index].modelo = value
                                  setAgentes(nuevos)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MODELOS_DISPONIBLES.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.nombre} ({m.proveedor})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Temperatura: {agente.temperatura}</Label>
                              <Slider
                                value={[agente.temperatura]}
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={([value]) => {
                                  const nuevos = [...agentes]
                                  nuevos[index].temperatura = value
                                  setAgentes(nuevos)
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={guardarConfigAgentes} disabled={guardandoAgentes} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {guardandoAgentes ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modal Nuevo Cliente */}
      <Dialog open={nuevoClienteOpen} onOpenChange={setNuevoClienteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Entrevista</DialogTitle>
            <DialogDescription>Ingresa los datos básicos del cliente para comenzar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Nombre completo del dueño *</Label>
              <Input value={clienteForm.nombre} onChange={(e) => setClienteForm({...clienteForm, nombre: e.target.value})} />
            </div>
            <div>
              <Label>Nombre del negocio *</Label>
              <Input value={clienteForm.nombreNegocio} onChange={(e) => setClienteForm({...clienteForm, nombreNegocio: e.target.value})} />
            </div>
            <div>
              <Label>Giro</Label>
              <Input value={clienteForm.giro} onChange={(e) => setClienteForm({...clienteForm, giro: e.target.value})} placeholder="Ej: Restaurante, Tienda, Taller..." />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={clienteForm.telefono} onChange={(e) => setClienteForm({...clienteForm, telefono: e.target.value})} />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={clienteForm.ubicacion} onChange={(e) => setClienteForm({...clienteForm, ubicacion: e.target.value})} placeholder="Ciudad, Estado" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setNuevoClienteOpen(false)} className="flex-1">Cancelar</Button>
              <Button onClick={crearCliente} className="flex-1 bg-blue-600">Comenzar Entrevista</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Entrevista */}
      <Dialog open={entrevistaOpen} onOpenChange={setEntrevistaOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Entrevista: {clienteActual.nombreNegocio}
              {guardadoAutomatico && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                  <Save className="h-3 w-3 mr-1" /> Guardado
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Bloque {bloqueActual + 1} de {preguntasEntrevista.length}: {bloqueActualData?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          <div ref={entrevistaRef} className="space-y-4">
            {/* Progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso total: {respondidas}/{totalPreguntas} preguntas</span>
                <span>{progreso.toFixed(0)}%</span>
              </div>
              <Progress value={progreso} />
            </div>

            {/* Bloques rápidos */}
            <div className="flex gap-1 flex-wrap">
              {preguntasEntrevista.map((b, i) => (
                <Button
                  key={i}
                  variant={i === bloqueActual ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBloqueActual(i)}
                  className="text-xs"
                >
                  B{i + 1}
                </Button>
              ))}
            </div>

            {/* Objetivo del bloque */}
            {bloqueActualData && (
              <Card className="bg-slate-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600">
                    <strong>Objetivo:</strong> {bloqueActualData.objetivo}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Preguntas del bloque */}
            <ScrollArea className="h-[50vh]">
              <div className="space-y-6 pr-4">
                {bloqueActualData?.preguntas.map((pregunta) => (
                  <Card key={pregunta.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">
                            P{pregunta.id.split('p')[1]}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{pregunta.texto}</p>
                            <p className="text-xs text-slate-500 mt-1">{pregunta.ayuda}</p>
                          </div>
                        </div>
                        
                        {pregunta.tipo === 'texto' && (
                          <Input
                            value={respuestas[pregunta.id] || ''}
                            onChange={(e) => setRespuestas({...respuestas, [pregunta.id]: e.target.value})}
                            placeholder="Respuesta..."
                          />
                        )}
                        
                        {pregunta.tipo === 'texto_largo' && (
                          <Textarea
                            value={respuestas[pregunta.id] || ''}
                            onChange={(e) => setRespuestas({...respuestas, [pregunta.id]: e.target.value})}
                            placeholder="Respuesta..."
                            rows={3}
                          />
                        )}
                        
                        {pregunta.tipo === 'numero' && (
                          <Input
                            type="number"
                            value={respuestas[pregunta.id] || ''}
                            onChange={(e) => setRespuestas({...respuestas, [pregunta.id]: e.target.value})}
                            placeholder="0"
                          />
                        )}
                        
                        {pregunta.tipo === 'opcion' && (
                          <Select
                            value={respuestas[pregunta.id] || ''}
                            onValueChange={(value) => setRespuestas({...respuestas, [pregunta.id]: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {pregunta.opciones?.map(op => (
                                <SelectItem key={op} value={op}>{op}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {pregunta.tipo === 'multiple' && (
                          <div className="space-y-2">
                            {pregunta.opciones?.map(op => (
                              <div key={op} className="flex items-center gap-2">
                                <Checkbox
                                  checked={(respuestas[pregunta.id] || []).includes(op)}
                                  onCheckedChange={() => toggleMultiple(pregunta.id, op)}
                                />
                                <Label className="font-normal">{op}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Navegación */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={bloqueAnterior} disabled={bloqueActual === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
              {bloqueActual < preguntasEntrevista.length - 1 ? (
                <Button onClick={siguienteBloque} className="bg-blue-600">
                  Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={guardarDiagnostico} className="bg-green-600" disabled={enviandoAJarvis}>
                  {enviandoAJarvis ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Enviando a JARVIS...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" /> Guardar y Enviar a JARVIS
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Reporte */}
      <Dialog open={reporteOpen} onOpenChange={setReporteOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Reporte: {clienteReporte?.nombreNegocio}</DialogTitle>
            <DialogDescription>
              Dueño: {clienteReporte?.nombre} | Fecha: {new Date().toLocaleDateString('es-MX')}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{metricasReporte.ive || 0}</p>
                    <p className="text-xs text-slate-500">IVE</p>
                    <Badge variant={metricasReporte.ive_nivel === 'CRÍTICO' ? 'destructive' : 'secondary'} className="mt-1">
                      {metricasReporte.ive_nivel}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{metricasReporte.idd || 0}%</p>
                    <p className="text-xs text-slate-500">IDD</p>
                    <Badge variant={metricasReporte.idd_nivel === 'CRÍTICO' ? 'destructive' : 'secondary'} className="mt-1">
                      {metricasReporte.idd_nivel}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{metricasReporte.gf_actual || 0}%</p>
                    <p className="text-xs text-slate-500">Formalidad</p>
                    <Badge variant={metricasReporte.gf_nivel === 'FORMAL' ? 'default' : 'outline'} className="mt-1">
                      {metricasReporte.gf_nivel}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{metricasReporte.ccc_dias || 0}</p>
                    <p className="text-xs text-slate-500">CCC Días</p>
                    <Badge variant={metricasReporte.ccc_nivel === 'CRÍTICO' ? 'destructive' : 'secondary'} className="mt-1">
                      {metricasReporte.ccc_nivel}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas */}
              {analisisReporte.alertas?.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analisisReporte.alertas.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-red-700">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Fortalezas */}
              {analisisReporte.fortalezas?.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Fortalezas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analisisReporte.fortalezas.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recomendaciones */}
              {analisisReporte.recomendaciones?.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-700 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" /> Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analisisReporte.recomendaciones.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-blue-700">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Oportunidades */}
              {analisisReporte.oportunidades?.length > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-700 flex items-center gap-2">
                      <Star className="h-5 w-5" /> Oportunidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analisisReporte.oportunidades.map((o: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-purple-700">
                          <Star className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Datos financieros */}
              <Card>
                <CardHeader>
                  <CardTitle>Datos Financieros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Ventas mes promedio</p>
                      <p className="text-xl font-semibold">${(metricasReporte.ventas_mes_promedio || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Gastos fijos</p>
                      <p className="text-xl font-semibold">${(metricasReporte.gastos_fijos || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Utilidad estimada</p>
                      <p className={`text-xl font-semibold ${(metricasReporte.utilidad_estimada || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(metricasReporte.utilidad_estimada || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Margen de utilidad</p>
                      <p className="text-xl font-semibold">{metricasReporte.margen_utilidad || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Respuesta de JARVIS */}
              {respuestaJarvis && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-700 flex items-center gap-2">
                      <Bot className="h-5 w-5" /> Análisis de JARVIS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-blue-800 text-sm">
                      {respuestaJarvis}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setReporteOpen(false)}>Cerrar</Button>
            <Button onClick={() => descargarPDF(diagnosticoSeleccionado?.id)} disabled={descargandoPdf}>
              <Download className="h-4 w-4 mr-2" />
              {descargandoPdf ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

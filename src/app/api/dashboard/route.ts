import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Obtener todos los diagnósticos con métricas
    const diagnosticos = await db.diagnostico.findMany({
      include: {
        cliente: true,
        metricas: true
      }
    })
    
    // Calcular métricas agregadas
    const totalClientes = await db.cliente.count()
    const totalDiagnosticos = diagnosticos.length
    const diagnosticosCompletados = diagnosticos.filter(d => d.estado === 'completado').length
    
    // IVN promedio
    const ivnPromedio = diagnosticos.length > 0 
      ? diagnosticos.reduce((sum, d) => sum + d.ivnTotal, 0) / diagnosticos.length 
      : 0
    
    // Distribución por giro
    const clientes = await db.cliente.findMany()
    const girosCount: Record<string, number> = {}
    clientes.forEach(c => {
      girosCount[c.giro] = (girosCount[c.giro] || 0) + 1
    })
    
    // Distribución IVN
    const ivnBajo = diagnosticos.filter(d => d.ivnTotal <= 3).length
    const ivnModerado = diagnosticos.filter(d => d.ivnTotal > 3 && d.ivnTotal <= 6).length
    const ivnAlto = diagnosticos.filter(d => d.ivnTotal > 6 && d.ivnTotal <= 8).length
    const ivnCritico = diagnosticos.filter(d => d.ivnTotal > 8).length
    
    // Problemas más comunes
    const problemas: Record<string, number> = {}
    diagnosticos.forEach(d => {
      if (d.contextoProblema) {
        const problema = d.contextoProblema.toLowerCase()
        problemas[problema] = (problemas[problema] || 0) + 1
      }
    })
    
    // Promedios financieros
    const ingresosPromedio = diagnosticos.length > 0
      ? diagnosticos.reduce((sum, d) => sum + (d.ingresoMensual || 0), 0) / diagnosticos.length
      : 0
      
    const costosFijosPromedio = diagnosticos.length > 0
      ? diagnosticos.reduce((sum, d) => sum + (d.costoFijo || 0), 0) / diagnosticos.length
      : 0
    
    return NextResponse.json({
      resumen: {
        totalClientes,
        totalDiagnosticos,
        diagnosticosCompletados,
        ivnPromedio: ivnPromedio.toFixed(2),
        ingresosPromedio: ingresosPromedio.toFixed(2),
        costosFijosPromedio: costosFijosPromedio.toFixed(2)
      },
      distribucionGiros: girosCount,
      distribucionIVN: {
        bajo: ivnBajo,      // 0-3: Saludable
        moderado: ivnModerado, // 4-6: Atención recomendada
        alto: ivnAlto,      // 7-8: Urgente
        critico: ivnCritico  // 9-10: Crisis inminente
      },
      problemasComunes: Object.entries(problemas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      diagnosticosRecientes: diagnosticos.slice(0, 5)
    })
  } catch (error) {
    console.error('Error al obtener dashboard:', error)
    return NextResponse.json({ error: 'Error al obtener dashboard' }, { status: 500 })
  }
}

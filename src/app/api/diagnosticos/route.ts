import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar diagnósticos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')
    
    const where = clienteId ? { clienteId } : {}
    
    const diagnosticos = await db.diagnostico.findMany({
      where,
      include: {
        cliente: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Parsear JSON fields y agregar objeto metricas
    const diagnosticosParsed = diagnosticos.map(d => ({
      ...d,
      respuestas: d.respuestas ? JSON.parse(d.respuestas) : {},
      alertas: d.alertas ? JSON.parse(d.alertas) : [],
      fortalezas: d.fortalezas ? JSON.parse(d.fortalezas) : [],
      recomendaciones: d.recomendaciones ? JSON.parse(d.recomendaciones) : [],
      oportunidades: d.oportunidades ? JSON.parse(d.oportunidades) : [],
      metricas: {
        ventas_mes_promedio: d.ventasMesPromedio,
        ventas_mes_buenas: d.ventasMesBuenas,
        ventas_mes_malas: d.ventasMesMalas,
        variabilidad_ingresos: d.variabilidadIngresos,
        variabilidad_nivel: d.variabilidadNivel,
        ccc_dias: d.cccDias,
        ccc_nivel: d.cccNivel,
        concentracion_principal: d.concentracionPrincipal,
        concentracion_top3: d.concentracionTop3,
        concentracion_nivel: d.concentracionNivel,
        idd: d.idd,
        idd_nivel: d.iddNivel,
        gf_actual: d.gfActual,
        gf_gap: d.gfGap,
        gf_nivel: d.gfNivel,
        gastos_fijos: d.gastosFijos,
        gastos_variables: d.gastosVariables,
        gastos_totales: d.gastosTotales,
        punto_equilibrio: d.puntoEquilibrio,
        utilidad_estimada: d.utilidadEstimada,
        antiguedad: d.antiguedad,
        antiguedad_nivel: d.antiguedadNivel
      }
    }))
    
    return NextResponse.json(diagnosticosParsed)
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error)
    return NextResponse.json({ 
      error: 'Error al obtener diagnósticos', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - Crear nuevo diagnóstico
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { clienteId, respuestas, metricas, analisis, estado } = data
    
    const diagnostico = await db.diagnostico.create({
      data: {
        clienteId,
        
        // Respuestas como JSON string
        respuestas: JSON.stringify(respuestas || {}),
        
        // Métricas de Ventas
        ventasMesPromedio: metricas?.ventas_mes_promedio || 0,
        ventasMesBuenas: metricas?.ventas_mes_buenas || 0,
        ventasMesMalas: metricas?.ventas_mes_malas || 0,
        variabilidadIngresos: metricas?.variabilidad_ingresos || 0,
        variabilidadNivel: metricas?.variabilidad_nivel || null,
        
        // CCC
        cccDias: metricas?.ccc_dias || 0,
        cccNivel: metricas?.ccc_nivel || null,
        
        // Concentración
        concentracionPrincipal: metricas?.concentracion_principal || 0,
        concentracionTop3: metricas?.concentracion_top3 || 0,
        concentracionNivel: metricas?.concentracion_nivel || null,
        
        // IDD
        idd: metricas?.idd || 0,
        iddNivel: metricas?.idd_nivel || null,
        
        // GF
        gfActual: metricas?.gf_actual || 0,
        gfGap: metricas?.gf_gap || 0,
        gfNivel: metricas?.gf_nivel || null,
        
        // Costos
        gastosFijos: metricas?.gastos_fijos || 0,
        gastosVariables: metricas?.gastos_variables || 0,
        gastosTotales: metricas?.gastos_totales || 0,
        puntoEquilibrio: metricas?.punto_equilibrio || 0,
        utilidadEstimada: metricas?.utilidad_estimada || 0,
        
        // Antigüedad
        antiguedad: metricas?.antiguedad || 0,
        antiguedadNivel: metricas?.antiguedad_nivel || null,
        
        // Análisis como JSON strings
        alertas: JSON.stringify(analisis?.alertas || []),
        fortalezas: JSON.stringify(analisis?.fortalezas || []),
        recomendaciones: JSON.stringify(analisis?.recomendaciones || []),
        oportunidades: JSON.stringify(analisis?.oportunidades || []),
        
        estado: estado || 'completado'
      },
      include: {
        cliente: true
      }
    })
    
    return NextResponse.json({
      ...diagnostico,
      respuestas: JSON.parse(diagnostico.respuestas || '{}'),
      alertas: JSON.parse(diagnostico.alertas || '[]'),
      fortalezas: JSON.parse(diagnostico.fortalezas || '[]'),
      recomendaciones: JSON.parse(diagnostico.recomendaciones || '[]'),
      oportunidades: JSON.parse(diagnostico.oportunidades || '[]'),
      metricas: {
        ventas_mes_promedio: diagnostico.ventasMesPromedio,
        variabilidad_ingresos: diagnostico.variabilidadIngresos,
        ccc_dias: diagnostico.cccDias,
        concentracion_principal: diagnostico.concentracionPrincipal,
        idd: diagnostico.idd,
        gf_actual: diagnostico.gfActual,
        utilidad_estimada: diagnostico.utilidadEstimada
      }
    })
  } catch (error) {
    console.error('Error al crear diagnóstico:', error)
    return NextResponse.json({ error: 'Error al crear diagnóstico: ' + (error as Error).message }, { status: 500 })
  }
}

// DELETE - Eliminar diagnóstico
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    await db.diagnostico.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar diagnóstico:', error)
    return NextResponse.json({ error: 'Error al eliminar diagnóstico' }, { status: 500 })
  }
}

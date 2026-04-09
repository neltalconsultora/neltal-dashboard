import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { renderToStream } from '@react-pdf/renderer'
import { db } from '@/lib/db'

// Registrar fuentes
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0b.woff2'
})

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    backgroundColor: '#eff6ff',
    padding: 6,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 10,
    color: '#475569',
    flex: 1,
  },
  metricValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  alertBox: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 8,
    marginBottom: 6,
  },
  strengthBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
    padding: 8,
    marginBottom: 6,
  },
  recBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    padding: 8,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%',
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 6,
    marginRight: '2%',
  },
  gridItemLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  gridItemValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  totalBox: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
})

// Componente del documento PDF
const DiagnosticoPDF = ({ cliente, metricas, analisis, respuestas }: any) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX')
  }

  return React.createElement(Document, null, [
    React.createElement(Page, { key: 'page1', size: 'A4', style: styles.page }, [
      // Header
      React.createElement(View, { key: 'header', style: styles.header }, [
        React.createElement(Text, { key: 'title', style: styles.title }, 'NELTAL - Diagnóstico Financiero'),
        React.createElement(Text, { key: 'subtitle', style: styles.subtitle }, `Negocio: ${cliente?.nombreNegocio || 'N/A'}`),
        React.createElement(Text, { key: 'owner', style: styles.subtitle }, `Dueño: ${cliente?.nombre || 'N/A'}`),
        React.createElement(Text, { key: 'date', style: styles.subtitle }, `Fecha: ${formatDate(new Date())}`),
      ]),

      // Resumen Ejecutivo
      React.createElement(View, { key: 'resumen', style: styles.section }, [
        React.createElement(Text, { key: 'st', style: styles.sectionTitle }, 'Resumen Ejecutivo'),
        React.createElement(View, { key: 'grid', style: styles.grid }, [
          React.createElement(View, { key: 'm1', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l1', style: styles.gridItemLabel }, 'Ventas Mensuales (Promedio)'),
            React.createElement(Text, { key: 'v1', style: styles.gridItemValue }, `$${(metricas?.ventas_mes_promedio || 0).toLocaleString()}`),
          ]),
          React.createElement(View, { key: 'm2', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l2', style: styles.gridItemLabel }, 'Utilidad Estimada'),
            React.createElement(Text, { key: 'v2', style: { ...styles.gridItemValue, color: (metricas?.utilidad_estimada || 0) >= 0 ? '#22c55e' : '#ef4444' } }, `$${(metricas?.utilidad_estimada || 0).toLocaleString()}`),
          ]),
          React.createElement(View, { key: 'm3', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l3', style: styles.gridItemLabel }, 'Ciclo de Conversión de Efectivo'),
            React.createElement(Text, { key: 'v3', style: styles.gridItemValue }, `${metricas?.ccc_dias || 0} días`),
          ]),
          React.createElement(View, { key: 'm4', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l4', style: styles.gridItemLabel }, 'Dependencia del Dueño (IDD)'),
            React.createElement(Text, { key: 'v4', style: styles.gridItemValue }, `${metricas?.idd || 0}%`),
          ]),
        ]),
      ]),

      // Métricas Detalladas
      React.createElement(View, { key: 'metricas', style: styles.section }, [
        React.createElement(Text, { key: 'st', style: styles.sectionTitle }, 'Indicadores Financieros'),
        
        React.createElement(View, { key: 'row1', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Variabilidad de Ingresos'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `${(metricas?.variabilidad_ingresos || 0).toFixed(0)}% - ${metricas?.variabilidad_nivel || 'N/A'}`),
        ]),
        React.createElement(View, { key: 'row2', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Ciclo de Conversión de Efectivo (CCC)'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `${metricas?.ccc_dias || 0} días - ${metricas?.ccc_nivel || 'N/A'}`),
        ]),
        React.createElement(View, { key: 'row3', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Concentración de Clientes'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `${metricas?.concentracion_principal || 0}% - ${metricas?.concentracion_nivel || 'N/A'}`),
        ]),
        React.createElement(View, { key: 'row4', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Índice Dependencia Dueño (IDD)'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `${metricas?.idd || 0}% - ${metricas?.idd_nivel || 'N/A'}`),
        ]),
        React.createElement(View, { key: 'row5', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Gap de Formalización (GF)'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `${metricas?.gf_actual || 0}/100 - ${metricas?.gf_nivel || 'N/A'}`),
        ]),
        React.createElement(View, { key: 'row6', style: styles.metricRow }, [
          React.createElement(Text, { key: 'label', style: styles.metricLabel }, 'Punto de Equilibrio'),
          React.createElement(Text, { key: 'value', style: styles.metricValue }, `$${(metricas?.punto_equilibrio || 0).toLocaleString()}`),
        ]),
      ]),

      // Estructura de Costos
      React.createElement(View, { key: 'costos', style: styles.section }, [
        React.createElement(Text, { key: 'st', style: styles.sectionTitle }, 'Estructura de Costos Mensual'),
        React.createElement(View, { key: 'grid', style: styles.grid }, [
          React.createElement(View, { key: 'c1', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l1', style: styles.gridItemLabel }, 'Gastos Fijos'),
            React.createElement(Text, { key: 'v1', style: styles.gridItemValue }, `$${(metricas?.gastos_fijos || 0).toLocaleString()}`),
          ]),
          React.createElement(View, { key: 'c2', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l2', style: styles.gridItemLabel }, 'Costo Mercancía'),
            React.createElement(Text, { key: 'v2', style: styles.gridItemValue }, `$${(metricas?.gastos_variables || 0).toLocaleString()}`),
          ]),
          React.createElement(View, { key: 'c3', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l3', style: styles.gridItemLabel }, 'Pago Deudas'),
            React.createElement(Text, { key: 'v3', style: styles.gridItemValue }, `$${(respuestas?.deuda_mes || 0).toLocaleString()}`),
          ]),
          React.createElement(View, { key: 'c4', style: styles.gridItem }, [
            React.createElement(Text, { key: 'l4', style: styles.gridItemLabel }, 'Retiro Dueño'),
            React.createElement(Text, { key: 'v4', style: styles.gridItemValue }, `$${(respuestas?.retiro || 0).toLocaleString()}`),
          ]),
        ]),
        React.createElement(View, { key: 'total', style: styles.totalBox }, [
          React.createElement(View, { key: 'row', style: styles.metricRow }, [
            React.createElement(Text, { key: 'label', style: { ...styles.metricLabel, fontWeight: 'bold' } }, 'TOTAL GASTOS MENSUALES'),
            React.createElement(Text, { key: 'value', style: { ...styles.metricValue, fontSize: 12 } }, `$${(metricas?.gastos_totales || 0).toLocaleString()}`),
          ]),
        ]),
      ]),

      // Alertas
      ...(analisis?.alertas?.length > 0 ? [
        React.createElement(View, { key: 'alertas', style: styles.section }, [
          React.createElement(Text, { key: 'st', style: { ...styles.sectionTitle, backgroundColor: '#fef2f2', color: '#dc2626' } }, `Alertas (${analisis.alertas.length})`),
          ...analisis.alertas.map((alerta: string, i: number) => 
            React.createElement(View, { key: `alert${i}`, style: styles.alertBox }, [
              React.createElement(Text, { key: 'text', style: styles.itemText }, alerta),
            ])
          ),
        ])
      ] : []),

      // Fortalezas
      ...(analisis?.fortalezas?.length > 0 ? [
        React.createElement(View, { key: 'fortalezas', style: styles.section }, [
          React.createElement(Text, { key: 'st', style: { ...styles.sectionTitle, backgroundColor: '#f0fdf4', color: '#16a34a' } }, `Fortalezas (${analisis.fortalezas.length})`),
          ...analisis.fortalezas.map((fortaleza: string, i: number) => 
            React.createElement(View, { key: `fort${i}`, style: styles.strengthBox }, [
              React.createElement(Text, { key: 'text', style: styles.itemText }, fortaleza),
            ])
          ),
        ])
      ] : []),

      // Recomendaciones
      ...(analisis?.recomendaciones?.length > 0 ? [
        React.createElement(View, { key: 'recomendaciones', style: styles.section }, [
          React.createElement(Text, { key: 'st', style: styles.sectionTitle }, 'Recomendaciones'),
          ...analisis.recomendaciones.map((rec: string, i: number) => 
            React.createElement(View, { key: `rec${i}`, style: styles.recBox }, [
              React.createElement(Text, { key: 'text', style: styles.itemText }, `${i + 1}. ${rec}`),
            ])
          ),
        ])
      ] : []),

      // Footer
      React.createElement(View, { key: 'footer', style: styles.footer, fixed: true }, [
        React.createElement(Text, { key: 'left', style: styles.footerText }, 'NELTAL - Diagnóstico Financiero para Negocios Mexicanos'),
        React.createElement(Text, { key: 'right', style: styles.footerText }, `Generado el ${formatDate(new Date())} a las ${formatTime(new Date())}`),
      ]),
    ]),
  ])
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const diagnosticoId = searchParams.get('id')

    if (!diagnosticoId) {
      return NextResponse.json({ error: 'ID de diagnóstico requerido' }, { status: 400 })
    }

    const diagnostico = await db.diagnostico.findUnique({
      where: { id: diagnosticoId },
      include: { cliente: true }
    })

    if (!diagnostico) {
      return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })
    }

    const cliente = diagnostico.cliente
    const metricas = {
      ventas_mes_promedio: diagnostico.ventasMesPromedio,
      ventas_mes_buenas: diagnostico.ventasMesBuenas,
      ventas_mes_malas: diagnostico.ventasMesMalas,
      variabilidad_ingresos: diagnostico.variabilidadIngresos,
      variabilidad_nivel: diagnostico.variabilidadNivel,
      ccc_dias: diagnostico.cccDias,
      ccc_nivel: diagnostico.cccNivel,
      concentracion_principal: diagnostico.concentracionPrincipal,
      concentracion_top3: diagnostico.concentracionTop3,
      concentracion_nivel: diagnostico.concentracionNivel,
      idd: diagnostico.idd,
      idd_nivel: diagnostico.iddNivel,
      gf_actual: diagnostico.gfActual,
      gf_gap: diagnostico.gfGap,
      gf_nivel: diagnostico.gfNivel,
      gastos_fijos: diagnostico.gastosFijos,
      gastos_variables: diagnostico.gastosVariables,
      gastos_totales: diagnostico.gastosTotales,
      punto_equilibrio: diagnostico.puntoEquilibrio,
      utilidad_estimada: diagnostico.utilidadEstimada,
      antiguedad: diagnostico.antiguedad,
      antiguedad_nivel: diagnostico.antiguedadNivel,
    }
    
    const analisis = {
      alertas: diagnostico.alertas ? JSON.parse(diagnostico.alertas) : [],
      fortalezas: diagnostico.fortalezas ? JSON.parse(diagnostico.fortalezas) : [],
      recomendaciones: diagnostico.recomendaciones ? JSON.parse(diagnostico.recomendaciones) : [],
      oportunidades: diagnostico.oportunidades ? JSON.parse(diagnostico.oportunidades) : [],
    }
    
    const respuestas = diagnostico.respuestas ? JSON.parse(diagnostico.respuestas) : {}

    const pdfStream = await renderToStream(
      React.createElement(DiagnosticoPDF, { cliente, metricas, analisis, respuestas })
    )

    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diagnostico_${cliente?.nombreNegocio || 'NELTAL'}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json({ error: 'Error al generar PDF: ' + (error as Error).message }, { status: 500 })
  }
}

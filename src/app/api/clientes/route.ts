import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar todos los clientes
export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      include: {
        diagnosticos: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const cliente = await db.cliente.create({
      data: {
        nombre: data.nombre || '',
        nombreNegocio: data.nombreNegocio || data.nombreNegocio || '',
        giro: data.giro || '',
        giroOtro: data.giroOtro || null,
        telefono: data.telefono || null,
        email: data.email || null,
        ubicacion: data.ubicacion || null,
        tiempoOperacion: data.tiempoOperacion || 0,
        empleados: data.empleados || 0,
        tieneLocal: data.tieneLocal || false
      }
    })
    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json({ error: 'Error al crear cliente: ' + (error as Error).message }, { status: 500 })
  }
}

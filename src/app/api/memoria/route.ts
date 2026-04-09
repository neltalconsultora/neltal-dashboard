// API de Memoria para conversaciones con JARVIS
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const oficinaId = searchParams.get('oficinaId')
    const conversacionId = searchParams.get('conversacionId')

    if (!usuarioId || !oficinaId) {
      return NextResponse.json(
        { error: 'usuarioId y oficinaId requeridos' },
        { status: 400 }
      )
    }

    // Si se pide una conversación específica
    if (conversacionId) {
      const conversacion = await prisma.conversacion.findFirst({
        where: {
          id: conversacionId,
          usuarioId,
          oficinaId
        },
        include: {
          mensajes: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!conversacion) {
        return NextResponse.json(
          { error: 'Conversación no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({ conversacion })
    }

    // Listar todas las conversaciones
    const conversaciones = await prisma.conversacion.findMany({
      where: {
        usuarioId,
        oficinaId
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ conversaciones })

  } catch (error) {
    console.error('Error obteniendo memoria:', error)
    return NextResponse.json(
      { error: 'Error al obtener conversaciones' },
      { status: 500 }
    )
  }
}

// Crear nueva conversación o agregar mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, oficinaId, mensaje, rol, conversacionId, titulo } = body

    if (!usuarioId || !oficinaId || !mensaje || !rol) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    let conversacion

    if (conversacionId) {
      // Agregar mensaje a conversación existente
      conversacion = await prisma.conversacion.findFirst({
        where: { id: conversacionId, usuarioId, oficinaId }
      })

      if (!conversacion) {
        return NextResponse.json(
          { error: 'Conversación no encontrada' },
          { status: 404 }
        )
      }

      // Crear mensaje
      await prisma.mensaje.create({
        data: {
          conversacionId: conversacion.id,
          usuarioId,
          rol,
          contenido: mensaje
        }
      })

      // Actualizar fecha de la conversación
      await prisma.conversacion.update({
        where: { id: conversacion.id },
        data: { updatedAt: new Date() }
      })

    } else {
      // Crear nueva conversación
      conversacion = await prisma.conversacion.create({
        data: {
          oficinaId,
          usuarioId,
          titulo: titulo || mensaje.substring(0, 50),
          agenteActivo: 'jarvis'
        }
      })

      // Crear primer mensaje
      await prisma.mensaje.create({
        data: {
          conversacionId: conversacion.id,
          usuarioId,
          rol,
          contenido: mensaje
        }
      })
    }

    return NextResponse.json({
      success: true,
      conversacionId: conversacion.id
    })

  } catch (error) {
    console.error('Error guardando en memoria:', error)
    return NextResponse.json(
      { error: 'Error al guardar mensaje' },
      { status: 500 }
    )
  }
}

// Actualizar contexto de conversación
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversacionId, usuarioId, contexto, agenteActivo } = body

    const conversacion = await prisma.conversacion.findFirst({
      where: { id: conversacionId, usuarioId }
    })

    if (!conversacion) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (contexto) updateData.contexto = contexto
    if (agenteActivo) updateData.agenteActivo = agenteActivo

    await prisma.conversacion.update({
      where: { id: conversacionId },
      data: updateData
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error actualizando conversación:', error)
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}

// Eliminar conversación
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversacionId = searchParams.get('conversacionId')
    const usuarioId = searchParams.get('usuarioId')

    if (!conversacionId || !usuarioId) {
      return NextResponse.json(
        { error: 'conversacionId y usuarioId requeridos' },
        { status: 400 }
      )
    }

    await prisma.conversacion.deleteMany({
      where: {
        id: conversacionId,
        usuarioId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error eliminando conversación:', error)
    return NextResponse.json(
      { error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}

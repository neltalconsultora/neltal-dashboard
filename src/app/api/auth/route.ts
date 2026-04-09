// API de Autenticación y Gestión de Usuarios
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Crear nueva oficina con usuario admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombreOficina, slug, nombreAdmin, email, password, telefono } = body

    // Verificar si el slug ya existe
    const oficinaExiste = await prisma.oficina.findUnique({
      where: { slug }
    })

    if (oficinaExiste) {
      return NextResponse.json(
        { error: 'El nombre de la oficina ya está en uso' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExiste) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const passwordHash = await hash(password, 10)

    // Crear oficina y usuario admin en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear oficina
      const oficina = await tx.oficina.create({
        data: {
          nombre: nombreOficina,
          slug: slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          configAgentes: JSON.stringify({
            jarvis: true,
            financiero: true,
            programacion: true,
            contaduria: true,
            reportes: true
          })
        }
      })

      // Crear usuario admin
      const usuario = await tx.usuario.create({
        data: {
          oficinaId: oficina.id,
          nombre: nombreAdmin,
          email,
          password: passwordHash,
          telefono,
          rol: 'admin',
          permisos: JSON.stringify(['all'])
        }
      })

      return { oficina, usuario }
    })

    return NextResponse.json({
      success: true,
      oficina: {
        id: resultado.oficina.id,
        nombre: resultado.oficina.nombre,
        slug: resultado.oficina.slug
      },
      usuario: {
        id: resultado.usuario.id,
        nombre: resultado.usuario.nombre,
        email: resultado.usuario.email,
        rol: resultado.usuario.rol
      }
    })

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}

// Login
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { oficina: true }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const { compare } = await import('bcryptjs')
    const passwordValida = await compare(password, usuario.password)

    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() }
    })

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        telegramId: usuario.telegramId
      },
      oficina: {
        id: usuario.oficina.id,
        nombre: usuario.oficina.nombre,
        slug: usuario.oficina.slug,
        plan: usuario.oficina.plan
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}

// Obtener usuario actual
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { oficina: true }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        telegramId: usuario.telegramId
      },
      oficina: {
        id: usuario.oficina.id,
        nombre: usuario.oficina.nombre,
        slug: usuario.oficina.slug,
        plan: usuario.oficina.plan
      }
    })

  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

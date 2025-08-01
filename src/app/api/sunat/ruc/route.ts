import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruc = searchParams.get('ruc');
    
    if (!ruc) {
      return NextResponse.json(
        { error: 'RUC es requerido' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://tools.apis.atechlo.com/apisunat/ruc/${ruc}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al consultar RUC' },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { error } = await supabaseAdmin
      .from("empresas")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          mensagem: "Falha ao consultar o Supabase",
          detalhe: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      mensagem: "API operante",
      supabase: "conectado",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        status: "degraded",
        mensagem: "Erro inesperado ao validar dependências",
        detalhe: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

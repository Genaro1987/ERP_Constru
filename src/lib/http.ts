import { NextResponse } from "next/server";

export function sucesso<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      sucesso: true,
      data,
    },
    { status }
  );
}

export function falha(mensagem: string, status = 400) {
  return NextResponse.json(
    {
      sucesso: false,
      erro: mensagem,
    },
    { status }
  );
}

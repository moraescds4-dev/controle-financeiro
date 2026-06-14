type Lancamento = {
  id: string;
  descricao: string;
  valor: string;
  categoria?: string;
  tipo?: string;
};

const formatar = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ListaLancamentos({
  titulo,
  itens,
  cor,
}: {
  titulo: string;
  itens: Lancamento[];
  cor: string;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum lançamento ainda.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {itens.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{item.descricao}</p>
                <p className="text-xs text-gray-500">{item.categoria ?? item.tipo}</p>
              </div>
              <span className={`font-semibold shrink-0 ${cor}`}>
                {formatar(Number(item.valor))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
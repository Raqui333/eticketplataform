export default async (request) => {
  const data = await request.json();

  const body = data.map((item) => item.dataEvento);

  const vagas = {
    '2025-07-25': Math.max(
      0,
      500 - body.filter((i) => i === '2025-07-25').length
    ),
    '2025-07-26': Math.max(
      0,
      500 - body.filter((i) => i === '2025-07-26').length
    ),
    '2025-07-27': Math.max(
      0,
      500 - body.filter((i) => i === '2025-07-27').length
    ),
  };

  return new Response(JSON.stringify(vagas), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

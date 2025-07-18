const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_KEY = process.env.DATABASE_KEY;

export default async (request) => {
  const resp = await fetch(DATABASE_URL + '_publicas', {
    method: 'GET',
    headers: {
      apiKey: DATABASE_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!resp.ok) {
    return new Response(JSON.stringify('an error has occurred'), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await resp.json();

  const vagas = {
    '2025-07-25': Math.max(
      0,
      500 - body.filter((i) => i.date === '2025-07-25').length
    ),
    '2025-07-26': Math.max(
      0,
      500 - body.filter((i) => i.date === '2025-07-26').length
    ),
    '2025-07-27': Math.max(
      0,
      500 - body.filter((i) => i.date === '2025-07-27').length
    ),
  };

  return new Response(JSON.stringify(vagas), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

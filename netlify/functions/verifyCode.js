const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_KEY = process.env.DATABASE_KEY;

export default async (request) => {
  const data = await request.json();

  const resp = await fetch(DATABASE_URL, {
    method: 'GET',
    headers: {
      apiKey: DATABASE_KEY,
      'Content-Type': 'application/json',
    },
  });

  const participants = await resp.json();

  try {
    const { name, date, email, id, used } = participants.find(
      (info) => info.codehex === data.code
    );

    const fdate = new Date(date + 'T00:00:00-03:00').toLocaleDateString(
      'pt-BR'
    );

    if (used === false) {
      await fetch(DATABASE_URL + `?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apiKey: DATABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          used: true,
        }),
      });
    }

    return new Response(JSON.stringify({ name, email, date: fdate, used }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify('invalid code'), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

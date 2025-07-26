const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_KEY = process.env.DATABASE_KEY;

export default async (request) => {
  const data = await request.json();

  const participants = data.db;

  try {
    const { nomeCompleto, dataEvento, email, used } = participants.find(
      (info) => info.codehex === data.code
    );

    const fdate = new Date(dataEvento + 'T00:00:00-03:00').toLocaleDateString(
      'pt-BR'
    );

    return new Response(
      JSON.stringify({ nomeCompleto, email, dataEvento: fdate, used }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify('invalid code'), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

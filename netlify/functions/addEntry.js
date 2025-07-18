const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_KEY = process.env.DATABASE_KEY;

function generateCode() {
  function randomHexBlock() {
    // generate a random 16 bits number and converts to 4 digits hex code
    return Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');
  }

  return `${randomHexBlock()}-${randomHexBlock()}-${randomHexBlock()}`;
}

export default async (request) => {
  const data = await request.json();

  let error_msg = 'Tente novamente em alguns instantes.';
  const randomcode = generateCode();

  try {
    const resp = await fetch(DATABASE_URL, {
      method: 'POST',
      headers: {
        apiKey: DATABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.nomeCompleto,
        date: data.dataEvento,
        cpf: data.cpf,
        email: data.email,
        phone: data.telefone,
        codehex: randomcode,
      }),
    });

    if (!resp.ok) {
      const response_data = await resp.json();
      if (response_data.message.includes('duplicate key')) {
        error_msg = 'Esse CPF já foi utilizado!';
        throw new Error(error_msg);
      }
    }
  } catch (err) {
    const resp_body = {
      message: 'an error has occurred',
      error: error_msg,
    };

    return new Response(JSON.stringify(resp_body), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resp_body = {
    message: 'entry added successfully',
    codehex: randomcode,
  };

  return new Response(JSON.stringify(resp_body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

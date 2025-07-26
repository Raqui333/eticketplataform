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
    data.db.find((entry) => {
      if (entry.cpf === data.entry.cpf) {
        error_msg = 'Esse CPF já foi utilizado!';
        throw new Error(error_msg);
      }
    });
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

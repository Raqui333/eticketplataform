import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import QRCode from 'qrcode';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

resend.apiKeys.create({ name: 'Production' });

function base64ToUint8Array(base64) {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer);
}

async function createQRCode(text) {
  const qrcode = await QRCode.toDataURL(text);
  return base64ToUint8Array(qrcode.split(',')[1]);
}

async function createPDF(name, email, date, code) {
  const image = await createQRCode(code);

  const banner = fs.readFileSync('./public/banner.png');
  const logo = fs.readFileSync('./public/watermark.png');

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const bannerEvent = await pdfDoc.embedPng(banner);
  const watermark = await pdfDoc.embedPng(logo);

  const QRCode = await pdfDoc.embedPng(image);
  const QRCodeSize = QRCode.scale(1.5);

  // Content
  page.drawImage(bannerEvent, {
    x: width / 2 - 550 / 2,
    y: height - 120,
    width: 550,
    height: 100,
  });

  const dataSplit = date.split('-');
  const dataEvento = `${dataSplit[2]}/${dataSplit[1]}/${dataSplit[0]}`;
  const dia =
    dataSplit[2] == 25
      ? 'Primeiro dia'
      : dataSplit[2] == 26
        ? 'Segundo dia'
        : 'Terceiro dia';

  const ticketDetails = `
    Ticket para o Festival de Verão
        ${dataEvento}, 19h00 (${dia})
        Local: Avenida Senador Teotônio Vilela, 261, São Paulo, 04795-000
        Nome: ${name} (${email})
        Código: ${code}
  `;

  page.drawText(ticketDetails, {
    x: 10,
    y: height - 120 - 20,
    size: fontSize,
    font: font,
    lineHeight: 16,
    color: rgb(0, 0, 0),
  });

  page.drawImage(watermark, {
    x: width - watermark.width - 10,
    y: height - 240,
    width: 160,
    height: 100,
    opacity: 0.5,
  });

  page.drawLine({
    start: { x: 30, y: height / 2 + 160 },
    end: { x: width - 30, y: height / 2 + 160 },
    thickness: 1,
    color: rgb(0, 0, 0),
    opacity: 0.5,
  });

  page.drawImage(QRCode, {
    x: width / 2 - QRCodeSize.width / 2,
    y: height / 2 - QRCodeSize.height / 2,
    width: QRCodeSize.width,
    height: QRCodeSize.height,
  });

  const textCode = code;
  const textLenght = font.widthOfTextAtSize(textCode, fontSize * 2);

  page.drawText(code, {
    x: width / 2 - textLenght / 2,
    y: height / 2 - QRCodeSize.height / 2 - 20,
    size: fontSize * 2,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 30, y: 220 },
    end: { x: width - 30, y: 220 },
    thickness: 1,
    color: rgb(0, 0, 0),
    opacity: 0.5,
  });

  const information = `
    Instruções:
      1. A impressão do ingresso será válida em formato A4.
      2. O ingresso impresso só será válido para uma leitura na entrada do evento.
      3. O pedido é pessoal, sendo obrigatório o titular do cadastro estar presente no local, sendo cada QRCODE
          equivalente à 1 ingresso.
  `;

  page.drawText(information, {
    x: 10,
    y: 200,
    size: fontSize,
    font: font,
    lineHeight: 16,
    color: rgb(0, 0, 0),
  });

  // Return pdf serialized to bytes (a Uint8Array)
  return await pdfDoc.save();
}

async function sendEmail(recipient, pdfFile, date, name) {
  const mailBody = `
    Olá, ${name}!<br><br>

    Parabéns! Sua inscrição foi confirmada com sucesso, e você já está com presença garantida no nosso evento <strong>Festival de Verão</strong>.<br><br>

    🗓️ Data: ${new Date(date + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}<br>
    📍 Local: Avenida Senador Teotônio Vilela, 261, São Paulo, 04795-000<br>
    ⏰ Horário: 19h00<br><br>

    Seu ticket de entrada está anexado à este e-mail. Guarde com carinho e apresente-o na entrada do evento, impresso ou direto do celular.
  `;
  const { data, error } = await resend.emails.send({
    from: 'Equipe Festival de Verão <no-reply@festivaldeverao.com>',
    to: [recipient],
    subject: 'TICKET FESTIVAL DE VERÃO',
    html: mailBody,
    attachments: [
      {
        content: Buffer.from(pdfFile),
        filename: 'ticket_festival_de_verao.pdf',
      },
    ],
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}

export default async (request) => {
  const data = await request.json();

  if (!data.name || !data.email || !data.code || !data.date)
    return new Response(JSON.stringify('Must include all fields'), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  const pdfBytes = await createPDF(data.name, data.email, data.date, data.code);

  try {
    await sendEmail(data.email, pdfBytes, data.date, data.name);
  } catch (err) {
    return new Response(JSON.stringify('Server error'), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify('successfully'), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

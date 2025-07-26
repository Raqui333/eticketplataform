import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

function base64ToUint8Array(base64) {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer);
}

async function createQRCode(text) {
  const qrcode = await QRCode.toDataURL(text);
  return base64ToUint8Array(qrcode.split(',')[1]);
}

const bannerPath = path.join(__dirname, 'assets', 'banner.png');
const logoPath = path.join(__dirname, 'assets', 'watermark.png');

async function createPDF(name, email, date, code) {
  const image = await createQRCode(code);

  const banner = fs.readFileSync(bannerPath);
  const logo = fs.readFileSync(logoPath);

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

export default async (request) => {
  const data = await request.json();

  if (!data.name || !data.email || !data.code || !data.date)
    return new Response(JSON.stringify('Must include all fields'), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  const pdfBytes = await createPDF(data.name, data.email, data.date, data.code);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="eticket.pdf"',
    },
  });
};

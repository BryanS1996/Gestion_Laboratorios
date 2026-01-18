exports.reservaConfirmacionHTML = ({
  nombre,
  laboratorio,
  fecha,
  horario,
  reservaId,
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #f5f7fb;
      padding: 20px;
    }
    .card {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,.1);
    }
    .header {
      background: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 25px;
      color: #333;
    }
    .info {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>✅ Reserva Confirmada</h2>
    </div>
    <div class="content">
      <p>Hola <strong>${nombre}</strong>,</p>

      <p>Tu reserva ha sido registrada exitosamente.</p>

      <div class="info">
        <p><strong>Laboratorio:</strong> ${laboratorio}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Horario:</strong> ${horario}</p>
        <p><strong>ID Reserva:</strong> ${reservaId}</p>
      </div>

      <p>Gracias por utilizar el sistema de gestión de laboratorios.</p>
    </div>
    <div class="footer">
      Sistema de Laboratorios – Facultad de Ingeniería
    </div>
  </div>
</body>
</html>
`;

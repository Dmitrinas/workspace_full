import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WorkOrder, Inspection, AcceptanceAct } from '../types';

export async function generateWorkOrderPDF(order: WorkOrder): Promise<jsPDF> {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';

  const subtotal = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = order.discountType === 'percent' ? subtotal * order.discount / 100 : order.discount;
  const total = subtotal - discountAmt;

  container.innerHTML = `
    <h1 style="text-align:center;font-size:24px;margin-bottom:20px;">Заказ-наряд</h1>
    <div style="margin-bottom:20px;">
      <p><strong>Номер:</strong> ${order.number}</p>
      <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
      <p><strong>Статус:</strong> ${getStatusLabel(order.status)}</p>
    </div>
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:10px;">Информация о клиенте:</h3>
      <p><strong>ФИО:</strong> ${order.clientName}</p>
      <p><strong>Телефон:</strong> ${order.clientPhone}</p>
      <p><strong>Email:</strong> ${order.clientEmail}</p>
    </div>
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:10px;">Информация об автомобиле:</h3>
      <p><strong>Автомобиль:</strong> ${order.carBrand} ${order.carModel} (${order.carYear})</p>
      <p><strong>Гос. номер:</strong> ${order.carPlate}</p>
      ${order.vin ? `<p><strong>VIN:</strong> ${order.vin}</p>` : ''}
      <p><strong>Пробег:</strong> ${order.mileage} км</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:10px;border:1px solid #ddd;text-align:left;">Тип</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left;">Наименование</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Кол-во</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Цена</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">${item.type === 'work' ? 'Работа' : 'Запчасть'}</td>
            <td style="padding:10px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${item.quantity}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${item.price.toFixed(2)} руб.</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${(item.quantity * item.price).toFixed(2)} руб.</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="text-align:right;margin-bottom:20px;">
      <p><strong>Подитог:</strong> ${subtotal.toFixed(2)} руб.</p>
      ${order.discount > 0 ? `<p><strong>Скидка (${order.discount}${order.discountType === 'percent' ? '%' : ' руб.'}):</strong> -${discountAmt.toFixed(2)} руб.</p>` : ''}
      <p style="font-size:18px;"><strong>ИТОГО:</strong> ${total.toFixed(2)} руб.</p>
    </div>
    ${order.notes ? `<div><strong>Примечания:</strong> ${order.notes}</div>` : ''}
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  document.body.removeChild(container);

  return pdf;
}

export async function generateInspectionPDF(inspection: Inspection, order?: WorkOrder): Promise<jsPDF> {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';

  container.innerHTML = `
    <h1 style="text-align:center;font-size:24px;margin-bottom:20px;">Акт осмотра</h1>
    <div style="margin-bottom:20px;">
      <p><strong>Дата осмотра:</strong> ${new Date(inspection.date).toLocaleDateString('ru-RU')}</p>
      ${order ? `
        <p><strong>Заказ-наряд:</strong> ${order.number}</p>
        <p><strong>Клиент:</strong> ${order.clientName}</p>
        <p><strong>Автомобиль:</strong> ${order.carBrand} ${order.carModel} (${order.carYear})</p>
      ` : ''}
    </div>
    <div style="margin-bottom:20px;">
      <p><strong>Пробег:</strong> ${inspection.mileage} км</p>
      <p><strong>Состояние кузова:</strong> ${getConditionLabel(inspection.bodyCondition)}</p>
      <p><strong>Уровень топлива:</strong> ${inspection.fuelLevel}%</p>
    </div>
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:10px;">Обнаруженные неисправности:</h3>
      <p>${inspection.findings || 'Не обнаружены'}</p>
    </div>
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:10px;">Рекомендации:</h3>
      <p>${inspection.recommendations || 'Нет'}</p>
    </div>
    <div>
      <p><strong>Количество фото:</strong> ${inspection.photos.length}</p>
    </div>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  document.body.removeChild(container);

  return pdf;
}

export async function generateAcceptanceActPDF(act: AcceptanceAct, order?: WorkOrder): Promise<jsPDF> {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';

  const subtotal = act.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = act.discountType === 'percent' ? subtotal * act.discount / 100 : act.discount;
  const total = subtotal - discountAmt;

  container.innerHTML = `
    <h1 style="text-align:center;font-size:24px;margin-bottom:20px;">Акт приема-передачи</h1>
    <div style="margin-bottom:20px;">
      <p><strong>Дата:</strong> ${new Date(act.date).toLocaleDateString('ru-RU')}</p>
      <p><strong>Клиент:</strong> ${act.clientName}</p>
      <p><strong>Автомобиль:</strong> ${act.carInfo}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:10px;border:1px solid #ddd;text-align:left;">Наименование</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Кол-во</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Цена</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:right;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${act.items.map(item => `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${item.quantity}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${item.price.toFixed(2)} руб.</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:right;">${(item.quantity * item.price).toFixed(2)} руб.</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="text-align:right;margin-bottom:20px;">
      <p><strong>Подитог:</strong> ${subtotal.toFixed(2)} руб.</p>
      ${act.discount > 0 ? `<p><strong>Скидка:</strong> -${discountAmt.toFixed(2)} руб.</p>` : ''}
      <p style="font-size:18px;"><strong>ИТОГО:</strong> ${total.toFixed(2)} руб.</p>
    </div>
    ${act.notes ? `<div style="margin-bottom:20px;"><strong>Примечания:</strong> ${act.notes}</div>` : ''}
    <div style="margin-top:40px;display:flex;justify-content:space-between;">
      <div>Подпись клиента: _________________</div>
      <div>Подпись исполнителя: _________________</div>
    </div>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  document.body.removeChild(container);

  return pdf;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    waiting_repair: 'Ожидание ремонта',
    in_progress: 'В работе',
    approval: 'Согласование',
    waiting_parts: 'Ожидание запчастей',
    completed: 'Выполнен',
    closed: 'Закрыт',
  };
  return labels[status] || status;
}

function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое',
  };
  return labels[condition] || condition;
}

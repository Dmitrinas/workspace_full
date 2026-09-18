import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WorkOrder, Inspection, AcceptanceAct } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generateWorkOrderPDF(order: WorkOrder): jsPDF {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Заказ-наряд', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Номер: ${order.number}`, 14, 35);
  doc.text(`Дата: ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`, 14, 42);
  doc.text(`Статус: ${getStatusLabel(order.status)}`, 14, 49);
  
  doc.setFontSize(11);
  doc.text('Информация о клиенте:', 14, 62);
  doc.text(`ФИО: ${order.clientName}`, 14, 70);
  doc.text(`Телефон: ${order.clientPhone}`, 14, 77);
  doc.text(`Email: ${order.clientEmail}`, 14, 84);
  
  doc.text('Информация об автомобиле:', 14, 97);
  doc.text(`${order.carBrand} ${order.carModel} (${order.carYear})`, 14, 105);
  doc.text(`Гос. номер: ${order.carPlate}`, 14, 112);
  if (order.vin) doc.text(`VIN: ${order.vin}`, 14, 119);
  
  const tableData = order.items.map(item => [
    item.type === 'work' ? 'Работа' : 'Запчасть',
    item.name,
    String(item.quantity),
    `${item.price.toFixed(2)} руб.`,
    `${(item.quantity * item.price).toFixed(2)} руб.`,
  ]);
  
  doc.autoTable({
    startY: 130,
    head: [['Тип', 'Наименование', 'Кол-во', 'Цена', 'Сумма']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  let discountAmount = 0;
  if (order.discountType === 'percent') {
    discountAmount = subtotal * order.discount / 100;
  } else {
    discountAmount = order.discount;
  }
  const total = subtotal - discountAmount;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Подитог: ${subtotal.toFixed(2)} руб.`, 140, finalY);
  if (order.discount > 0) {
    doc.text(`Скидка (${order.discount}${order.discountType === 'percent' ? '%' : ' руб.'}): -${discountAmount.toFixed(2)} руб.`, 140, finalY + 7);
  }
  doc.setFontSize(13);
  doc.text(`ИТОГО: ${total.toFixed(2)} руб.`, 140, finalY + (order.discount > 0 ? 17 : 10));
  
  if (order.notes) {
    doc.setFontSize(10);
    doc.text(`Примечания: ${order.notes}`, 14, finalY + 30);
  }
  
  return doc;
}

export function generateInspectionPDF(inspection: Inspection, order?: WorkOrder): jsPDF {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Акт осмотра', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Дата осмотра: ${new Date(inspection.date).toLocaleDateString('ru-RU')}`, 14, 35);
  if (order) {
    doc.text(`Заказ-наряд: ${order.number}`, 14, 42);
    doc.text(`Клиент: ${order.clientName}`, 14, 49);
    doc.text(`Автомобиль: ${order.carBrand} ${order.carModel} (${order.carYear})`, 14, 56);
  }
  
  doc.text(`Пробег: ${inspection.mileage} км`, 14, 70);
  doc.text(`Состояние кузова: ${inspection.bodyCondition}`, 14, 77);
  doc.text(`Уровень топлива: ${inspection.fuelLevel}%`, 14, 84);
  
  doc.setFontSize(11);
  doc.text('Обнаруженные неисправности:', 14, 97);
  doc.setFontSize(10);
  const findingsLines = doc.splitTextToSize(inspection.findings || 'Не обнаружены', 180);
  doc.text(findingsLines, 14, 105);
  
  doc.setFontSize(11);
  doc.text('Рекомендации:', 14, 105 + findingsLines.length * 5 + 10);
  doc.setFontSize(10);
  const recLines = doc.splitTextToSize(inspection.recommendations || 'Нет', 180);
  doc.text(recLines, 14, 105 + findingsLines.length * 5 + 18);
  
  doc.setFontSize(9);
  doc.text(`Количество фото: ${inspection.photos.length}`, 14, 250);
  
  return doc;
}

export function generateAcceptanceActPDF(act: AcceptanceAct, order?: WorkOrder): jsPDF {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Акт приема-передачи', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Дата: ${new Date(act.date).toLocaleDateString('ru-RU')}`, 14, 35);
  doc.text(`Клиент: ${act.clientName}`, 14, 42);
  doc.text(`Автомобиль: ${act.carInfo}`, 14, 49);
  
  const tableData = act.items.map(item => [
    item.name,
    String(item.quantity),
    `${item.price.toFixed(2)} руб.`,
    `${(item.quantity * item.price).toFixed(2)} руб.`,
  ]);
  
  doc.autoTable({
    startY: 60,
    head: [['Наименование', 'Кол-во', 'Цена', 'Сумма']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  const subtotal = act.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  let discountAmount = 0;
  if (act.discountType === 'percent') {
    discountAmount = subtotal * act.discount / 100;
  } else {
    discountAmount = act.discount;
  }
  const total = subtotal - discountAmount;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Подитог: ${subtotal.toFixed(2)} руб.`, 140, finalY);
  if (act.discount > 0) {
    doc.text(`Скидка: -${discountAmount.toFixed(2)} руб.`, 140, finalY + 7);
  }
  doc.setFontSize(13);
  doc.text(`ИТОГО: ${total.toFixed(2)} руб.`, 140, finalY + (act.discount > 0 ? 17 : 10));
  
  if (act.notes) {
    doc.setFontSize(10);
    doc.text(`Примечания: ${act.notes}`, 14, finalY + 30);
  }
  
  doc.setFontSize(10);
  doc.text('Подпись клиента: _________________', 14, 250);
  doc.text('Подпись исполнителя: _________________', 120, 250);
  
  return doc;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    completed: 'Завершен',
    cancelled: 'Отменен',
  };
  return labels[status] || status;
}

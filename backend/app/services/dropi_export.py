from io import BytesIO

from openpyxl import Workbook


HEADERS = [
    "Nombre", "Apellido", "Teléfono", "Dirección", "Ciudad",
    "Departamento", "Email", "Cédula", "Notas", "Producto",
    "Cantidad", "Precio Total", "ID Producto Dropi", "ID Variación",
]


def generate_dropi_excel(orders) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Pedidos Dropi"

    ws.append(HEADERS)

    for order in orders:
        for item in order.items:
            ws.append([
                order.customer_name,
                order.customer_surname or "",
                order.customer_phone,
                order.address,
                order.city,
                order.state or "",
                order.customer_email or "",
                order.customer_dni or "",
                order.notes or "",
                item.product_name,
                item.quantity,
                float(item.total_price),
                item.dropi_product_id or "",
                item.dropi_variation_id or "",
            ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer

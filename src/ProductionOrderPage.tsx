import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Table, message, Spin, Alert } from 'antd';

interface ProductionOrder {
  id: string;
  reference: string;
  product: string;
  quantity: number;
  dueDate: string;
  status: string;
  createdAt: string;
}


export const ProductionOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const columns = [
   { title: 'ID', dataIndex: 'id', key: 'id' },
   { title: 'Referencia', dataIndex: 'reference', key: 'reference' },
   { title: 'Producto', dataIndex: 'product', key: 'product' },
   { title: 'Cantidad', dataIndex: 'quantity', key: 'quantity' },
   { title: 'Fecha de entrega', dataIndex: 'dueDate', key: 'dueDate' },
   { title: 'Estado', dataIndex: 'status', key: 'status' },
 ];

 const fetchOrders = async () => {
   setLoading(true);
   setError(null);
   try {
     const res = await fetch('http://localhost:3001/api/production-orders')
     if (!res.ok) throw new Error('Error al cargar órdenes');
     const data: ProductionOrder[] = await res.json();
     setOrders(data);
   } catch (error: any) {
     setError(error.message);
   } finally {
     setLoading(false);
   }
 }

 useEffect(() => {
    fetchOrders();
  }, []);

  const submitForm = async (values: any) => {
    try {
      const body = {
        reference: values.reference,
        product: values.product,
        quantity: values.quantity,
        dueDate: values.dueDate.toISOString(),
      };

      const res = await fetch('http://localhost:3001/api/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Error creando orden');

      const createdOrder = await res.json();
      setOrders(prev => [...prev, createdOrder]);
      message.success('Orden creada correctamente');
      form.resetFields();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Crear Orden</h1>
      <Form form={form} layout="vertical" onFinish={submitForm}>
        <Form.Item name="reference" label="Referencia" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="product" label="Producto" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="quantity" label="Cantidad" rules={[{ required: true, type: 'number', min: 1 }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dueDate" label="Fecha de entrega" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Agregar Orden</Button>
        </Form.Item>
      </Form>

      <h2>Listado de Órdenes</h2>
      {loading ? (
        <Spin tip="Cargando..." />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <Table dataSource={orders} columns={columns} rowKey="id" />
      )}
    </div>
  );
}

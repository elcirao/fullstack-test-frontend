// ProductionOrderPage.minimal.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductionOrderPage } from './ProductionOrderPage';

jest.mock('moment', () => {
    return () => ({});
});

global.fetch = jest.fn();

jest.mock('antd', () => {
    const React = require('react');
    return {
        __esModule: true,
        Form: { useForm: () => [ {}, jest.fn() ] },
        Input: (props: any) => <input aria-label={props.label} {...props} />,
        InputNumber: (props: any) => <input type="number" aria-label={props.label} {...props} />,
        DatePicker: (props: any) => (
            <input
                data-testid="date-picker"
                aria-label={props.label}
                onChange={() =>
                    props.onChange({ toISOString: () => '2025-12-31T00:00:00.000Z' })
                }
            />
        ),
        Button: (props: any) => <button {...props} />,
        Table: (props: any) => (
            <table>
                <tbody>
                    <tr><th>Referencia</th><th>Producto</th></tr>
                    {props.dataSource?.map((row: any) => (
                        <tr key={row.id}>
                            <td>{row.reference}</td>
                            <td>{row.product}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ),
        message: { success: jest.fn(), error: jest.fn() },
        Spin: () => <div>Cargando...</div>,
        Alert: (props: any) => <div>{props.message}</div>,
    };
});

describe('ProductionOrderPage minimal', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('renders page and fetches orders successfully (empty list)', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [] });

        render(<ProductionOrderPage />);

        await waitFor(() => {
            expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
            expect(screen.getByText(/Listado de Órdenes/i)).toBeInTheDocument();
        });
    });

    it('creates a new order and displays it', async () => {
        const newOrder = {
            id: '1',
            reference: 'REF-001',
            product: 'Widget',
            quantity: 10,
            dueDate: '2025-12-31T00:00:00.000Z',
            status: 'planned',
            createdAt: '2025-10-29T00:00:00.000Z',
        };

        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [] });

        (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => newOrder });

        render(<ProductionOrderPage />);

        await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());

        await user.type(screen.getByLabelText(/Referencia/i), newOrder.reference);
        await user.type(screen.getByLabelText(/Producto/i), newOrder.product);
        await user.type(screen.getByLabelText(/Cantidad/i), String(newOrder.quantity));

        const dateInput = screen.getByTestId('date-picker');
        await user.type(dateInput, '2025-12-31');

        await user.click(screen.getByRole('button', { name: /Agregar Orden/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/production-orders'),
                expect.objectContaining({ method: 'POST' })
            );

            expect(screen.getByText('REF-001')).toBeInTheDocument();
            expect(screen.getByText('Widget')).toBeInTheDocument();

            expect(jest.mocked(require('antd').message.success)).toHaveBeenCalledWith('Orden creada correctamente');
        });
    });
});

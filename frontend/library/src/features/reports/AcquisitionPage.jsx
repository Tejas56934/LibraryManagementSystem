import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPurchaseOrders, receiveOrder } from './AcquisitionSlice';
import { format } from 'date-fns';
// Assume '../../components' exports these components individually:
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
// Assuming a Modal component for placing new orders is available (or will be)
// import Modal from '../../components/Modal';
// import OrderForm from './OrderForm'; // A component for the actual order creation form

const AcquisitionPage = () => {
    const dispatch = useDispatch();
    // Assuming 'acquisition' slice is correctly mapped in store.js
    const { orders, loading, error } = useSelector(state => state.acquisition);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); // State for the order modal

    useEffect(() => {
        // Fetch all orders when the component mounts
        // This is crucial for displaying existing data immediately
        dispatch(getPurchaseOrders());
    }, [dispatch]);

    /**
     * Handles marking a Purchase Order as RECEIVED.
     * Triggers the backend logic to update inventory stock (Req 9).
     */
    const handleReceiveOrder = (orderId) => {
        if (window.confirm("Are you sure you want to mark this order as RECEIVED? This will update the inventory stock.")) {
            dispatch(receiveOrder(orderId))
                .unwrap()
                .then(() => {
                    // Success handling (e.g., toast.success)
                    console.log(`Order ${orderId} marked as received!`);
                })
                .catch(err => {
                    // Error handling (e.g., toast.error)
                    console.error("Failed to receive order:", err);
                });
        }
    };

    // Handler for opening the order creation modal
    const handlePlaceNewOrder = () => {
        // Here you would typically open a modal or navigate to a dedicated form page
        console.log("Opening Place New Order Modal/Page...");
        setIsOrderModalOpen(true);
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'ALL') return true;
        // Ensure status matches the case used in the backend model
        return order.status.toUpperCase() === filterStatus.toUpperCase();
    });

    const orderColumns = [
        { header: 'ID', accessor: 'id', render: (order) => order.id.substring(0, 8) },
        { header: 'Vendor', accessor: 'vendorName' },
        { header: 'Items', render: (order) => order.items.length },
        { header: 'Cost', render: (order) => `$${order.totalCost ? order.totalCost.toFixed(2) : '0.00'}` },
        { header: 'Date Placed', render: (order) => format(new Date(order.orderDate), 'dd-MM-yyyy') },
        { header: 'Status', accessor: 'status' },
        {
            header: 'Action',
            render: (order) => (
                // Only show "Mark Received" button if the status is NOT RECEIVED
                order.status.toUpperCase() !== 'RECEIVED' ? (
                    <Button
                        onClick={() => handleReceiveOrder(order.id)}
                        variant="primary"
                        disabled={loading === 'pending'}
                    >
                        Mark Received
                    </Button>
                ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                        Inventory Updated
                    </span>
                )
            )
        },
    ];

    if (loading === 'pending' && orders.length === 0) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-danger">Error loading orders: {error.message || 'An error occurred'}</div>;
    }

    return (
        <div className="acquisition-page">
            <h2 className="mb-4">🛍️ Acquisitions Management</h2>

            <div className="d-flex justify-content-between mb-4">
                <Button variant="success" onClick={handlePlaceNewOrder}>
                    + Place New Order
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => console.log("Navigate to Vendor Management Page")}>
                    Manage Vendors
                </Button>

                <div className="filter-controls">
                    <label htmlFor="statusFilter">Filter Status:</label>
                    <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">All</option>
                        <option value="PLACED">PLACED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>
            </div>

            <Card title={`Purchase Orders (${filterStatus} Orders)`}>
                <Table columns={orderColumns} data={filteredOrders} />
            </Card>

            {/* Placeholder for the New Order Modal */}
            {isOrderModalOpen && (
                <div style={{ /* Simple modal backdrop styles */ }}>
                    {/* You would render your OrderForm component here */}
                    <div style={{ padding: '20px', background: 'white', border: '1px solid black' }}>
                        <h3>Place New Order Form</h3>
                        <p>Form content goes here...</p>
                        <Button onClick={() => setIsOrderModalOpen(false)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcquisitionPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';

const AdminScanner = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [error, setError] = useState(null);

    const handleScan = (result) => {
        if (result) {
            // The library returns an array of results, we take the first one
            const rawValue = result[0]?.rawValue;

            if (rawValue) {
                setScannedData(rawValue);
                // Play a "Beep" sound for feedback (Optional but cool)
                const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
                audio.play();

                // 🚀 ACTION: Redirect to Issue Page instantly
                // Assuming your Issue page can take a query param like ?studentId=...
                // Or you can navigate to the Student Detail page
                setTimeout(() => {
                    navigate(`/admin/students/details/${rawValue}`);
                    // OR if you want to go straight to issue:
                    // navigate(`/admin/borrow/issue?studentId=${rawValue}`);
                }, 500); // Small delay so they see the success message
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError("Camera permission denied or not available.");
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>📸 Scan Student ID</h2>
            <p className="text-gray-500 mb-4">Point the camera at the Student's QR Code</p>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div style={{ maxWidth: '400px', margin: '0 auto', border: '5px solid #4f46e5', borderRadius: '20px', overflow: 'hidden' }}>
                <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    scanDelay={500} // Scan every 500ms
                />
            </div>

            <div style={{ marginTop: '20px' }}>
                {scannedData ? (
                    <h3 style={{ color: 'green' }}>✅ Found: {scannedData}</h3>
                ) : (
                    <p>Scanning...</p>
                )}
            </div>

            <div style={{ marginTop: '30px', background: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
                <h4>💡 Pro Tip:</h4>
                <p style={{ fontSize: '13px' }}>
                    If you have a <strong>USB Barcode Scanner</strong>, you don't need this page!
                    Just go to the "Issue Book" page and click the Student ID field.
                    Then scan the QR code with the USB gun. It works like a keyboard!
                </p>
            </div>
        </div>
    );
};

export default AdminScanner;
// frontend/src/pages/shared/ShelfMapPage.jsx (FINAL VERSION)

import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import styled, { keyframes } from 'styled-components';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import bookApi from '../api/bookApi';
import Button from '../components/Button'; // Assuming Button component path

// --- Styled Components ---

const MapContainer = styled.div`
    padding: var(--spacing-xl);
    background-color: var(--color-background);
    min-height: 100vh;
`;

const MapCard = styled.div`
    background: white;
    border-radius: 10px;
    box-shadow: var(--shadow-md);
    padding: 20px;
`;

const SearchBar = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    input {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    button {
        padding: 10px 15px;
        /* Using the Button component now */
    }
`;

const LibraryMap = styled.div`
    position: relative;
    width: 100%;
    height: 600px;
    background-color: #f0f0f0; /* Map background */
    background-image: repeating-linear-gradient(0deg, #ddd, #ddd 1px, transparent 1px, transparent 50px),
                      repeating-linear-gradient(90deg, #ddd, #ddd 1px, transparent 1px, transparent 50px);
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
`;

const TargetMarker = styled(FaMapMarkerAlt)`
    position: absolute;
    color: var(--color-danger);
    font-size: 30px;
    filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.8));
    animation: ${keyframes`
        0%, 100% { transform: translate(-50%, -100%) scale(1); }
        50% { transform: translate(-50%, -100%) scale(1.2); }
    `} 1.5s infinite;

    /* Position based on coordinates fetched from backend (0-100 range expected) */
    left: ${props => props.$x}%;
    top: ${props => props.$y}%;
    z-index: 10;
    pointer-events: none; /* Allows clicks/interactions on layers beneath */
`;

const ShelfMarker = styled.div`
    position: absolute;
    width: ${props => props.$width}px; /* Example fixed size */
    height: ${props => props.$height}px; /* Example fixed size */
    background: var(--color-secondary);
    opacity: 0.6;
    border-radius: 3px;
    cursor: default;
    /* Position based on coordinates fetched from backend (0-100 range expected) */
    left: ${props => props.$x}%;
    top: ${props => props.$y}%;
    transform: translate(-50%, -50%); /* Center the shelf marker */

    &:hover {
        opacity: 0.9;
        box-shadow: 0 0 5px var(--color-primary);
        z-index: 5;
    }
`;


const ShelfMapPage = () => {
    const [bookId, setBookId] = useState('');
    const [location, setLocation] = useState(null); // Holds the target Shelf object (mapX, mapY)
    const [allShelves, setAllShelves] = useState([]); // Holds all defined shelves for background map
    const [loading, setLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapError, setMapError] = useState(null);

    // Fetch the entire map layout (all shelves) on component mount
    useEffect(() => {
        const fetchMapLayout = async () => {
            setMapLoading(true);
            try {
                // This fetches all shelf definitions (map structure)
                const shelves = await bookApi.getAllShelves();
                setAllShelves(shelves);
            } catch (err) {
                setMapError("Could not load library map layout. Check Admin API endpoint.");
            } finally {
                setMapLoading(false);
            }
        };

        // Only load the layout once
        fetchMapLayout();
    }, []);

    const handleSearch = useCallback(async () => {
        if (!bookId) {
            setError("Please enter a Book ID.");
            setLocation(null);
            return;
        }

        setLoading(true);
        setError(null);
        setLocation(null);

        try {
            // Find the location using the new API function
            const shelf = await bookApi.findBookLocation(bookId);

            // Assume mapX/mapY are normalized 0-100 percentage values
            setLocation(shelf);

        } catch (err) {
            // Display a user-friendly error from the server (ResourceNotFoundException)
            const msg = err.response?.data?.message || "Book location not found or not mapped.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    // Map coordinates for rendering
    const mapX = location?.mapX || 0;
    const mapY = location?.mapY || 0;

    return (
        <MapContainer>
            <MapCard>
                <h2>📚 Find Book Location</h2>
                <p>Enter a Book ID (ISBN, unique ID, etc.) to view its physical location on the library map.</p>

                <SearchBar>
                    <input
                        type="text"
                        placeholder="Enter Book ID (e.g., CS-001)"
                        value={bookId}
                        onChange={(e) => setBookId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={loading || mapLoading}>
                        <FaSearch /> {loading ? 'Searching...' : 'Find'}
                    </Button>
                </SearchBar>

                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
                {mapError && <p style={{ color: 'red', marginBottom: '15px' }}>{mapError}</p>}

                <LibraryMap>
                    {mapLoading && <p style={{ textAlign: 'center', paddingTop: '100px' }}>Loading Map Layout...</p>}

                    {/* 1. Render all static shelves */}
                    {!mapLoading && allShelves.map((shelf) => (
                        <ShelfMarker
                            key={shelf.shelfCode}
                            $x={shelf.mapX}
                            $y={shelf.mapY}
                            $width={20} // Placeholder size
                            $height={40} // Placeholder size
                            title={`${shelf.shelfCode} - ${shelf.locationDescription}`}
                        />
                    ))}

                    {/* 2. Render the dynamic target marker */}
                    {location && (
                        <TargetMarker
                            $x={mapX}
                            $y={mapY}
                            title={`TARGET: ${location.shelfCode}`}
                        />
                    )}
                </LibraryMap>

                {location && (
                    <div style={{ marginTop: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        Book Location: <span style={{ color: 'var(--color-primary)' }}>{location.locationDescription}</span>
                        <br/>
                        Shelf Code: <span style={{ color: 'var(--color-accent)' }}>{location.shelfCode}</span>
                        <br/>
                        <p style={{ marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                            (Note: Pathfinding feature would show the shortest route on the map.)
                        </p>
                    </div>
                )}
            </MapCard>
        </MapContainer>
    );
};

export default ShelfMapPage;
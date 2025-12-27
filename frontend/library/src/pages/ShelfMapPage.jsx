// frontend/src/pages/shared/ShelfMapPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaMapMarkerAlt, FaSearch, FaInfoCircle, FaMap, FaExclamationTriangle } from 'react-icons/fa';
import bookApi from '../api/bookApi';
import Button from '../components/Button';

// --- Styled Components ---

const PageWrapper = styled.div`
    padding: 30px;
    background-color: #f8f9fa;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
`;

const ContentCard = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
`;

const HeaderSection = styled.div`
    padding: 24px;
    border-bottom: 1px solid #edf2f7;

    h2 {
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #2d3748;
    }

    p {
        margin: 0;
        color: #718096;
        font-size: 0.95rem;
    }
`;

const ControlPanel = styled.div`
    padding: 20px 24px;
    background: #fdfdfd;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid #edf2f7;

    .search-wrapper {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
    }

    input {
        width: 100%;
        padding: 12px 12px 12px 40px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s;

        &:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
    }

    svg.search-icon {
        position: absolute;
        left: 14px;
        color: #a0aec0;
    }
`;

const MapViewport = styled.div`
    position: relative;
    width: 100%;
    height: 550px;
    background-color: #f7fafc;
    /* Clean blueprint grid effect */
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 40px 40px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
`;

const TargetMarker = styled(FaMapMarkerAlt)`
    position: absolute;
    color: #e53e3e;
    font-size: 34px;
    filter: drop-shadow(0 0 8px rgba(229, 62, 62, 0.6));
    z-index: 100;

    animation: ${keyframes`
        0%, 100% { transform: translate(-50%, -100%) scale(1); }
        50% { transform: translate(-50%, -115%) scale(1.1); }
    `} 1.2s ease-in-out infinite;

    left: ${props => props.$x}%;
    top: ${props => props.$y}%;
    pointer-events: none;
`;

const ShelfNode = styled.div`
    position: absolute;
    width: 24px;
    height: 45px;
    background: #cbd5e0;
    border: 1px solid #a0aec0;
    border-radius: 3px;
    left: ${props => props.$x}%;
    top: ${props => props.$y}%;
    transform: translate(-50%, -50%);
    transition: all 0.2s;
    opacity: 0.5;

    &:hover {
        opacity: 1;
        background: #4a5568;
        cursor: help;
        z-index: 50;
    }
`;

const LocationFooter = styled.div`
    padding: 24px;
    background: #f8fafc;
    border-top: 1px solid #edf2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .label {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #718096;
        font-weight: 600;
    }

    .value {
        font-size: 1.15rem;
        color: #2d3748;
        font-weight: 700;
    }

    .shelf-badge {
        background: #ebf8ff;
        color: #2b6cb0;
        padding: 6px 14px;
        border-radius: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        border: 1px solid #bee3f8;
    }
`;

const StatusMessage = styled.div`
    padding: 10px 24px;
    background: ${props => props.$isError ? '#fff5f5' : '#ebf8ff'};
    color: ${props => props.$isError ? '#c53030' : '#2b6cb0'};
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 500;
`;

const ShelfMapPage = () => {
    const [bookId, setBookId] = useState('');
    const [location, setLocation] = useState(null);
    const [allShelves, setAllShelves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMapLayout = async () => {
            try {
                const shelves = await bookApi.getAllShelves();
                setAllShelves(shelves);
            } catch (err) {
                console.error("Map Layout Error:", err);
            } finally {
                setMapLoading(false);
            }
        };
        fetchMapLayout();
    }, []);

    const handleSearch = useCallback(async () => {
        if (!bookId.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const shelf = await bookApi.findBookLocation(bookId);
            setLocation(shelf);
        } catch (err) {
            setLocation(null);
            setError(err.response?.data?.message || "Book not found in current inventory.");
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    return (
        <PageWrapper>
            <ContentCard>
                <HeaderSection>
                    <h2><FaMap color="var(--color-primary)" /> Library Navigation</h2>
                    <p>Locate any book physically within the library floors.</p>
                </HeaderSection>

                <ControlPanel>
                    <div className="search-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Enter Book ID or ISBN (e.g., BK-12345)"
                            value={bookId}
                            onChange={(e) => setBookId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading} style={{ minWidth: '120px' }}>
                        {loading ? 'Locating...' : 'Find Location'}
                    </Button>
                </ControlPanel>

                {error && (
                    <StatusMessage $isError>
                        <FaExclamationTriangle /> {error}
                    </StatusMessage>
                )}

                <MapViewport>
                    {mapLoading ? (
                        <div style={{ padding: '100px', textAlign: 'center', color: '#718096' }}>
                            Initialize Map Grid...
                        </div>
                    ) : (
                        <>
                            {allShelves.map((shelf) => (
                                <ShelfNode
                                    key={shelf.shelfCode}
                                    $x={shelf.mapX}
                                    $y={shelf.mapY}
                                    title={`${shelf.shelfCode}: ${shelf.locationDescription}`}
                                />
                            ))}
                            {location && (
                                <TargetMarker
                                    $x={location.mapX}
                                    $y={location.mapY}
                                    title="You're looking for this!"
                                />
                            )}
                        </>
                    )}
                </MapViewport>

                {location && (
                    <LocationFooter>
                        <div className="info-group">
                            <div className="label">Physical Location</div>
                            <div className="value">{location.locationDescription}</div>
                            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '4px' }}>
                                <FaInfoCircle style={{ marginRight: '5px' }} />
                                Shortest route: Ground floor entrance, turn left at Aisle A.
                            </div>
                        </div>
                        <div className="shelf-badge">
                            {location.shelfCode}
                        </div>
                    </LocationFooter>
                )}
            </ContentCard>
        </PageWrapper>
    );
};

export default ShelfMapPage;
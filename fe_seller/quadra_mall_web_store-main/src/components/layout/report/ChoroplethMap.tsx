import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import GeoJSON đầy đủ cho các tỉnh Việt Nam
import provincesData from '@/data/provinces.geojson';
import statsData from '@/data/stats.json';

const ChoroplethMap: React.FC = () => {
    const [geoData, setGeoData] = useState<any>(null);

    // Tải dữ liệu GeoJSON
    useEffect(() => {
        fetch(provincesData)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                console.log('GeoJSON data loaded:', data); // Debug
                setGeoData(data);
            })
            .catch((error) => console.error('Error loading GeoJSON:', error));
    }, []);

    // Hàm xác định màu sắc dựa trên giá trị
    const getColor = (value: number): string => {
        return value > 9000000 ? '#800026' :
            value > 8000000  ? '#BD0026' :
                value > 5000000  ? '#E31A1C' :
                    value > 2000000  ? '#FC4E2A' :
                        value > 1000000  ? '#FD8D3C' :
                            value > 500000   ? '#FEB24C' :
                                value > 100000   ? '#FED976' :
                                    '#FFEDA0';
    };

    // Áp dụng kiểu dáng cho từng khu vực
    const style = (feature: any) => {
        const provinceName = feature.properties.name;
        const provinceData = statsData.find((d: any) => d.province === provinceName);
        const value = provinceData ? provinceData.value : 0;

        return {
            fillColor: getColor(value),
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '0',
            fillOpacity: 0.7,
        };
    };

    // Thêm tooltip để hiển thị thông tin tỉnh
    const onEachFeature = (feature: any, layer: L.Layer) => {
        const provinceName = feature.properties.name;
        const provinceData = statsData.find((d: any) => d.province === provinceName);
        const value = provinceData ? provinceData.value : 0;
        layer.bindTooltip(`Tỉnh: ${provinceName}<br>Giá trị: ${value.toLocaleString()}`, { sticky: true });
    };

    return (
        <div className="w-full h-screen bg-white">
            <MapContainer
                center={[16.0, 106.0]} // Tọa độ trung tâm Việt Nam
                zoom={6}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {geoData ? (
                    <GeoJSON
                        data={geoData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                ) : (
                    <p className="text-center text-gray-500">Đang tải bản đồ...</p>
                )}
            </MapContainer>
        </div>
    );
};

export default ChoroplethMap;
// import React from "react";
// import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
// import vietnamProvinces from '@/data/provinces.geojson';
//
// interface GeoJsonProperties {
//     GID_1: string;
//     GID_0: string;
//     COUNTRY: string;
//     NAME_1: string;
//     VARNAME_1: string;
//     NL_NAME_1: string;
//     TYPE_1: string;
//     ENGTYPE_1: string;
//     CC_1: string;
//     HASC_1: string;
//     ISO_1: string;
// }
//
// interface GeoJsonFeature {
//     type: string;
//     properties: GeoJsonProperties;
//     geometry: { type: string; coordinates: number[][][] };
//     rsmKey: string;
// }
//
// interface GeoJsonGeography {
//     geographies: GeoJsonFeature[];
// }
//
// interface CustomerDemographicsData {
//     name: string;
//     value: number;
// }
//
// interface Props {
//     data: CustomerDemographicsData[];
// }
//
// // Đối tượng ánh xạ màu cố định cho từng tỉnh/thành phố
// const colorMap = {
//     "Hà Nội": "#2563eb",        // Xanh dương
//     "TP. Hồ Chí Minh": "#f59e0b", // Vàng
//     "Đà Nẵng": "#f97316",       // Cam
//     "Cần Thơ": "#10b981",       // Xanh lá
//     "Nha Trang": "#8b5cf6",     // Tím
//     "Buôn Ma Thuột": "#ec4899", // Hồng
//     "Quy Nhơn": "#9333ea",      // Tím đậm
//     "Other": "#6b7280"          // Xám
// } as const;
//
// // Hàm ánh xạ và loại bỏ dấu cách cho tên trong GeoJSON
// const mapDataNameToGeoJsonName = (name: string): string => {
//     const nameMap: Record<string, string> = {
//         "Hà Nội": "HàNội",
//         "TP. Hồ Chí Minh": "TPHồChíMinh",
//         "Đà Nẵng": "ĐàNẵng",
//         "Cần Thơ": "CầnThơ",
//         "Nha Trang": "KhánhHòa",    // Ánh xạ Nha Trang sang KhánhHòa
//         "Buôn Ma Thuột": "ĐắkLắk",  // Ánh xạ Buôn Ma Thuột sang ĐắkLắk
//         "Quy Nhơn": "BìnhĐịnh",     // Ánh xạ Quy Nhơn sang BìnhĐịnh
//         "Other": "Other"
//     };
//     // Loại bỏ dấu cách từ tên được ánh xạ
//     return (nameMap[name] || name).replace(/\s/g, "");
// };
//
// const getLegendData = (data: CustomerDemographicsData[]) => {
//     return data; // Trả về toàn bộ dữ liệu mà không gộp "Other"
// };
//
// const CustomerDemographicsMap: React.FC<Props> = ({ data }) => {
//     const legendData = getLegendData(data);
//
//     return (
//         <div className="bg-white p-4 rounded shadow flex">
//             {/* Phần chú thích (Legend) bên trái */}
//             <div className="pr-4">
//                 <h3 className="text-md font-semibold mb-2">Customer Demographics</h3>
//                 {legendData.map((item, index) => (
//                     <div key={index} className="flex items-center mb-1">
//                         <span
//                             className="w-4 h-4 mr-2"
//                             style={{ backgroundColor: colorMap[item.name as keyof typeof colorMap] || "#f3f4f6" }}
//                         ></span>
//                         <span>{item.name}</span>
//                         <span className="ml-2">{item.value.toLocaleString()}</span>
//                     </div>
//                 ))}
//             </div>
//
//             {/* Phần bản đồ bên phải */}
//             <div className="w-3/4 relative">
//                 <div className="w-[400px] h-[500px] overflow-hidden border border-gray-300">
//                     <ComposableMap
//                         projection="geoMercator"
//                         projectionConfig={{ scale: 2000, center: [106, 16] }}
//                         width={400}
//                         height={500}
//                     >
//                         <ZoomableGroup>
//                             <Geographies geography={vietnamProvinces}>
//                                 {({ geographies }: GeoJsonGeography) =>
//                                     geographies.map((geo: GeoJsonFeature) => {
//                                         const provinceNameGeo = geo.properties.NAME_1;
//                                         console.log("Province from GeoJSON:", provinceNameGeo); // Debug
//                                         const provinceData = data.find(
//                                             (d) => mapDataNameToGeoJsonName(d.name) === provinceNameGeo
//                                         );
//                                         const color = provinceData ? colorMap[provinceData.name as keyof typeof colorMap] || "#f3f4f6" : "#f3f4f6";
//
//                                         return (
//                                             <Geography
//                                                 key={geo.rsmKey}
//                                                 geography={geo}
//                                                 fill={color}
//                                                 stroke="#FFFFFF"
//                                                 strokeWidth={0.5}
//                                             />
//                                         );
//                                     })
//                                 }
//                             </Geographies>
//                         </ZoomableGroup>
//                     </ComposableMap>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default CustomerDemographicsMap;
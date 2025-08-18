export interface ShipperRegistrationRequest {
  vehicleType: VehicleType;
  licensePlate?: string;
  idCardNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  driverLicenseUrl?: string;
  vehicleRegistrationUrl?: string;
}

export interface ShipperRegistrationResponse {
  id: number;
  userFullName: string;
  userEmail: string;
  vehicleType: VehicleType;
  licensePlate?: string;
  idCardNumber: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipperRegistrationStatusResponse {
  // Registration info (always available)
  registrationId: number;
  userFullName: string;
  userEmail: string;
  vehicleType: VehicleType;
  licensePlate?: string;
  idCardNumber: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  registrationCreatedAt: string;
  registrationUpdatedAt: string;
  
  // Shipper info (only if approved)
  shipperId?: number;
  shipperCode?: string;
  isActive?: boolean;
  totalDeliveries?: number;
  successfulDeliveries?: number;
  rating?: number;
  shipperCreatedAt?: string;
}

export enum VehicleType {
  MOTORBIKE = 'MOTORBIKE',
  CAR = 'CAR',
  BICYCLE = 'BICYCLE'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const VEHICLE_TYPE_LABELS = {
  [VehicleType.MOTORBIKE]: 'Xe máy',
  [VehicleType.CAR]: 'Ô tô',
  [VehicleType.BICYCLE]: 'Xe đạp'
};
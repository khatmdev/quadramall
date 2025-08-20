import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '@/store';
import { createApi } from '@/services/axios';
import { sellerRegistrationApi } from '@/services/sellerRegistrationService';
import { uploadImage } from '@/services/uploadService';
import WelcomeScreen from '@/components/layout/ShopRegistration/WelcomeScreen';
import PendingScreen from '@/components/layout/ShopRegistration/PendingScreen';
import SuccessScreen from '@/components/layout/ShopRegistration/SuccessScreen';
import RegistrationEditPage from '@/components/layout/ShopRegistration/RegistrationEditPage';
import StepIndicator from '@/components/layout/ShopRegistration/StepIndicator';
import Step1ShopInfo from '@/components/layout/ShopRegistration/Step1ShopInfo';
import Step2PickupAddress from '@/components/layout/ShopRegistration/Step2PickupAddress';
import Step3TaxInfo from '@/components/layout/ShopRegistration/Step3TaxInfo';
import Step4Complete from '@/components/layout/ShopRegistration/Step4Complete';
import { ShopFormData } from '@/types/ShopRegistration';
import {
    SellerRegistrationRequest,
    RegistrationDetails,
    RegistrationStatus
} from '@/types/sellerRegistration';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Khởi tạo API
const api = createApi();
const sellerApi = sellerRegistrationApi(api);

const ShopRegistration: React.FC = () => {
    const { user, storeIds } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const [registrationData, setRegistrationData] = useState<RegistrationDetails | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showEditPage, setShowEditPage] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ShopFormData>({
        shopName: '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        pickupContactPhone: '',
        pickupContactName: '',
        fullName: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        description: '',
        idNumber: '',
        idFrontImage: null,
        idBackImage: null,
        businessLicense: null,
        logo: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Kiểm tra trạng thái đăng ký khi component mount
    useEffect(() => {
        const checkRegistrationStatus = async () => {
            console.log('User state:', user);
            if (!user) {
                console.log('No user, showing WelcomeScreen');
                setShowWelcome(true);
                return;
            }

            // Kiểm tra nếu đến từ SelectStore (có state từ navigate)
            const fromSelectStore = location.state?.fromSelectStore;
            console.log('From SelectStore:', fromSelectStore);

            try {
                console.log('Checking registration status for user:', user.email);
                const currentRegistration = await sellerApi.getCurrentUserRegistration();
                console.log('Current registration:', currentRegistration);

                if (currentRegistration) {
                    setRegistrationData(currentRegistration);

                    // Xử lý theo trạng thái - ưu tiên hiển thị trạng thái đăng ký trước
                    switch (currentRegistration.status) {
                        case RegistrationStatus.PENDING:
                            console.log('Status: PENDING - showing PendingScreen');
                            setShowWelcome(false);
                            setShowEditPage(false);
                            setShowSuccess(false);
                            break;

                        case RegistrationStatus.REJECTED:
                            console.log('Status: REJECTED - showing EditPage');
                            setShowWelcome(false);
                            setShowEditPage(true);
                            setShowSuccess(false);
                            break;

                        case RegistrationStatus.APPROVED:
                            console.log('Status: APPROVED - user can register new store');
                            // Nếu từ SelectStore thì skip welcome, cho phép đăng ký mới luôn
                            if (fromSelectStore) {
                                console.log('From SelectStore - skipping welcome, allowing new registration');
                                setShowWelcome(false);
                                setShowEditPage(false);
                                setShowSuccess(false);
                                setRegistrationData(null);
                            } else {
                                // Nếu truy cập trực tiếp hoặc từ public site, hiển thị welcome
                                console.log('Direct access or from public - showing welcome screen');
                                setShowWelcome(true);
                                setShowEditPage(false);
                                setShowSuccess(false);
                                setRegistrationData(null);
                            }
                            break;

                        default:
                            console.log('Unknown status, showing WelcomeScreen');
                            setShowWelcome(true);
                            setShowEditPage(false);
                            setShowSuccess(false);
                            break;
                    }
                } else {
                    console.log('No pending/rejected registration, check if user should go to SelectStore or register new');

                    // Nếu từ SelectStore thì skip welcome, cho phép đăng ký mới luôn
                    if (fromSelectStore) {
                        console.log('From SelectStore - skipping welcome, allowing new registration');
                        setShowWelcome(false);
                        setShowEditPage(false);
                        setShowSuccess(false);
                        setRegistrationData(null);
                        return;
                    }

                    // Không có đăng ký PENDING/REJECTED
                    // Kiểm tra xem user có cửa hàng được duyệt không
                    if (storeIds && storeIds.length > 0) {
                        console.log('User has approved stores, redirect to SelectStore');
                        navigate('/select-store', { replace: true });
                        return;
                    }

                    // Nếu không có cửa hàng nào, hiển thị welcome screen cho user mới
                    console.log('No approved stores, show welcome screen for new user');
                    setShowWelcome(true);
                    setShowEditPage(false);
                    setShowSuccess(false);
                    setRegistrationData(null);
                }
            } catch (error: any) {
                console.log('Error checking registration:', error);

                // Nếu từ SelectStore thì skip welcome, cho phép đăng ký mới luôn
                if (fromSelectStore) {
                    console.log('From SelectStore - skipping welcome, allowing new registration despite error');
                    setShowWelcome(false);
                    setShowEditPage(false);
                    setShowSuccess(false);
                    setRegistrationData(null);
                    return;
                }

                // Khi có lỗi - kiểm tra xem có cửa hàng được duyệt không
                if (storeIds && storeIds.length > 0) {
                    console.log('Error but user has approved stores, redirect to SelectStore');
                    navigate('/select-store', { replace: true });
                    return;
                }

                // Nếu không có cửa hàng, hiển thị welcome screen
                console.log('Error and no approved stores, show welcome screen');
                setShowWelcome(true);
                setShowEditPage(false);
                setShowSuccess(false);
                setRegistrationData(null);
            }
        };

        checkRegistrationStatus();
    }, [user, navigate, storeIds, location.state]);

    // Cập nhật formData khi dữ liệu người dùng thay đổi
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                email: user.email || prev.email,
                phone: user.phoneNumber || prev.phone,
            }));
        }
    }, [user]);

    const updateFormData = (updates: Partial<ShopFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        const updatedFields = Object.keys(updates);
        setErrors((prev) => {
            const newErrors = { ...prev };
            updatedFields.forEach((field) => delete newErrors[field]);
            return newErrors;
        });
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.shopName.trim()) newErrors.shopName = 'Tên shop là bắt buộc';
                if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
                if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
                else if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, '')))
                    newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
                if (formData.logo && formData.logo.size > 5 * 1024 * 1024)
                    newErrors.logo = 'Ảnh logo vượt quá 5MB';
                break;

            case 2:
                if (!formData.pickupContactName.trim()) newErrors.pickupContactName = 'Họ và tên người liên hệ là bắt buộc';
                if (!formData.pickupContactPhone.trim()) newErrors.pickupContactPhone = 'Số điện thoại liên hệ là bắt buộc';
                else if (!/^\d{10,11}$/.test(formData.pickupContactPhone.replace(/\s/g, '')))
                    newErrors.pickupContactPhone = 'Số điện thoại liên hệ phải có 10-11 chữ số';
                if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
                if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
                if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
                if (!formData.ward) newErrors.ward = 'Vui lòng chọn phường/xã';
                break;

            case 3:
                if (!formData.idNumber.trim()) newErrors.idNumber = 'Mã số thuế là bắt buộc';
                else if (!/^\d{10}$/.test(formData.idNumber)) newErrors.idNumber = 'Mã số thuế phải có đúng 10 chữ số';
                if (!formData.idFrontImage) newErrors.idFrontImage = 'Ảnh mặt trước CMND/CCCD là bắt buộc';
                else if (formData.idFrontImage.size > 5 * 1024 * 1024) newErrors.idFrontImage = 'Ảnh mặt trước vượt quá 5MB';
                if (!formData.idBackImage) newErrors.idBackImage = 'Ảnh mặt sau CMND/CCCD là bắt buộc';
                else if (formData.idBackImage.size > 5 * 1024 * 1024) newErrors.idBackImage = 'Ảnh mặt sau vượt quá 5MB';
                if (formData.businessLicense && formData.businessLicense.size > 5 * 1024 * 1024) {
                    newErrors.businessLicense = 'Giấy phép kinh doanh vượt quá 5MB';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) {
            toast.error('Vui lòng kiểm tra và điền đầy đủ thông tin trước khi gửi.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Đang xử lý đăng ký cửa hàng...', {
            position: 'top-right',
        });

        try {
            // Upload các file để lấy URL
            let logoUrl: string | undefined;
            let businessLicenseUrl: string | undefined;
            const idCardUrl: string[] = [];

            if (formData.logo) {
                logoUrl = await uploadImage(formData.logo);
            }
            if (formData.idFrontImage) {
                idCardUrl[0] = await uploadImage(formData.idFrontImage);
            }
            if (formData.idBackImage) {
                idCardUrl[1] = await uploadImage(formData.idBackImage);
            }
            if (formData.businessLicense) {
                businessLicenseUrl = await uploadImage(formData.businessLicense);
            }

            // Gộp các trường địa chỉ thành một chuỗi
            const address = [
                formData.pickupContactName,
                formData.pickupContactPhone,
                formData.address,
                formData.ward,
                formData.district,
                formData.city,
            ].filter(Boolean).join(' , ');

            // Đăng ký mới
            const requestData: SellerRegistrationRequest = {
                email: user.email,
                storeName: formData.shopName,
                address,
                description: formData.description || undefined,
                taxCode: formData.idNumber || undefined,
                logoUrl,
                businessLicenseUrl,
                idCardUrl,
            };

            const response = await sellerApi.registerStore(requestData);

            toast.update(toastId, {
                render: 'Đăng ký cửa hàng thành công! Đang chờ duyệt.',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
                position: 'top-right',
            });

            console.log('Đăng ký cửa hàng thành công:', response);

            // Chuyển sang PendingScreen sau khi đăng ký thành công
            setRegistrationData({
                id: response.id,
                storeName: response.storeName,
                status: RegistrationStatus.PENDING,
                email: response.email,
                createdAt: response.createdAt,
            } as RegistrationDetails);

            // Reset form và chuyển về step 1 để chuẩn bị cho lần đăng ký tiếp theo
            setCurrentStep(1);
            setFormData({
                shopName: '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                pickupContactPhone: '',
                pickupContactName: '',
                fullName: '',
                address: '',
                city: '',
                district: '',
                ward: '',
                description: '',
                idNumber: '',
                idFrontImage: null,
                idBackImage: null,
                businessLicense: null,
                logo: null,
            });
            setErrors({});

            // Cập nhật states để hiển thị PendingScreen
            setShowWelcome(false);
            setShowEditPage(false);
            setShowSuccess(false);

        } catch (error: any) {
            console.error('Đăng ký thất bại:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra. Vui lòng thử lại sau.';
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: 5000,
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle back from edit page to pending
    const handleBackToPending = () => {
        setShowEditPage(false);
        // Update status to PENDING after successful edit
        if (registrationData) {
            setRegistrationData({
                ...registrationData,
                status: RegistrationStatus.PENDING
            });
        }
    };

    // Hiển thị EditPage nếu trạng thái REJECTED
    if (showEditPage && registrationData?.status === RegistrationStatus.REJECTED) {
        return (
            <RegistrationEditPage
                registrationData={registrationData}
                onBackToPending={handleBackToPending}
            />
        );
    }

    // Hiển thị PendingScreen nếu trạng thái PENDING
    if (registrationData?.status === RegistrationStatus.PENDING && !showEditPage) {
        return (
            <PendingScreen
                storeName={registrationData.storeName}
                email={registrationData.email}
                submittedAt={new Date(registrationData.createdAt).toLocaleDateString('vi-VN')}
            />
        );
    }

    // Hiển thị SuccessScreen khi được approved (chỉ hiển thị tạm thời sau khi submit thành công)
    if (showSuccess) {
        return <SuccessScreen />;
    }

    // Hiển thị WelcomeScreen cho người dùng mới
    if (showWelcome) {
        return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
    }

    // Mặc định hiển thị form đăng ký (khi không có đăng ký PENDING/REJECTED)
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1ShopInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        emailDisabled={!!user?.email}
                        phoneDisabled={!!user?.phoneNumber}
                    />
                );
            case 2:
                return (
                    <Step2PickupAddress
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <Step3TaxInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        setErrors={setErrors}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <Step4Complete
                        formData={formData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer />
            <StepIndicator currentStep={currentStep} totalSteps={4} />
            <div className="py-8">{renderCurrentStep()}</div>
            {currentStep < 4 && (
                <div className="sticky bottom-0 bg-white border-t shadow-lg">
                    <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                            Tiếp theo
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopRegistration;
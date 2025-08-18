import React from 'react';
import { Store, MapPin, UserCheck, CheckCircle } from 'lucide-react';

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
                                                                                  currentStep,
                                                                              }) => {
    const steps = [
        { id: 1, title: 'Thông tin Shop', icon: Store },
        { id: 2, title: 'Địa chỉ lấy hàng', icon: MapPin },
        { id: 3, title: 'Thông tin định danh', icon: UserCheck },
        { id: 4, title: 'Hoàn tất', icon: CheckCircle }
    ];

    return (
        <div className="bg-white shadow-sm border-b px-4 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                                            isCompleted
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : isActive
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <Icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-sm font-medium text-center ${
                                            isActive ? 'text-green-600' : 'text-gray-500'
                                        } hidden sm:block`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {!isLast && (
                                    <div
                                        className={`flex-1 h-1 mx-4 ${
                                            isCompleted ? 'bg-green-600' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
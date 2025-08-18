import { Card } from "@/components/ui/card";
import { Plus, Minus, ArrowLeftRight, History } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "../DepositModal";
import { WithdrawModal } from "../WithdrawModal";

interface QuickActionsProps {
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onTransferClick: () => void;
  onHistoryClick: () => void;
}

export function QuickActions({
  onDepositClick,
  onWithdrawClick,
  onTransferClick,
  onHistoryClick,
}: QuickActionsProps) {

    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);



  
    const handleDepositClick = () => {
      setShowDepositModal(true);
    };
  
    const handleWithdrawClick = () => {
      setShowWithdrawModal(true);
    };

  const actions = [
    {
      icon: Plus,
      label: "Nạp tiền",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgColor: "bg-blue-50",
      onClick: handleDepositClick,
    },
    {
      icon: Minus,
      label: "Rút tiền",
      color: "from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700",
      bgColor: "bg-red-50",
      onClick: handleWithdrawClick,
    },
    {
      icon: ArrowLeftRight,
      label: "Chuyển tiền",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      bgColor: "bg-green-50",
      onClick: onTransferClick,
    },
    {
      icon: History,
      label: "Lịch sử",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      bgColor: "bg-purple-50",
      onClick: onHistoryClick,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Card
            key={index}
            className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${action.bgColor}`}
            onClick={action.onClick}
          >
            <div className="relative p-6 text-center">
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon container with gradient background */}
              <div className={`relative w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.color} ${action.hoverColor} shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Label */}
              <p className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                {action.label}
              </p>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse transition-opacity duration-300" />
            </div>
          </Card>

          
        );
      })}
      <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />
      <WithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        wallet={null}
      />
    </div>
  );
}

// Demo component to show the QuickActions in action
export default function QuickActionsDemo() {
  const handleAction = (action: string) => {
    console.log(`${action} clicked!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <QuickActions
          onDepositClick={() => handleAction("Nạp tiền")}
          onWithdrawClick={() => handleAction("Rút tiền")}
          onTransferClick={() => handleAction("Chuyển tiền")}
          onHistoryClick={() => handleAction("Lịch sử")}
        />
      </div>
    </div>
  );
}
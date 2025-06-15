import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, CheckCircle, X, Ban } from 'lucide-react';

interface RiskNotificationProps {
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  conversationId: string;
  onClose: () => void;
}

export const RiskNotification: React.FC<RiskNotificationProps> = ({
  riskLevel,
  riskScore,
  conversationId,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, 8000); // Show longer for EU AI Act notifications

    return () => clearTimeout(timer);
  }, [onClose]);

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          icon: Ban,
          title: 'PROHIBITED AI System Detected!',
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          borderColor: 'border-red-700',
          description: 'This AI system is prohibited under EU AI Act'
        };
      case 'high':
        return {
          icon: AlertTriangle,
          title: 'High-Risk AI System Detected',
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          borderColor: 'border-orange-600',
          description: 'Requires conformity assessment and strict compliance'
        };
      case 'medium':
        return {
          icon: Shield,
          title: 'Limited Risk AI System',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          borderColor: 'border-yellow-600',
          description: 'Transparency obligations required'
        };
      default:
        return {
          icon: CheckCircle,
          title: 'Minimal Risk AI System',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-600',
          description: 'No specific regulatory obligations'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${config.bgColor} ${config.textColor} rounded-lg shadow-lg border-2 ${config.borderColor}
        p-4 flex items-start gap-3
      `}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{config.title}</h4>
          <p className="text-xs opacity-90 mt-1">
            EU AI Act Risk Score: {riskScore}/100
          </p>
          <p className="text-xs opacity-75 mt-1">
            {config.description}
          </p>
          <p className="text-xs opacity-75 mt-1 truncate">
            ID: {conversationId.slice(0, 12)}...
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
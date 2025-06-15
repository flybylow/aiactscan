import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle, Ban } from 'lucide-react';

interface RiskIndicatorProps {
  riskLevel?: 'critical' | 'high' | 'medium' | 'low' | 'undefined';
  riskScore?: number;
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  riskLevel = 'undefined', 
  riskScore, 
  className = '' 
}) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          icon: Ban,
          text: 'PROHIBITED',
          color: 'text-red-900',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          iconColor: 'text-red-700',
          description: 'AI system prohibited under EU AI Act'
        };
      case 'high':
        return {
          icon: ShieldAlert,
          text: 'HIGH-RISK',
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
          iconColor: 'text-orange-600',
          description: 'High-risk AI system requiring strict compliance'
        };
      case 'medium':
        return {
          icon: Shield,
          text: 'LIMITED RISK',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          iconColor: 'text-yellow-600',
          description: 'Limited risk AI system requiring transparency'
        };
      case 'low':
        return {
          icon: ShieldCheck,
          text: 'MINIMAL RISK',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          iconColor: 'text-green-600',
          description: 'Minimal risk AI system with no specific obligations'
        };
      case 'undefined':
      default:
        return {
          icon: HelpCircle,
          text: 'Risk: Pending',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          description: 'EU AI Act risk assessment in progress'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
      ${config.color} ${config.bgColor} ${config.borderColor} ${className}
    `}
    title={config.description}
    >
      <Icon className={`w-3 h-3 ${config.iconColor}`} />
      <span>{config.text}</span>
      {riskScore !== undefined && riskLevel !== 'undefined' && (
        <span className="ml-1 font-mono">({riskScore})</span>
      )}
    </div>
  );
};
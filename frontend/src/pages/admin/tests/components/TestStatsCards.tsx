import React from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Users, PlaySquare, CheckCircle2, Hourglass, UserX } from 'lucide-react';

interface TestStatsCardsProps {
  totalAssigned: number;
  started: number;
  completed: number;
  inProgress: number;
  notAttempted: number;
}

export const TestStatsCards: React.FC<TestStatsCardsProps> = ({
  totalAssigned,
  started,
  completed,
  inProgress,
  notAttempted
}) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  const getPercentage = (value: number) => {
    if (totalAssigned === 0) return '0%';
    return `${((value / totalAssigned) * 100).toFixed(2)}%`;
  };

  const cards = [
    {
      title: 'Total Assigned',
      value: totalAssigned,
      icon: Users,
      color: 'indigo',
      hasPercentage: false
    },
    {
      title: 'Attempted',
      value: started,
      percentage: getPercentage(started),
      icon: PlaySquare,
      color: 'blue',
      hasPercentage: true
    },
    {
      title: 'Completed',
      value: completed,
      percentage: getPercentage(completed),
      icon: CheckCircle2,
      color: 'emerald',
      hasPercentage: true
    },
    {
      title: 'In Progress',
      value: inProgress,
      percentage: getPercentage(inProgress),
      icon: Hourglass,
      color: 'amber',
      hasPercentage: true
    },
    {
      title: 'Not Attempted',
      value: notAttempted,
      percentage: getPercentage(notAttempted),
      icon: UserX,
      color: 'rose',
      hasPercentage: true
    }
  ];

  const getColorClasses = (color: string) => {
    const classes: Record<string, { iconBgLight: string, iconTextLight: string, iconBgDark: string, iconTextDark: string, pctTextLight: string, pctTextDark: string }> = {
      indigo: { iconBgLight: 'bg-indigo-100', iconTextLight: 'text-indigo-600', iconBgDark: 'bg-indigo-500/20', iconTextDark: 'text-indigo-400', pctTextLight: 'text-indigo-600', pctTextDark: 'text-indigo-400' },
      blue: { iconBgLight: 'bg-blue-100', iconTextLight: 'text-blue-600', iconBgDark: 'bg-blue-500/20', iconTextDark: 'text-blue-400', pctTextLight: 'text-blue-600', pctTextDark: 'text-blue-400' },
      emerald: { iconBgLight: 'bg-emerald-100', iconTextLight: 'text-emerald-600', iconBgDark: 'bg-emerald-500/20', iconTextDark: 'text-emerald-400', pctTextLight: 'text-emerald-600', pctTextDark: 'text-emerald-400' },
      amber: { iconBgLight: 'bg-amber-100', iconTextLight: 'text-amber-600', iconBgDark: 'bg-amber-500/20', iconTextDark: 'text-amber-400', pctTextLight: 'text-amber-600', pctTextDark: 'text-amber-400' },
      rose: { iconBgLight: 'bg-rose-100', iconTextLight: 'text-rose-600', iconBgDark: 'bg-rose-500/20', iconTextDark: 'text-rose-400', pctTextLight: 'text-rose-600', pctTextDark: 'text-rose-400' }
    };
    return classes[color];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color);

        return (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`p-5 rounded-2xl border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10'
                : 'bg-slate-900/50 border-white/10 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  isLightMode ? colors.iconBgLight + ' ' + colors.iconTextLight : colors.iconBgDark + ' ' + colors.iconTextDark
                }`}
              >
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {card.title}
                </p>
                <div className="flex items-end justify-between mt-1">
                  <h4 className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {card.value}
                  </h4>
                  {card.hasPercentage && (
                    <span className={`text-xs font-bold ${isLightMode ? colors.pctTextLight : colors.pctTextDark}`}>
                      {card.percentage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

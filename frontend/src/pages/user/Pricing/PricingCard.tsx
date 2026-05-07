import React from 'react';
import { Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Star } from 'lucide-react';
import Card from '../../../components/ui/Card';

export type PricingFeature = {
  name: string;
  included: boolean;
};

export type PricingCardProps = {
  plan: string;
  description: string;
  price: string;
  originalPrice?: string;
  period: string;
  features: PricingFeature[];
  icon: React.ReactNode;
  popular?: boolean;
  highlight?: boolean;
  buttonText: string;
  buttonVariant: 'outlined' | 'contained';
  iconBgColor?: string;
  iconColor?: string;
};

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  description,
  price,
  originalPrice,
  period,
  features,
  icon,
  popular,
  highlight,
  buttonText,
  buttonVariant,
  iconBgColor,
  iconColor
}) => {
  return (
    <div className="h-full relative flex">
      <Card
        component={motion.div}
        whileHover={{
          y: -8,
          boxShadow: highlight 
            ? '0 30px 60px -15px rgba(139, 92, 246, 0.4), 0 0 20px 0 rgba(99, 102, 241, 0.2)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 15px 0 rgba(99, 102, 241, 0.05)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        sx={{
          p: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          ...(highlight && {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: 'white',
          }),
        }}
      >
        {/* Popular Badge */}
        {popular && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
            <Star size={12} className="text-white fill-white" />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.7rem' }}>
              Most Popular
            </Typography>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div 
            className={`flex items-center justify-center w-12 h-12 rounded-full ${highlight ? 'bg-white/20 text-yellow-300' : `${iconBgColor} ${iconColor}`}`}
          >
            {icon}
          </div>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: highlight ? 'white' : 'text.primary' }}>
              {plan}
            </Typography>
            <Typography variant="body2" sx={{ color: highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary', fontWeight: 500 }}>
              {description}
            </Typography>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6 flex items-baseline gap-2">
          <Typography variant="h3" sx={{ fontWeight: 900, color: highlight ? 'white' : 'text.primary', display: 'flex', alignItems: 'center' }}>
            {price}
            <Typography component="span" variant="body1" sx={{ color: highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary', ml: 1, fontWeight: 600 }}>
              {period}
            </Typography>
          </Typography>
          {originalPrice && (
            <Typography variant="body1" sx={{ textDecoration: 'line-through', color: highlight ? 'rgba(255,255,255,0.6)' : 'text.disabled', fontWeight: 600, alignSelf: 'flex-end', mb: 0.5 }}>
              {originalPrice}
            </Typography>
          )}
        </div>

        {/* Divider */}
        <div className={`w-full h-px mb-6 ${highlight ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`} />

        {/* Features */}
        <div className="flex flex-col gap-3.5 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-3"
            >
              {feature.included ? (
                <CheckCircle2 size={18} className={highlight ? 'text-white' : 'text-green-500'} />
              ) : (
                <X size={18} className={highlight ? 'text-white/40' : 'text-red-500'} />
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: feature.included 
                    ? (highlight ? 'white' : 'text.primary') 
                    : (highlight ? 'rgba(255,255,255,0.6)' : 'text.secondary') 
                }}
              >
                {feature.name}
              </Typography>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-auto">
          <Button
          variant={buttonVariant}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            ...(highlight 
              ? {
                  bgcolor: 'white',
                  color: '#6366f1',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }
              : buttonVariant === 'contained'
                ? {
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white',
                  }
                : {
                    borderWidth: 2,
                    borderColor: 'slate.200',
                    color: 'text.primary',
                    '&:hover': { borderWidth: 2, bgcolor: 'action.hover' }
                  }
            )
          }}
        >
          {buttonText}
        </Button>
        </motion.div>
      </Card>
    </div>
  );
};

export default PricingCard;

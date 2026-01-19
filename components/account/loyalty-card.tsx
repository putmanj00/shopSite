'use client';

interface LoyaltyCardProps {
  points?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints?: number;
}

const tierConfig = {
  bronze: {
    name: 'Bronze',
    color: 'bg-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    benefits: ['Exclusive member discounts', 'Early access to sales'],
  },
  silver: {
    name: 'Silver',
    color: 'bg-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    benefits: ['10% off all orders', 'Free standard shipping', 'Birthday discount'],
  },
  gold: {
    name: 'Gold',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    benefits: ['15% off all orders', 'Free express shipping', 'Early access to new products', 'Birthday gift'],
  },
  platinum: {
    name: 'Platinum',
    color: 'bg-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800',
    benefits: ['20% off all orders', 'Free priority shipping', 'VIP early access', 'Exclusive products', 'Personal stylist'],
  },
};

export default function LoyaltyCard({ points = 0, tier = 'bronze', nextTierPoints = 500 }: LoyaltyCardProps) {
  const config = tierConfig[tier];
  const progress = nextTierPoints > 0 ? Math.min((points / nextTierPoints) * 100, 100) : 0;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`${config.color} w-3 h-3 rounded-full`} />
            <span className={`font-semibold ${config.textColor}`}>{config.name} Member</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{points.toLocaleString()} points</p>
        </div>

        <div className="text-right">
          <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      {/* Progress to next tier */}
      {tier !== 'platinum' && nextTierPoints > points && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{nextTierPoints - points} points to next tier</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Your Benefits</h4>
        <ul className="space-y-1">
          {config.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* How to earn points */}
      <div className="mt-4 p-3 bg-white rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Earn More Points</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 1 point per $1 spent</li>
          <li>• 100 points for leaving a review</li>
          <li>• 200 points for referring a friend</li>
        </ul>
      </div>
    </div>
  );
}

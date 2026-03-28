export const storefrontMotionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const storefrontRevealOffset = 10;
export const storefrontCardHoverOffset = -3;
export const storefrontTiltMaxDegrees = 6;
export const storefrontStaggerChildren = 0.14;
export const storefrontStaggerDelay = 0.08;

export const storefrontRevealTransition = {
  duration: 0.56,
  ease: storefrontMotionEase,
} as const;

export const storefrontHeroTransition = {
  duration: 0.55,
  ease: storefrontMotionEase,
} as const;

export const storefrontCardTransition = {
  duration: 0.42,
  ease: storefrontMotionEase,
} as const;

export const storefrontImageTransition = {
  duration: 0.32,
  ease: storefrontMotionEase,
} as const;

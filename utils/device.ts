export const getDeviceType = (): 'mobile' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  return (isMobileDevice || isSmallScreen) ? 'mobile' : 'desktop';
};

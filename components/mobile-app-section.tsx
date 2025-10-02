import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Apple, Play } from "lucide-react"; // icons

export function MobileAppSection( { className }: { className?: string } ) {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Invest anytime, anywhere with the <span className="text-primary">Arkan Shares App</span>
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                Manage your portfolio, view your returns, and discover new investment opportunities from your phone.
              </p>
            </div>

            {/* App Store Buttons */}
               <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* Apple App Store Button - More Authentic */}
      <Button 
        className="
          h-14 px-6 
          bg-gradient-to-b from-gray-900 to-black
          text-white 
          hover:from-gray-800 hover:to-gray-900
          border border-gray-700
          rounded-xl
          shadow-lg
          hover:shadow-xl
          transition-all
          duration-200
        "
      >
        <div className="flex items-center space-x-3">
          <AppleIcon />
          <div className="text-left">
            <div className="text-[10px] font-light opacity-90">Download on the</div>
            <div className="text-sm font-semibold tracking-wide">App Store</div>
          </div>
        </div>
      </Button>

      {/* Google Play Store Button - More Authentic */}
      <Button 
        className="
          h-14 px-6 
          bg-gradient-to-br from-[#4285F4] via-[#4285F4] to-[#0F9D58]
          text-white 
          hover:from-[#3367D6] hover:to-[#0B8043]
          border border-[#4285F4]
          rounded-xl
          shadow-lg
          hover:shadow-xl
          transition-all
          duration-200
          relative
          overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <GooglePlayIcon />
          <div className="text-left">
            <div className="text-[10px] font-light opacity-90">Get it on</div>
            <div className="text-sm font-semibold tracking-wide">Google Play</div>
          </div>
        </div>
      </Button>
    </div>
          </div>

          {/* Right Content - Phone Mockups */}
          <div className="relative">
            <div className="flex justify-center space-x-4">
              {/* Phone 1 */}
              <div className="bg-black rounded-3xl p-2 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl overflow-hidden w-48 h-96">
                  <img
                    src="/mobile-app-dashboard-with-investment-portfolio.jpg"
                    alt="Arkan Shares mobile app dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Phone 2 */}
              <div className="bg-black rounded-3xl p-2 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300 mt-8">
                <div className="bg-white rounded-2xl overflow-hidden w-48 h-96">
                  <img
                    src="/mobile-app-property-listing-with-investment-detail.jpg"
                    alt="Arkan Shares mobile app property listing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
// Custom SVG Icons for better authenticity
function AppleIcon() {
  return (
    <svg 
      className="w-6 h-6" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg 
      className="w-6 h-6" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
    </svg>
  );
}
export default function LogoDevHub({ className = "" }) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
<div className="
  p-2 
  rounded-xl 
  bg-gradient-to-br from-blue-400 to-blue-600
  border border-blue-500/20
  shadow-[0_0_10px_rgba(59,130,246,0.3)]
  backdrop-blur-md
">                      <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                >
                    {/* < */}
                    <polyline points="8 6 4 12 8 18" />

                    {/* > */}
                    <polyline points="16 6 20 12 16 18" />

                    {/* / atravessando mais */}
                    <line x1="9" y1="19" x2="15" y2="5" />
                </svg>
            </div>

            <h1 className="text-2x1 font-bold">
                <span className="text-white">Dev</span>
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Hub</span>
            </h1>
        </div>
    );
};

export function LogoSimples({ className = "" }) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <div className="
  p-2 
  rounded-xl 
  bg-gradient-to-br from-blue-400 to-blue-600
  border border-blue-500/20
  shadow-[0_0_10px_rgba(59,130,246,0.3)]
  backdrop-blur-md
">                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 br"
                >
                    {/* < */}
                    <polyline points="8 6 4 12 8 18" />

                    {/* > */}
                    <polyline points="16 6 20 12 16 18" />

                    {/* / atravessando mais */}
                    <line x1="9" y1="19" x2="15" y2="5" />
                </svg>
            </div>
        </div>
    );
}
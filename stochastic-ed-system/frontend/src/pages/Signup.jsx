import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  User,
  Building,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import logoSp from '../assets/logo-sp.png';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const triggerSuccessAnimation = () => {
    localStorage.setItem('pulseflowAuth', 'true');
    localStorage.setItem('simitAuth', 'true');
    setShowConfetti(true);
    setShowSuccessMessage(true);
    
    // Stop confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    // Navigate after showing message
    setTimeout(() => {
      navigate('/dashboard');
    }, 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Dummy signup - trigger success animation after brief delay
    setTimeout(() => {
      setIsLoading(false);
      triggerSuccessAnimation();
    }, 1500);
  };

  // Confetti colors matching theme
  const confettiColors = ['#003049', '#780000', '#C1121F', '#AE1F23', '#669BBC', '#ffffff'];

  const benefits = [
    'Run unlimited simulations',
    'Access all modeling techniques',
    'Export reports in any format',
    'Real-time optimization insights'
  ];

  return (
    <div className="min-h-screen bg-[#f5f8fb] flex items-center justify-center px-6 py-12 relative overflow-hidden pt-24">
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={confettiColors}
          confettiSource={{
            x: windowSize.width / 2,
            y: windowSize.height / 2,
            w: 0,
            h: 0
          }}
          initialVelocityX={15}
          initialVelocityY={30}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}
        />
      )}

      {/* Success Message Overlay */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#C1121F] to-[#AE1F23] rounded-2xl flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#780000] mb-2">Welcome to PulseFlow</h2>
              <p className="text-gray-600">Account created! Preparing your dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-72 h-72 bg-[#AE1F23]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-[#003049]/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src={logoSp} alt="PulseFlow Logo" className="w-16 h-16 rounded-2xl object-contain bg-white p-1.5 shadow-sm" />
            <span className="text-4xl font-bold text-[#780000]">PulseFlow</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Start optimizing your Emergency Department today
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Join healthcare professionals using advanced stochastic modeling to improve patient outcomes and operational efficiency.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#AE1F23]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#C1121F]" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/50 backdrop-blur-lg rounded-2xl border border-white/50">
            <p className="text-gray-600 italic mb-4">
              "PulseFlow has transformed how we approach capacity planning. The Monte Carlo simulations give us confidence in our staffing decisions."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C1121F] to-[#AE1F23] flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="font-semibold text-gray-800">Dr. Bino Alan</p>
                <p className="text-sm text-gray-500">ED Director, Metro Hospital</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8 md:hidden">
            <img src={logoSp} alt="PulseFlow Logo" className="w-14 h-14 rounded-2xl object-contain bg-white p-1.5 shadow-sm" />
            <span className="text-3xl font-bold text-[#780000]">PulseFlow</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#003049]/10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#003049] mb-2">Create Staff Account</h2>
              <p className="text-[#557283]">Enable access to PulseFlow simulation modules</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C1121F]/40 focus:border-[#C1121F] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C1121F]/40 focus:border-[#C1121F] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Hospital or organization name"
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C1121F]/40 focus:border-[#C1121F] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white/70 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C1121F]/40 focus:border-[#C1121F] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-[#780000] hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#780000] hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[#780000] to-[#C1121F] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#780000]/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#780000] font-semibold hover:text-[#C1121F] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

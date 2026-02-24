import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Activity,
  User,
  Building,
  CheckCircle
} from 'lucide-react';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Dummy signup - just redirect to dashboard after a brief delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const benefits = [
    'Run unlimited simulations',
    'Access all modeling techniques',
    'Export reports in any format',
    'Real-time optimization insights'
  ];

  return (
    <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center px-6 py-12 relative overflow-hidden">
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
          className="absolute top-20 right-10 w-72 h-72 bg-[#00b4d8]/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-10 w-96 h-96 bg-[#0077b6]/20 rounded-full blur-3xl"
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
            <div className="w-14 h-14 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-2xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-[#0077b6]">SIMIT</span>
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
                <div className="w-8 h-8 rounded-full bg-[#00b4d8]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#0077b6]" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/50 backdrop-blur-lg rounded-2xl border border-white/50">
            <p className="text-gray-600 italic mb-4">
              "SIMIT has transformed how we approach capacity planning. The Monte Carlo simulations give us confidence in our staffing decisions."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="font-semibold text-gray-800">Dr. Jane Doe</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-2xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-[#0077b6]">SIMIT</span>
          </Link>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Get started with your free account</p>
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
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-12 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent transition-all"
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
                  className="w-4 h-4 mt-1 text-[#0077b6] border-gray-300 rounded focus:ring-[#00b4d8]"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-[#0077b6] hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#0077b6] hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0077b6]/30 disabled:opacity-70"
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
              <Link to="/login" className="text-[#0077b6] font-semibold hover:text-[#00b4d8] transition-colors">
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

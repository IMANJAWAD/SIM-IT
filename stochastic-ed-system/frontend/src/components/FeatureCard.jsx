import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#caf0f8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#00b4d8] mb-6 shadow-lg shadow-[#0077b6]/20">
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#0077b6] transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#caf0f8] to-transparent rounded-tr-3xl rounded-bl-[60px] opacity-50" />
    </motion.div>
  );
}

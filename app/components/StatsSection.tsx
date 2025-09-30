"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiDollarSign, FiTrendingUp, FiGlobe } from 'react-icons/fi';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const useCountUp = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldStart]);
  
  return count;
};

const StatCard = ({ stat, index, inView }: { stat: StatItem; index: number; inView: boolean }) => {
  const count = useCountUp(stat.value, 2000 + index * 200, inView);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-purple-200 dark:group-hover:border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
            {stat.icon}
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {count.toLocaleString()}
            </span>
            <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {stat.suffix}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {stat.label}
          </p>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  
  const stats: StatItem[] = [
    {
      icon: <FiUsers className="w-6 h-6 text-white" />,
      value: 25000,
      suffix: "+",
      label: "Community Members",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: <FiDollarSign className="w-6 h-6 text-white" />,
      value: 2500000,
      suffix: "$",
      label: "Total Value Locked",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <FiTrendingUp className="w-6 h-6 text-white" />,
      value: 150,
      suffix: "%",
      label: "Growth Rate",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: <FiGlobe className="w-6 h-6 text-white" />,
      value: 45,
      suffix: "+",
      label: "Countries Reached",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Impressive Numbers That{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Speak for Themselves
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of investors who trust MEM Token. Our growing community and impressive metrics 
            demonstrate the strength and potential of our ecosystem.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} inView={inView} />
          ))}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default StatsSection;
"use client";

import { motion } from "framer-motion";
import { 
  FiCheckCircle, 
  FiCircle, 
  FiClock, 
  FiTarget, 
  FiTrendingUp, 
  FiGlobe, 
  FiShield,
  FiUsers
} from "react-icons/fi";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  quarter: string;
  icon: React.ReactNode;
}

const roadmapData: RoadmapItem[] = [
  {
    id: "1",
    title: "Project Launch & Presale",
    description: "Launch NEFE Token presale with USDT payments and smart contract deployment.",
    status: "in-progress",
    quarter: "Q1 2024",
    icon: <FiTarget className="w-5 h-5" />
  },
  {
    id: "2", 
    title: "Community Building",
    description: "Build strong community foundation with governance features and voting mechanisms.",
    status: "upcoming",
    quarter: "Q2 2024",
    icon: <FiUsers className="w-5 h-5" />
  },
  {
    id: "3",
    title: "Exchange Listings",
    description: "List NEFE Token on major decentralized and centralized exchanges.",
    status: "upcoming", 
    quarter: "Q2 2024",
    icon: <FiTrendingUp className="w-5 h-5" />
  },
  {
    id: "4",
    title: "Platform Expansion",
    description: "Expand to multiple blockchain networks and implement cross-chain functionality.",
    status: "upcoming",
    quarter: "Q3 2024", 
    icon: <FiGlobe className="w-5 h-5" />
  },
  {
    id: "5",
    title: "Advanced Security",
    description: "Implement advanced security features and complete additional audits.",
    status: "upcoming",
    quarter: "Q4 2024",
    icon: <FiShield className="w-5 h-5" />
  }
];

const RoadmapCard = ({ item, index }: { item: RoadmapItem; index: number }) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case "completed":
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <FiClock className="w-6 h-6 text-amber-500 animate-pulse" />;
      default:
        return <FiCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "completed":
        return "from-green-500 to-emerald-500";
      case "in-progress":
        return "from-amber-500 to-yellow-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getBorderColor = () => {
    switch (item.status) {
      case "completed":
        return "border-green-200 dark:border-green-700/30 hover:border-green-300 dark:hover:border-green-600";
      case "in-progress":
        return "border-amber-200 dark:border-amber-700/30 hover:border-amber-300 dark:hover:border-amber-600";
      default:
        return "border-gray-200 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${getBorderColor()} group`}
    >
      {/* Timeline connector */}
      {index < roadmapData.length - 1 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-amber-300 to-transparent dark:from-amber-600 hidden lg:block"></div>
      )}
      
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {item.quarter}
          </span>
        </div>
        <div className={`p-2 bg-gradient-to-br ${getStatusColor()} rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
          {item.icon}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
          {item.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

export default function RoadmapSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/20 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Background decorations */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-amber-200 dark:bg-amber-800 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-10 animate-pulse delay-1000"></div>
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Project{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Roadmap
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our strategic plan for building the future of MEM Token ecosystem with transparency and community-driven development.
            </p>
          </motion.div>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-amber-300 via-yellow-300 to-amber-300 dark:from-amber-600 dark:via-yellow-600 dark:to-amber-600 opacity-30"></div>
          
          {/* Roadmap Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            {roadmapData.map((item, index) => (
              <div
                key={item.id}
                className={`${
                  index % 2 === 0 ? "lg:pr-8" : "lg:pl-8 lg:col-start-2"
                }`}
              >
                <RoadmapCard item={item} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-full text-amber-700 dark:text-amber-300 text-sm font-medium">
            <FiTarget className="w-4 h-4" />
            Join us on this exciting journey
          </div>
        </motion.div>
      </div>
    </section>
  );
}
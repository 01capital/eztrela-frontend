"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import heroImage from "../public/assets/eztrela-hq-green.png" // your logo/image

export default function HomePage() {  
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">

      {/* HERO SECTION */}
      <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 py-12">
        {/* Left Text */}
        <div className="md:w-1/2 md:pr-6 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Welcome to{" "}
            <span className="text-brandGreen dark:text-brandGreen-light">
              Eztrela AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300"
          >
            Your holistic crypto portfolio platform. Manage multiple wallets, discover new coins,
            and unlock advanced AI insights – all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          >
            <a
              href="#features"
              className="inline-block bg-brandGreen hover:bg-brandGreen-dark text-white px-6 py-3 rounded shadow-md transition-colors"
            >
              Learn More
            </a>
          </motion.div>
        </div>

        {/* Right Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          className="md:w-1/2 mt-8 md:mt-0 flex justify-center"
        >
          {/* 
            Wrap the actual image container in a secondary <motion.div>
            This second <motion.div> only handles the rotation animation,
            repeating every 5 seconds (ease: "linear").
          */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 5,       // spin takes 5 seconds
              ease: "linear",
              repeat: Infinity,  // repeat forever
              repeatType: "loop" // loop continuously
            }}
            className="relative w-full h-64 md:h-96"
          >
            <Image
              src={heroImage}
              alt="Eztrela AI Hero"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-16 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why{" "}
            <span className="text-brandGreen dark:text-brandGreen-light">
              Eztrela AI
            </span>
            ?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            Powerful tools for portfolio management and crypto research.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-2">Manage Multiple Wallets</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Seamlessly handle all your crypto addresses in one place.
              View your combined holdings or dive into each portfolio individually.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our advanced agents generate tailored insights for each portfolio or coin,
              guiding you toward more informed decisions.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-2">Real-Time Exploration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Dive into new tokens or top market coins in real time. Our Explorer page 
              provides on-demand AI-based research for any coin you’re curious about.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PORTFOLIO PAGE SPOTLIGHT */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900 text-black dark:text-white">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-brandGreen dark:text-brandGreen-light">
            The Portfolio Page
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Our Portfolio interface is where you can aggregate all your crypto addresses. 
            View an overview of your holdings, or select individual wallets for a deeper look. 
            Track real-time performance, daily changes, and tailor each wallet to your style.
          </p>
          <a
            href="/portfolio"
            className="bg-brandGreen hover:bg-brandGreen-dark text-white px-6 py-2 rounded shadow-md transition-colors"
          >
            Go to Portfolio
          </a>
        </motion.div>
      </section>

      {/* EXPLORE PAGE SPOTLIGHT */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-brandGreen dark:text-brandGreen-light">
            The Explore Page
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Looking for top tokens or undiscovered altcoins? Our Explore page taps into Eztrela’s 
            real-time data and AI to help you research any coin. Instantly access price movements, 
            emerging trends, and deep analytics for smarter exploration.
          </p>
          <a
            href="/explorer"
            className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded shadow-md transition-colors"
          >
            Go to Explorer
          </a>
        </motion.div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="bg-gray-200 dark:bg-gray-700 py-16 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Take control of your crypto journey. Connect wallets securely, 
            explore the markets, and harness Eztrela’s AI-driven insights to optimize your investments.
          </p>
        </motion.div>
      </section>

      {/* FOOTER WITH CREDITS & LINKS */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-6 px-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          {/* Left: Basic credits */}
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Eztrela. All rights reserved.
          </div>

          {/* Right: Additional links (Twitter, Whitepaper, etc.) */}
          <div className="flex items-center space-x-6">
            <a
              href="https://twitter.com/EztrelaAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Twitter
            </a>
            {/* <a
              href="/whitepaper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Whitepaper
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  )
}

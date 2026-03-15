import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormStepWrapperProps {
  children: React.ReactNode;
  direction: "forward" | "back";
  currentStep: number;
}

const variants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

const FormStepWrapper: React.FC<FormStepWrapperProps> = ({
  children,
  direction,
  currentStep,
}) => {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={currentStep}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default FormStepWrapper;

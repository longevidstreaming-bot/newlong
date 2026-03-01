
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const genres = [
  { name: "Todos", value: "all" },
  { name: "Pop", value: "pop" },
  { name: "Rock", value: "rock" },
  { name: "Sertanejo", value: "sertanejo" },
  { name: "Hip Hop", value: "hiphop" },
  { name: "MPB", value: "mpb" },
  { name: "Eletrônica", value: "eletronica" },
  { name: "Gospel", value: "gospel" },
  { name: "Reggae", value: "reggae" },
  { name: "Metal", value: "metal" },
  { name: "Infantil", value: "infantil" }
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-3 pb-6 overflow-x-auto scrollbar-none">
      {genres.map((category) => (
        <motion.div
          key={category.value}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => onCategoryChange(category.value)}
            className={`whitespace-nowrap transition-all duration-300 font-button rounded-full px-5 py-2 ${
              activeCategory === category.value
                ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-hover)]"
                : "bg-[var(--surface-dark)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-soft)] hover:text-[var(--text-primary)]"
            }`}
          >
            {category.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

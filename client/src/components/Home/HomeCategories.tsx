import { Link } from "react-router-dom";
import { categoriesData } from "../../assets/assets";
import { motion } from "framer-motion";

const HomeCategories = () => {
  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold">Browse Categories</h2>
          <p className="text-sm text-app-text-light mt-1">
            Find exactly what you need using
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div
            className="category-marquee flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          >
            {[...categoriesData, ...categoriesData].map((cat, index) => (
              <Link
                key={`${cat.slug}-${index}`}
                to={`/products?category=${cat.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group flex w-28 shrink-0 flex-col items-center gap-3 p-4 sm:w-36"
              >
                <div className="size-18 sm:size-26 sm:p-2 rounded-2xl overflow-hidden bg-blue-50 group-hover:ring-2 ring-blue-300/75 transition-all">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain rounded-full transition-transform group-hover:scale-105"
                  />
                </div>
                <span className="text-xs font-medium text-zinc-600 text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;
